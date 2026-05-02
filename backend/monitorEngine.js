import { getProjectById, readProjects } from './storage.js';
import { checkProject } from './checker.js';

const monitors = new Map();
let shutdownHookInstalled = false;

function getIntervalMs(project) {
  const minutes = Math.max(1, Number(project?.interval) || 1);
  return minutes * 60_000;
}

async function runCheck(projectId) {
  const project = await getProjectById(projectId);
  if (!project) {
    return;
  }

  try {
    await checkProject(project);
  } catch (error) {
    console.error(`[monitor] check failed for ${projectId}:`, error);
  }
}

export function startMonitor(project) {
  if (!project?.id) return null;

  const existing = monitors.get(project.id);
  if (existing) {
    clearInterval(existing.timer);
    clearTimeout(existing.initialTimer);
    monitors.delete(project.id);
  }

  const state = {
    projectId: project.id,
    intervalMs: getIntervalMs(project),
    startedAt: new Date().toISOString(),
    lastRunAt: null,
    timer: null,
    initialTimer: null,
    running: false,
  };

  const execute = async () => {
    if (state.running) return;
    state.running = true;
    state.lastRunAt = new Date().toISOString();
    try {
      await runCheck(project.id);
    } finally {
      state.running = false;
    }
  };

  // Run once immediately, then continue on interval.
  state.initialTimer = setTimeout(() => {
    execute();
  }, 0);

  state.timer = setInterval(() => {
    execute();
  }, state.intervalMs);

  monitors.set(project.id, state);
  return state;
}

export function stopMonitor(projectId) {
  const state = monitors.get(projectId);
  if (!state) return false;

  clearInterval(state.timer);
  clearTimeout(state.initialTimer);
  monitors.delete(projectId);
  return true;
}

export async function loadAllMonitors() {
  const projects = await readProjects();
  for (const project of projects) {
    startMonitor(project);
  }
  return monitors.size;
}

export function restartMonitor(projectId) {
  stopMonitor(projectId);
  return getProjectById(projectId).then((project) => {
    if (project) {
      return startMonitor(project);
    }
    return null;
  });
}

export function getMonitorStatus() {
  return Array.from(monitors.values()).map((state) => ({
    projectId: state.projectId,
    intervalMs: state.intervalMs,
    startedAt: state.startedAt,
    lastRunAt: state.lastRunAt,
    running: state.running,
  }));
}

export function stopAllMonitors() {
  for (const [projectId, state] of monitors.entries()) {
    clearInterval(state.timer);
    clearTimeout(state.initialTimer);
    monitors.delete(projectId);
  }
}

export function setupGracefulShutdown() {
  if (shutdownHookInstalled) return;
  shutdownHookInstalled = true;

  const shutdown = (signal) => {
    console.log(`[monitor] received ${signal}, stopping monitors...`);
    stopAllMonitors();
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}
