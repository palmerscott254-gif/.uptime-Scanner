# Uptime Scanner - Monitor Engine Documentation

## Overview

The new **Monitor Engine** is a production-ready monitoring system that continuously checks URLs, maintains persistent storage, logs incidents, and manages status updates automatically.

---

## Architecture

### Three-Layer System

```
┌─────────────────────────────────────────────┐
│         server.mjs (HTTP API)               │
│  ✓ CRUD operations                          │
│  ✓ Integrates monitor engine                │
│  ✓ Graceful startup/shutdown                │
└─────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────┐
│    monitorEngine.js (Scheduler)             │
│  ✓ Manages setInterval timers               │
│  ✓ Starts/stops individual monitors         │
│  ✓ Handles server startup/shutdown          │
└─────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────┐
│   checker.js (URL Checking)                 │
│  ✓ Fetches URLs with timeout                │
│  ✓ Logs status changes                      │
│  ✓ Manages retry threshold                  │
└─────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────┐
│    storage.js (Data Persistence)            │
│  ✓ Projects, Logs, Incidents separate files │
│  ✓ Automatic recovery on corruption         │
│  ✓ Bounded growth (1000 logs per project)   │
└─────────────────────────────────────────────┘
```

---

## File Structure

```
backend/
├── server.mjs           # HTTP server + API endpoints
├── monitorEngine.js     # Scheduling layer
├── checker.js           # URL checking logic
├── storage.js           # Persistent storage
└── data/
    ├── projects.json    # All monitored projects
    ├── logs.json        # All check logs
    └── incidents.json   # Incident history
```

---

## How It Works

### 1. **Server Startup Flow**

```javascript
Server starts
  ↓
initializeStorage() - Create data directory and files
  ↓
loadAllMonitors() - Read projects.json and start all monitors
  ↓
setupGracefulShutdown() - Register SIGTERM/SIGINT handlers
  ↓
server.listen(3001)
  ↓
Ready to accept API requests
```

### 2. **Monitor Lifecycle**

When a **project is created** via `POST /api/projects`:

```javascript
createProject()            // Create project object
    ↓
writeProjects()            // Save to projects.json
    ↓
startMonitor(project)      // Start monitoring
    ↓
checkProject()             // Immediate check
    ↓
setInterval()              // Schedule recurring checks
```

When a **project interval is updated** via `PATCH /api/projects/{id}`:

```javascript
updateProject()            // Update in storage
    ↓
stopMonitor()              // Clear old interval
    ↓
startMonitor()             // Create new interval
```

When a **project is deleted** via `DELETE /api/projects/{id}`:

```javascript
stopMonitor()              // Stop the timer
    ↓
deleteProject()            // Remove from projects.json
```

---

### 3. **URL Checking Process**

For each monitor on its interval:

```
Check starts
  ↓
Fetch URL with 10s timeout
  ↓
Measure response time
  ↓
  ├─ If timeout/error:
  │  └─ Increment failure counter (retry threshold tracking)
  │     └─ If failures >= retryThreshold: mark DOWN
  │
  ├─ If HTTP error (4xx, 5xx):
  │  └─ Mark DOWN
  │
  ├─ If response time > 3000ms:
  │  └─ Mark SLOW
  │
  └─ If 2xx response:
     └─ Mark UP (reset failure counter)
  ↓
updateProjectStatus()      // Update status, lastChecked
  ↓
Check incident state:
  ├─ UP → DOWN = createIncident()
  ├─ DOWN → UP = resolveIncident()
  └─ Same status = no change
  ↓
createLog()                // Add to logs.json
  ↓
Frontend sees update on next fetch
```

---

### 4. **Retry Threshold**

If `retryThreshold = 3`:

```
Check 1: Timeout     → failures = 1 → log warning
Check 2: Timeout     → failures = 2 → log warning
Check 3: Timeout     → failures = 3 → mark DOWN, create incident

(assuming no successes between)
```

This prevents **false alarms** from temporary network issues.

---

### 5. **Incident Tracking**

When a project status changes:

**UP → DOWN:**
- Create incident: `{ projectId, startedAt, reason }`
- Log: "Project went DOWN"

**DOWN → UP:**
- Resolve incident: Add `resolvedAt`, calculate `duration`
- Log: "Project is back UP"

**GET /api/projects/{id}/incidents** returns:

```json
[
  {
    "id": "incident-1234567890-abc123",
    "projectId": "my-website",
    "startedAt": "2024-05-02T10:30:00Z",
    "resolvedAt": "2024-05-02T11:45:00Z",
    "duration": 4500000,
    "reason": "Health check failed"
  }
]
```

---

## API Endpoints

### Create Project

```bash
POST /api/projects
Content-Type: application/json

{
  "url": "https://example.com",
  "name": "My Website",
  "interval": 5,           # minutes
  "email": "ops@example.com",
  "keepAlive": false,
  "retryThreshold": 2
}
```

**Response:**
```json
{
  "data": {
    "id": "my-website",
    "status": "pending",     # will be "up/down/slow" after first check
    "lastChecked": null,
    "responseTime": null,
    ...
  }
}
```

### Get Project Logs

```bash
GET /api/projects/{id}/logs?limit=50
```

**Response:**
```json
{
  "data": [
    {
      "id": "log-1234567890-abc",
      "projectId": "my-website",
      "type": "up",
      "message": "My Website is UP",
      "timestamp": "2024-05-02T10:35:00Z",
      "responseTime": 245,
      "details": "HTTP 200 - 245ms"
    },
    ...
  ]
}
```

