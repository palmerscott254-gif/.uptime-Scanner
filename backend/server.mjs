import http from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data', 'projects.json');
const PORT = Number(process.env.PORT || 3001);

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const RANGE_LENGTHS = {
  '24h': 12,
  '7d': 7,
  '30d': 10,
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    ...CORS_HEADERS,
    'Content-Type': 'application/json; charset=utf-8',
  });
  res.end(JSON.stringify(payload));
}

async function ensureDataFile() {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, '[]\n', 'utf8');
  }
}

async function readProjects() {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, 'utf8');
  const parsed = JSON.parse(raw || '[]');
  if (Array.isArray(parsed) && parsed.length) {
    return parsed;
  }
  return [];
}

async function writeProjects(projects) {
  await fs.writeFile(DATA_FILE, `${JSON.stringify(projects, null, 2)}\n`, 'utf8');
}

function normalizeUrl(input) {
  const trimmed = String(input ?? '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

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

function slugify(input) {
  return String(input ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generatePublicUrl(name) {
  return `https://${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.example.com`;
}

function createSeries(seed) {
  const make = (length, baseUptime, baseResponse) =>
    Array.from({ length }, (_, index) => ({
      label: `${index + 1}`,
      uptime: Math.max(80, Math.min(100, baseUptime + ((index + seed) % 4) - (index % 5 === 0 ? 2 : 0))),
      response: Math.max(90, Math.min(1200, baseResponse + seed * 14 + index * 10 + (index % 3) * 16)),
    }));

  return {
    '24h': make(12, 95, 160),
    '7d': make(7, 97, 175),
    '30d': make(10, 98, 165),
  };
}

function createMiniSeries(seed) {
  return Array.from({ length: 12 }, (_, index) => ({
    label: `${index}`,
    value: Math.max(78, Math.min(100, 92 + ((index + seed) % 4) - (index % 5 === 0 ? 2 : 0))),
  }));
}

function createLogs(name, status) {
  const primary =
    status === 'down'
      ? {
          message: `${name} probe failed`,
          details: 'Connection timed out after the configured threshold.',
        }
      : status === 'slow'
        ? {
            message: `${name} latency above threshold`,
            details: 'Endpoint returned 200 OK with elevated response time.',
          }
        : {
            message: `${name} probe succeeded`,
            details: 'Endpoint returned 200 OK within the expected latency window.',
          };

  return [
    {
      id: `${name}-log-1`,
      type: 'up',
      message: primary.message,
      timestamp: 'Just now',
      details: primary.details,
    },
    {
      id: `${name}-log-2`,
      type: status,
      message:
        status === 'down'
          ? `${name} incident opened`
          : `${name} latency evaluation in progress`,
      timestamp: '7 min ago',
      details:
        status === 'down'
          ? 'Retry threshold reached after consecutive timeouts.'
          : 'Latency spiked above the warning threshold on the last check.',
    },
    {
      id: `${name}-log-3`,
      type: 'up',
      message: 'Next probe scheduled',
      timestamp: '19 min ago',
      details: 'Monitoring will continue on the configured interval.',
    },
  ];
}

function createProject({ name, url, interval, email, keepAlive, retryThreshold }) {
  const normalizedUrl = normalizeUrl(url);
  const safeName = name?.trim() || extractProjectName(normalizedUrl);
  const id = slugify(safeName) || `project-${Date.now()}`;
  const seed = id.length + interval;

  return {
    id,
    name: safeName,
    url: normalizedUrl,
    status: 'up',
    responseTime: 142 + seed,
    lastChecked: 'Just now',
    interval,
    email,
    alertsEnabled: true,
    keepAlive: Boolean(keepAlive),
    retryThreshold: Number(retryThreshold) || 2,
    tags: ['Custom', 'New'],
    uptimeSeries: createSeries(seed),
    responseSeries: createSeries(seed + 1),
    miniSeries: createMiniSeries(seed),
    logs: createLogs(safeName, 'up'),
  };
}

async function parseBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString('utf8');
  if (!text) return {};
  return JSON.parse(text);
}

function getRangeSeries(project, range, key) {
  const lengths = RANGE_LENGTHS[range] ? range : '24h';
  return project?.[key]?.[lengths] ?? [];
}

function getProjectById(projects, id) {
  return projects.find((project) => project.id === id);
}

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

const server = http.createServer(async (req, res) => {
  if (!req.url || !req.method) {
    sendJson(res, 400, { error: 'Bad request' });
    return;
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const { pathname, searchParams } = url;

  try {
    if (req.method === 'GET' && pathname === '/api/health') {
      sendJson(res, 200, { ok: true, service: 'uptime-scanner-api', timestamp: new Date().toISOString() });
      return;
    }

    if (req.method === 'GET' && pathname === '/api/projects') {
      const projects = await readProjects();
      sendJson(res, 200, { data: projects });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/projects') {
      const body = await parseBody(req);
      if (!body?.url) {
        sendJson(res, 400, { error: 'url is required' });
        return;
      }

      const projects = await readProjects();
      const created = createProject({
        name: body.name,
        url: body.url,
        interval: Number(body.interval) || 1,
        email: body.email || '',
        keepAlive: body.keepAlive,
        retryThreshold: body.retryThreshold,
      });
      projects.unshift(created);
      await writeProjects(projects);
      sendJson(res, 201, { data: created });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/projects/test') {
      const body = await parseBody(req);
      const result = await probeUrl(body?.url);
      sendJson(res, 200, {
        reachable: result.reachable,
        statusCode: result.statusCode,
        responseTime: result.responseTime,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (pathname.startsWith('/api/projects/')) {
      const [, , , id, action] = pathname.split('/');
      const projects = await readProjects();
      const project = getProjectById(projects, id);

      if (!project) {
        sendJson(res, 404, { error: 'Project not found' });
        return;
      }

      if (req.method === 'GET' && !action) {
        sendJson(res, 200, { data: project });
        return;
      }

      if (req.method === 'PATCH' && !action) {
        const body = await parseBody(req);
        const updated = {
          ...project,
          ...body,
          url: body.url ? normalizeUrl(body.url) : project.url,
          name: body.name?.trim() || project.name,
          interval: body.interval ? Number(body.interval) : project.interval,
        };
        const nextProjects = projects.map((item) => (item.id === id ? updated : item));
        await writeProjects(nextProjects);
        sendJson(res, 200, { data: updated });
        return;
      }

      if (req.method === 'DELETE' && !action) {
        const nextProjects = projects.filter((item) => item.id !== id);
        await writeProjects(nextProjects);
        sendJson(res, 200, { success: true });
        return;
      }

      if (req.method === 'GET' && action === 'uptime') {
        const range = searchParams.get('range') || '24h';
        sendJson(res, 200, { data: getRangeSeries(project, range, 'uptimeSeries') });
        return;
      }

      if (req.method === 'GET' && action === 'response') {
        const range = searchParams.get('range') || '24h';
        sendJson(res, 200, { data: getRangeSeries(project, range, 'responseSeries') });
        return;
      }

      if (req.method === 'GET' && action === 'logs') {
        const limit = Number(searchParams.get('limit') || 20);
        sendJson(res, 200, { data: project.logs.slice(0, Math.max(1, limit)) });
        return;
      }
    }

    sendJson(res, 404, { error: 'Not found' });
  } catch (error) {
    console.error('API error:', error);
    sendJson(res, 500, { error: 'Internal server error' });
  }
});

server.listen(PORT, () => {
  console.log(`Uptime Scanner API running on http://localhost:${PORT}`);
});
