import {
  createLog,
  updateProject,
  createIncident,
  resolveIncident,
  getCurrentIncident,
} from './storage.js';

/**
 * Normalize URL to always have protocol
 */
function normalizeUrl(url) {
  const trimmed = String(url ?? '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(url, timeout = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'UptimeScanner/1.0 (Monitor Service)',
      },
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Check a single project's URL
 * Returns: { status: 'up' | 'down' | 'slow', responseTime: number, statusCode: number }
 */
export async function checkProject(project) {
  const start = Date.now();
  const url = normalizeUrl(project.url);

  if (!url || !/^https?:\/\//.test(url)) {
    await createLog(project.id, 'down', null, 'Invalid URL', 'URL is malformed or empty');
    return { status: 'down', responseTime: null, statusCode: 0 };
  }

  try {
    const response = await fetchWithTimeout(url, 10000);
    const responseTime = Date.now() - start;

    let status = 'up';
    let message = `${project.name} is UP`;
    let details = `HTTP ${response.status} - ${responseTime}ms`;

    // Determine status based on response code and response time
    if (!response.ok) {
      status = 'down';
      message = `${project.name} returned HTTP ${response.status}`;
      details = `Unexpected status code: ${response.status}`;
    } else if (responseTime > 3000) {
      status = 'slow';
      message = `${project.name} is SLOW`;
      details = `Response time exceeded 3000ms: ${responseTime}ms`;
    }

    // Handle failure accumulation (retry threshold)
    const failureCountKey = `${project.id}:failures`;
    let failureCount = parseInt(global[failureCountKey] || 0);

    if (status === 'down') {
      failureCount += 1;
      global[failureCountKey] = failureCount;

      if (failureCount < project.retryThreshold || project.retryThreshold === 1) {
        // Mark as down immediately or after reaching threshold
        await updateProjectStatus(project, 'down', responseTime);
        await createLog(project.id, 'down', responseTime, message, details);
      }
    } else {
      // Reset failure counter on success
      if (failureCount > 0) {
        global[failureCountKey] = 0;
      }
      await updateProjectStatus(project, status, responseTime);
      await createLog(project.id, status, responseTime, message, details);
    }

    return { status, responseTime, statusCode: response.status };
  } catch (error) {
    const failureCountKey = `${project.id}:failures`;
    let failureCount = parseInt(global[failureCountKey] || 0);
    failureCount += 1;
    global[failureCountKey] = failureCount;

    const isTimeout = error.name === 'AbortError';
    const errorMessage = isTimeout ? 'Request timeout' : error.message;
    const details = `${errorMessage} (Attempt ${failureCount}/${project.retryThreshold})`;

    // Only mark as down when failure threshold is reached
    if (failureCount >= project.retryThreshold) {
      await updateProjectStatus(project, 'down', null);
      await createLog(
        project.id,
        'down',
        null,
        `${project.name} is DOWN`,
        details,
      );
    } else {
      // Log warning but don't mark down yet
      await createLog(
        project.id,
        'warning',
        null,
        `${project.name} check failed`,
        details,
      );
    }

    return { status: 'down', responseTime: null, statusCode: 0 };
  }
}

/**
 * Update project status and handle incident tracking
 */
async function updateProjectStatus(project, newStatus, responseTime) {
  const previousStatus = project.status;
  const now = new Date().toISOString();

  // Update project
  await updateProject(project.id, {
    status: newStatus,
    responseTime: responseTime || project.responseTime,
    lastChecked: now,
  });

  // Handle incident state transitions
  if (previousStatus !== 'down' && newStatus === 'down') {
    // Incident opened
    const incident = await createIncident(project.id, 'Health check failed');
    console.log(`📍 [INCIDENT] ${project.name} went DOWN - Incident #${incident.id}`);
  } else if (previousStatus === 'down' && newStatus !== 'down') {
    // Incident resolved
    const incident = await resolveIncident(project.id);
    if (incident) {
      const durationMs = new Date(incident.resolvedAt) - new Date(incident.startedAt);
      const durationMin = Math.round(durationMs / 60000);
      console.log(`✓ [RESOLVED] ${project.name} is back UP - Duration: ${durationMin}min`);
    }
  }

  // Log status change
  if (previousStatus !== newStatus) {
    console.log(
      `🔄 ${project.name}: ${previousStatus.toUpperCase()} → ${newStatus.toUpperCase()}`,
    );
  }
}
