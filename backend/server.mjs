import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

// Import storage and monitor engine
import {
  initializeStorage,
  readProjects,
  writeProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectLogs,
  getProjectIncidents,
} from './storage.js';

import {
  startMonitor,
  stopMonitor,
  loadAllMonitors,
  getMonitorStatus,
  stopAllMonitors,
  setupGracefulShutdown,
} from './monitorEngine.js';

import { checkProject } from './checker.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3001);

const ALLOWED_ORIGINS = [
  'https://uptime-scanner.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
];

function buildCorsHeaders(req) {
  const origin = req.headers.origin || req.headers.Origin || '';
  const allowed = ALLOWED_ORIGINS.includes(origin);
  const headers = {
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  if (allowed) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  }
  return headers;
}

function sendJson(req, res, statusCode, payload) {
  const cors = buildCorsHeaders(req);
  res.writeHead(statusCode, {
    ...cors,
    'Content-Type': 'application/json; charset=utf-8',
  });
  res.end(JSON.stringify(payload));
}

/**
 * Normalize URL to begin with http(s)
 */
function normalizeUrl(input) {
  const trimmed = String(input ?? '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/**
 * Extract project name from URL
 */
function extractProjectName(url) {
  try {
    const parsed = new URL(normalizeUrl(url));
    const host = parsed.hostname.replace(/^www\./i, '');
    const segments = parsed.pathname.split('/').filter(Boolean);
    const base = segments[0] ? `${host}/${segments[0]}` : host;
    return base
      .split(/[./-]/)
      .filter(Boolean)
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  } catch {
    return 'New Project';
  }
}

/**
 * Slug a string for project IDs
 */
function slugify(input) {
  return String(input ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Parse JSON body from request
 */
async function parseBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString('utf8');
  if (!text) return {};
  return JSON.parse(text);
}

/**
 * Probe a URL to check if it's reachable
 */
async function probeUrl(url) {
  const normalized = normalizeUrl(url);
  if (!/^https?:\/\//i.test(normalized)) {
    return { reachable: false, statusCode: 0, responseTime: null };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  const start = Date.now();

  try {
    let response = await fetch(normalized, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
    });

    if (response.status === 405 || response.status === 501) {
      response = await fetch(normalized, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
      });
    }

    const responseTime = Date.now() - start;
    return {
      reachable: response.ok,
      statusCode: response.status,
      responseTime,
    };
  } catch {
    return { reachable: false, statusCode: 0, responseTime: null };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Create new project object
 */
function createProject({ name, url, interval, email, keepAlive, retryThreshold }) {
  const normalizedUrl = normalizeUrl(url);
  const safeName = name?.trim() || extractProjectName(normalizedUrl);
  const id = slugify(safeName) || `project-${Date.now()}`;

  return {
    id,
    name: safeName,
    url: normalizedUrl,
    status: 'pending',
    responseTime: null,
    lastChecked: null,
    interval: Math.max(1, Number(interval) || 1),
    email: email || '',
    alertsEnabled: true,
    keepAlive: Boolean(keepAlive) || false,
    retryThreshold: Math.max(1, Number(retryThreshold) || 2),
    tags: ['Custom'],
    uptimeSeries: {},
    responseSeries: {},
    miniSeries: [],
    logs: [],
  };
}

/**
 * HTTP Server
 */
const server = http.createServer(async (req, res) => {
  if (!req.url || !req.method) {
    sendJson(req, res, 400, { error: 'Bad request' });
    return;
  }

  if (req.method === 'OPTIONS') {
    const cors = buildCorsHeaders(req);
    res.writeHead(204, { ...cors });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const { pathname, searchParams } = url;

  try {
    // Health check endpoint
    if (req.method === 'GET' && pathname === '/api/health') {
      sendJson(req, res, 200, {
        ok: true,
        service: 'uptime-scanner-api',
        monitors: getMonitorStatus(),
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Get all projects
    if (req.method === 'GET' && pathname === '/api/projects') {
      const projects = await readProjects();
      sendJson(req, res, 200, { data: projects });
      return;
    }

    // Create new project
    if (req.method === 'POST' && pathname === '/api/projects') {
      const body = await parseBody(req);
      if (!body?.url) {
        sendJson(req, res, 400, { error: 'url is required' });
        return;
      }

      const projects = await readProjects();
      const newProject = createProject({
        name: body.name,
        url: body.url,
        interval: body.interval,
        email: body.email,
        keepAlive: body.keepAlive,
        retryThreshold: body.retryThreshold,
      });

      // Check if project with same URL already exists
      if (projects.some((p) => p.url === newProject.url)) {
        sendJson(req, res, 400, { error: 'Project with this URL already exists' });
        return;
      }

      projects.unshift(newProject);
      await writeProjects(projects);

      // Start monitoring this project
      startMonitor(newProject);

      sendJson(req, res, 201, { data: newProject });
      return;
    }

    // Test URL probe
    if (req.method === 'POST' && pathname === '/api/projects/test') {
      const body = await parseBody(req);
      const result = await probeUrl(body?.url);
      sendJson(req, res, 200, {
        reachable: result.reachable,
        statusCode: result.statusCode,
        responseTime: result.responseTime,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Project-specific endpoints
    if (pathname.startsWith('/api/projects/')) {
      const parts = pathname.split('/').filter(Boolean);
      const id = parts[2];
      const action = parts[3];

      if (!id || (action && !['logs', 'incidents'].includes(action))) {
        sendJson(req, res, 404, { error: 'Not found' });
        return;
      }

      const project = await getProjectById(id);
      if (!project) {
        sendJson(req, res, 404, { error: 'Project not found' });
        return;
      }

      // Get single project
      if (req.method === 'GET' && !action) {
        sendJson(req, res, 200, { data: project });
        return;
      }

      // Update project
      if (req.method === 'PATCH' && !action) {
        const body = await parseBody(req);

        const updated = {
          ...project,
          ...(body.name && { name: body.name.trim() }),
          ...(body.url && { url: normalizeUrl(body.url) }),
          ...(body.interval !== undefined && { interval: Math.max(1, Number(body.interval)) }),
          ...(body.email !== undefined && { email: body.email }),
          ...(body.keepAlive !== undefined && { keepAlive: Boolean(body.keepAlive) }),
          ...(body.retryThreshold !== undefined && {
            retryThreshold: Math.max(1, Number(body.retryThreshold)),
          }),
          ...(body.alertsEnabled !== undefined && { alertsEnabled: Boolean(body.alertsEnabled) }),
        };

        await updateProject(id, updated);

        // If interval changed, restart monitor
        if (body.interval !== undefined && body.interval !== project.interval) {
          stopMonitor(id);
          startMonitor(updated);
        }

        sendJson(req, res, 200, { data: updated });
        return;
      }

      // Delete project
      if (req.method === 'DELETE' && !action) {
        stopMonitor(id);
        await deleteProject(id);
        sendJson(req, res, 200, { success: true });
        return;
      }

      // Get project logs
      if (req.method === 'GET' && action === 'logs') {
        const limit = Number(searchParams.get('limit') || 100);
        const logs = await getProjectLogs(id, limit);
        sendJson(req, res, 200, { data: logs });
        return;
      }

      // Get project incidents
      if (req.method === 'GET' && action === 'incidents') {
        const limit = Number(searchParams.get('limit') || 100);
        const incidents = await getProjectIncidents(id, limit);
        sendJson(req, res, 200, { data: incidents });
        return;
      }
    }

    sendJson(req, res, 404, { error: 'Not found' });
  } catch (error) {
    console.error('API error:', error);
    sendJson(req, res, 500, { error: 'Internal server error' });
  }
});

/**
 * Server startup
 */
async function startServer() {
  try {
    // Initialize storage
    await initializeStorage();

    // Load all projects and start monitoring
    await loadAllMonitors();

    // Setup graceful shutdown
    setupGracefulShutdown();

    // Start HTTP server
    server.listen(PORT, () => {
      console.log(`\n✓ Uptime Scanner API running on http://localhost:${PORT}`);
      console.log(`📊 Dashboard: http://localhost:5173`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
