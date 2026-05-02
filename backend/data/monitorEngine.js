import { readProjects, getProjectById } from './storage.js';
import { checkProject } from './checker.js';

/**
 * Monitor Engine - manages active monitoring tasks
 * Maps project IDs to their setInterval timers
 */
const activeMonitors = new Map();

/**
 * Start monitoring a single project
 * Creates an interval timer that runs checks periodically
 */
export function startMonitor(project) {
  // Clear existing monitor if any
  stopMonitor(project.id);

  // Convert interval from minutes to milliseconds
  const intervalMs = Math.max(1, project.interval) * 60 * 1000;

  console.log(`⏱️  Starting monitor: ${project.name} (interval: ${project.interval}min)`);

  // Perform immediate check
  checkProject(project).catch((error) => {
    console.error(`Check failed for ${project.name}:`, error);
  });

  // Schedule recurring checks
  const timerId = setInterval(
    async () => {
      try {
        const updated = await getProjectById(project.id);
        if (updated) {
          await checkProject(updated);
        }
      } catch (error) {
        console.error(`Check interval failed for ${project.id}:`, error);
      }
    },
    intervalMs,
  );

  activeMonitors.set(project.id, { timerId, interval: project.interval, name: project.name });
}

/**
 * Stop monitoring a project
 * Clears the interval timer and removes from tracking
 */
export function stopMonitor(projectId) {
  if (activeMonitors.has(projectId)) {
    const { timerId, name } = activeMonitors.get(projectId);
    clearInterval(timerId);
    activeMonitors.delete(projectId);
    console.log(`⏹️  Stopped monitor: ${name}`);
  }
}

/**
 * Load and start all monitors
 * Called on server startup
 */
export async function loadAllMonitors() {
  console.log('\n▶️  Loading monitors from storage...\n');

  const projects = await readProjects();

  if (projects.length === 0) {
    console.log('  No projects found. Waiting for new projects...\n');
    return;
  }

  console.log(`  Found ${projects.length} project(s). Starting monitors...\n`);

  for (const project of projects) {
    startMonitor(project);
  }

  console.log(`\n✓ All ${projects.length} monitor(s) started\n`);
}

/**
 * Restart monitoring for a project
 * Used when project settings change (e.g., interval updated)
 */
export async function restartMonitor(projectId) {
  const project = await checkProject(projectId);
  if (project) {
    stopMonitor(projectId);
    startMonitor(project);
  }
}

/**
 * Get status of all active monitors
 */
export function getMonitorStatus() {
  const monitors = Array.from(activeMonitors.entries()).map(([id, { name, interval }]) => ({
    projectId: id,
    projectName: name,
    interval,
    status: 'active',
  }));

  return {
    total: monitors.length,
    monitors,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Stop all monitors
 * Used during graceful shutdown
 */
export function stopAllMonitors() {
  console.log('\n⏹️  Stopping all monitors...');

  for (const [projectId] of activeMonitors) {
    stopMonitor(projectId);
  }

  console.log(`✓ All monitors stopped\n`);
}

/**
 * Handle graceful shutdown
 */
export function setupGracefulShutdown() {
  process.on('SIGTERM', () => {
    console.log('\n📴 SIGTERM received, gracefully shutting down...');
    stopAllMonitors();
    process.exit(0);
  });

  process.on('SIGINT', () => {
    console.log('\n📴 SIGINT received, gracefully shutting down...');
    stopAllMonitors();
    process.exit(0);
  });
}
