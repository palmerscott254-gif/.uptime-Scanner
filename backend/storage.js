import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');

const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const LOGS_FILE = path.join(DATA_DIR, 'logs.json');
const INCIDENTS_FILE = path.join(DATA_DIR, 'incidents.json');

/**
 * Ensure data directory and files exist
 */
export async function initializeStorage() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });

    // Initialize projects.json
    try {
      await fs.access(PROJECTS_FILE);
    } catch {
      await fs.writeFile(PROJECTS_FILE, '[]\n', 'utf8');
    }

    // Initialize logs.json
    try {
      await fs.access(LOGS_FILE);
    } catch {
      await fs.writeFile(LOGS_FILE, '[]\n', 'utf8');
    }

    // Initialize incidents.json
    try {
      await fs.access(INCIDENTS_FILE);
    } catch {
      await fs.writeFile(INCIDENTS_FILE, '[]\n', 'utf8');
    }

    console.log('✓ Storage initialized');
  } catch (error) {
    console.error('Failed to initialize storage:', error);
    throw error;
  }
}

/**
 * Read all projects
 */
export async function readProjects() {
  try {
    const raw = await fs.readFile(PROJECTS_FILE, 'utf8');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to read projects:', error);
    return [];
  }
}

/**
 * Write projects
 */
export async function writeProjects(projects) {
  try {
    await fs.writeFile(PROJECTS_FILE, `${JSON.stringify(projects, null, 2)}\n`, 'utf8');
  } catch (error) {
    console.error('Failed to write projects:', error);
    throw error;
  }
}

/**
 * Get single project by ID
 */
export async function getProjectById(id) {
  const projects = await readProjects();
  return projects.find((p) => p.id === id);
}

/**
 * Update single project
 */
export async function updateProject(id, updates) {
  const projects = await readProjects();
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) return null;

  projects[index] = { ...projects[index], ...updates };
  await writeProjects(projects);
  return projects[index];
}

/**
 * Delete project
 */
export async function deleteProject(id) {
  const projects = await readProjects();
  const filtered = projects.filter((p) => p.id !== id);
  await writeProjects(filtered);
}

/**
 * Read all logs
 */
export async function readAllLogs() {
  try {
    const raw = await fs.readFile(LOGS_FILE, 'utf8');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to read logs:', error);
    return [];
  }
}

/**
 * Write logs
 */
export async function writeAllLogs(logs) {
  try {
    await fs.writeFile(LOGS_FILE, `${JSON.stringify(logs, null, 2)}\n`, 'utf8');
  } catch (error) {
    console.error('Failed to write logs:', error);
    throw error;
  }
}

/**
 * Create log entry
 */
export async function createLog(projectId, status, responseTime, message, details = '') {
  const logs = await readAllLogs();
  const log = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    projectId,
    type: status,
    message,
    timestamp: new Date().toISOString(),
    responseTime,
    details: details || '',
  };
  logs.unshift(log);
  // Keep only last 1000 logs per project to avoid unbounded growth
  const projectLogs = logs.filter((l) => l.projectId === projectId);
  if (projectLogs.length > 1000) {
    const logsToKeep = new Set(projectLogs.slice(0, 1000).map((l) => l.id));
    logs = logs.filter((l) => l.projectId !== projectId || logsToKeep.has(l.id));
  }
  await writeAllLogs(logs);
  return log;
}

/**
 * Get logs for project
 */
export async function getProjectLogs(projectId, limit = 100) {
  const allLogs = await readAllLogs();
  return allLogs.filter((l) => l.projectId === projectId).slice(0, limit);
}

/**
 * Read all incidents
 */
export async function readAllIncidents() {
  try {
    const raw = await fs.readFile(INCIDENTS_FILE, 'utf8');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to read incidents:', error);
    return [];
  }
}

/**
 * Write incidents
 */
export async function writeAllIncidents(incidents) {
  try {
    await fs.writeFile(INCIDENTS_FILE, `${JSON.stringify(incidents, null, 2)}\n`, 'utf8');
  } catch (error) {
    console.error('Failed to write incidents:', error);
    throw error;
  }
}

/**
 * Create incident (when status changes to DOWN)
 */
export async function createIncident(projectId, reason = '') {
  const incidents = await readAllIncidents();
  const incident = {
    id: `incident-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    projectId,
    startedAt: new Date().toISOString(),
    resolvedAt: null,
    duration: null,
    reason: reason || 'Health check failed',
  };
  incidents.unshift(incident);
  await writeAllIncidents(incidents);
  return incident;
}

/**
 * Resolve incident (when status changes back to UP)
 */
export async function resolveIncident(projectId) {
  const incidents = await readAllIncidents();
  const incident = incidents.find((i) => i.projectId === projectId && !i.resolvedAt);

  if (!incident) return null;

  incident.resolvedAt = new Date().toISOString();
  incident.duration = new Date(incident.resolvedAt) - new Date(incident.startedAt);

  await writeAllIncidents(incidents);
  return incident;
}

/**
 * Get active incidents for project
 */
export async function getProjectIncidents(projectId, limit = 100) {
  const allIncidents = await readAllIncidents();
  return allIncidents.filter((i) => i.projectId === projectId).slice(0, limit);
}

/**
 * Get current incident for project (unresolved)
 */
export async function getCurrentIncident(projectId) {
  const incidents = await readAllIncidents();
  return incidents.find((i) => i.projectId === projectId && !i.resolvedAt);
}