### Get Project Incidents

```bash
GET /api/projects/{id}/incidents?limit=20
```

---

## Storage Details

### projects.json

```json
[
  {
    "id": "my-website",
    "name": "My Website",
    "url": "https://example.com",
    "status": "up",
    "responseTime": 245,
    "lastChecked": "2024-05-02T10:35:00Z",
    "interval": 5,
    "email": "ops@example.com",
    "alertsEnabled": true,
    "keepAlive": false,
    "retryThreshold": 2,
    "tags": ["Production"],
    "uptimeSeries": {},
    "responseSeries": {},
    "miniSeries": [],
    "logs": []
  }
]
```

### logs.json

Stores **all check results** across all projects:

```json
[
  {
    "id": "log-1234567890-abc",
    "projectId": "my-website",
    "type": "up",                    # "up" | "down" | "slow" | "warning"
    "message": "My Website is UP",
    "timestamp": "2024-05-02T10:35:00Z",
    "responseTime": 245,
    "details": "HTTP 200 - 245ms"
  }
]
```

**Note:** Bounded to 1000 logs per project to prevent unbounded growth.

### incidents.json

Tracks downtime events:

```json
[
  {
    "id": "incident-1234567890-abc",
    "projectId": "my-website",
    "startedAt": "2024-05-02T10:30:00Z",
    "resolvedAt": "2024-05-02T11:45:00Z",
    "duration": 4500000,              # milliseconds
    "reason": "Health check failed"
  }
]
```

---

## Key Features

### ✓ Memory Safe
- Uses `Map` to track timers
- Clear intervals on delete/update
- No memory leaks on server restart

### ✓ Persistent
- All data saved to JSON files
- Survives server restart
- Auto-recovery from corruption

### ✓ Reliable Monitoring
- Retry threshold prevents false alarms
- Timeout handling (10 second max wait)
- Immediate + scheduled checks

### ✓ Incident Tracking
- Automatic incident creation on DOWN
- Automatic resolution on UP
- Duration calculation in milliseconds

### ✓ Graceful Shutdown
- Handles SIGTERM/SIGINT
- Clears all intervals
- Logs shutdown message

---

## Running the System

### Development

**Terminal 1 - Backend API:**
```bash
npm run api
# Output:
# ✓ Storage initialized
# ▶️  Loading monitors from storage...
# ✓ Uptime Scanner API running on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Frontend at http://localhost:5173
```

### Adding a Monitor

1. Go to http://localhost:5173
2. Click "Add Project"
3. Enter URL, name, interval
4. Click "Create"

Backend logs show:
```
⏱️  Starting monitor: My Website (interval: 5min)
✓ Storage initialized
🔄 My Website: PENDING → UP
📊 Health check: http://localhost:3001/api/health
```

### Checking Project Status

```bash
curl http://localhost:3001/api/projects/my-website
```

See **status**, **lastChecked**, **responseTime**.

### Viewing Logs

```bash
curl http://localhost:3001/api/projects/my-website/logs?limit=10
```

### Viewing Incidents

```bash
curl http://localhost:3001/api/projects/my-website/incidents?limit=10
```

---

## Production Deployment

### Environment Variables

```bash
PORT=3001
VITE_API_BASE_URL=https://api.your-domain.com
```

### Systemd Service (Linux)

Create `/etc/systemd/system/uptime-scanner.service`:

```ini
[Unit]
Description=Uptime Scanner Monitor Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/app/uptime-scanner
Environment="PORT=3001"
ExecStart=/usr/bin/node backend/server.mjs
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable uptime-scanner
sudo systemctl start uptime-scanner
sudo systemctl logs -u uptime-scanner -f
```

### Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY . .

EXPOSE 3001

CMD ["node", "backend/server.mjs"]
```

---

## Future Improvements

### Short Term
- [ ] WebSocket for real-time frontend updates
- [ ] Email alerts on incident
- [ ] SSL certificate validation
- [ ] Custom HTTP headers/auth

### Medium Term
- [ ] SQLite/PostgreSQL backend
- [ ] Redis for caching
- [ ] BullMQ for retry logic
- [ ] Slack/Discord alerts

### Long Term
- [ ] Multi-region checking
- [ ] Load balancing
- [ ] Distributed architecture
- [ ] Uptime SLA reporting

---

## Troubleshooting

### Projects not monitoring after restart

**Problem:** Projects don't start monitoring on server restart.

**Solution:** 
1. Check `backend/data/projects.json` exists
2. Verify projects have `interval` field set
3. Check logs for errors

### Negative response times in logs

**Problem:** `responseTime: null` or missing values

**Solution:** This is expected for timeout/errors. Check the `message` and `details` fields.

### "Project with this URL already exists"

**Problem:** Can't add a project

**Solution:** Delete the existing project first, or use a different URL.

### Memory growing unbounded

**Problem:** RAM usage increases over time

**Solution:** Check that `projects.json` isn't extremely large. Logs are bounded to 1000 per project.

---

## Contributing

To extend the monitor engine:

1. **Add new check types** → Modify `checker.js` `checkProject()`
2. **Add new storage fields** → Update `storage.js` schemas
3. **Add new API endpoints** → Update `server.mjs` route handlers
4. **Change check logic** → Modify `monitorEngine.js` `startMonitor()`

---

**Built with ❤️ for reliable uptime monitoring**
