# Monitor Engine - Quick Start Guide

## What's New?

You now have a **production-ready monitoring engine** that:
- ✅ Continuously monitors URLs on configurable intervals
- ✅ Automatically starts monitors when projects are added
- ✅ Tracks incidents (when sites go down/come back up)
- ✅ Logs every check result with response times
- ✅ Survives restarts (persistent storage)
- ✅ Prevents false alarms with retry thresholds

---

## 1. Start the Backend

```bash
npm run api
```

Expected output:
```
✓ Storage initialized
▶️  Loading monitors from storage...

  No projects found. Waiting for new projects...

✓ Uptime Scanner API running on http://localhost:3001
📊 Dashboard: http://localhost:5173
🏥 Health check: http://localhost:3001/api/health
```

---

## 2. Start the Frontend (new terminal)

```bash
npm run dev
```

Open http://localhost:5173

---

## 3. Add Your First Monitor

In the dashboard:

1. Click **"Add Project"** (or use the button in the left sidebar)
2. Enter:
   - **URL**: `https://github.com` (or any site)
   - **Name**: `GitHub` (auto-detected)
   - **Check Interval**: `1` minute
   - **Retry Threshold**: `2` (mark DOWN after 2 failures)
3. Click **"Create"**

Check backend console - you'll see:
```
⏱️  Starting monitor: GitHub (interval: 1min)
Check failed for github...
🔄 GitHub: PENDING → UP
```

---

## 4. Monitor in Real-Time

### View Project Logs

```bash
curl http://localhost:3001/api/projects/github/logs?limit=5
```

Response:
```json
{
  "data": [
    {
      "id": "log-1714727400000-abc123",
      "projectId": "github",
      "type": "up",
      "message": "GitHub is UP",
      "timestamp": "2024-05-02T10:30:00.000Z",
      "responseTime": 412,
      "details": "HTTP 200 - 412ms"
    }
  ]
}
```

### View Project Status

```bash
curl http://localhost:3001/api/projects/github | jq .
```

### View Incidents

```bash
curl http://localhost:3001/api/projects/github/incidents
```

---

## 5. Test with a Local Service

Want to test the downtime detection?

### Create a test server (Terminal 3)

```bash
# Create a simple Node server that starts in UP state
cat > /tmp/test-server.js << 'EOF'
import http from 'http';

let isUp = true;

http.createServer((req, res) => {
  if (!isUp) {
    res.writeHead(503);
    res.end('Service Down');
    return;
  }
  res.writeHead(200);
  res.end('OK');
}).listen(8888);

console.log('Test server running on http://localhost:8888');

// Toggle down/up every 30 seconds
setInterval(() => {
  isUp = !isUp;
  console.log(`Toggle: now ${isUp ? 'UP ✓' : 'DOWN ✗'}`);
}, 30000);
EOF

node /tmp/test-server.js
```

### Add as monitor

1. In dashboard, add project: `http://localhost:8888`
2. Set interval to **1 minute** (for faster testing)
3. Watch backend logs as it goes UP → DOWN → UP

Backend output:
```
⏱️  Starting monitor: Localhost:8888 (interval: 1min)
🔄 Localhost:8888: PENDING → UP
...after 30s...
🔄 Localhost:8888: UP → DOWN
📍 [INCIDENT] Localhost:8888 went DOWN
...after 30s...
🔄 Localhost:8888: DOWN → UP
✓ [RESOLVED] Localhost:8888 is back UP - Duration: 1min
```

---

## 6. Key Features to Explore

### A. Update Monitor Interval

```bash
curl -X PATCH http://localhost:3001/api/projects/github \
  -H "Content-Type: application/json" \
  -d '{"interval": 5}'
```

Backend automatically:
- Stops the old timer
- Creates new timer with 5-minute interval

### B. Update Retry Threshold

```bash
curl -X PATCH http://localhost:3001/api/projects/github \
  -H "Content-Type: application/json" \
  -d '{"retryThreshold": 3}'
```

Now requires 3 consecutive failures before marking DOWN.

### C. Delete Monitor

```bash
curl -X DELETE http://localhost:3001/api/projects/github
```

Backend:
- Stops the timer
- Removes from projects.json
- Logs: "Stopped monitor: GitHub"

---

## 7. Health Check Endpoint

```bash
curl http://localhost:3001/api/health | jq .
```

Response shows active monitors:
```json
{
  "ok": true,
  "service": "uptime-scanner-api",
  "monitors": {
    "total": 2,
    "monitors": [
      {
        "projectId": "github",
        "projectName": "GitHub",
        "interval": 1,
        "status": "active"
      },
      {
        "projectId": "my-website",
        "projectName": "My Website",
        "interval": 5,
        "status": "active"
      }
    ],
    "timestamp": "2024-05-02T10:30:00.000Z"
  }
}
```

---

## 8. Storage Structure

After adding projects, check the data files:

```bash
ls -la backend/data/

# Output:
# -rw-r--r-- projects.json
# -rw-r--r-- logs.json
# -rw-r--r-- incidents.json
```

View what's stored:
```bash
cat backend/data/projects.json | jq .
cat backend/data/logs.json | jq .[0:3]      # First 3 logs
cat backend/data/incidents.json | jq .      # All incidents
```

---

## 9. Test Graceful Shutdown

While monitors are running, press `Ctrl+C`:

Expected output:
```
📴 SIGINT received, gracefully shutting down...
⏹️  Stopping all monitors...
⏹️  Stopped monitor: GitHub
⏹️  Stopped monitor: My Website
✓ All monitors stopped
```

### Restart and verify monitors resume

```bash
npm run api
```

Output:
```
✓ Storage initialized
▶️  Loading monitors from storage...

  Found 2 project(s). Starting monitors...

⏱️  Starting monitor: GitHub (interval: 1min)
⏱️  Starting monitor: My Website (interval: 5min)

✓ All 2 monitor(s) started
```

---

## 10. Architecture Overview

```
┌──────────────┐
│   Frontend   │
│  React/Vite │
└──────┬───────┘
       │ HTTP
       ▼
┌──────────────────┐             
│  server.mjs      │ ◄─────────┐
│  HTTP API        │           │
└────────┬─────────┘       polling
         │                 every 30s
    ┌────▼────────────┐          │
    │ monitorEngine   │          │
    │ Schedulers      │ ─────────┘
    │ setInterval()   │
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │ checker.js      │
    │ URL checking    │
    │ Status tracking │
    └────────┬────────┘
             │
    ┌────────▼────────────┐
    │ storage.js          │
    │ Persistent data     │
    │ projects.json       │
    │ logs.json           │
    │ incidents.json      │
    └─────────────────────┘
```

---

## 11. Common Commands

```bash
# View all projects
curl http://localhost:3001/api/projects | jq .

# Check single project
curl http://localhost:3001/api/projects/github | jq .

# Get 20 latest logs
curl 'http://localhost:3001/api/projects/github/logs?limit=20' | jq .

# Get all incidents
curl http://localhost:3001/api/projects/github/incidents | jq .

# Edit interval
curl -X PATCH http://localhost:3001/api/projects/github \
  -H 'Content-Type: application/json' \
  -d '{"interval":10}'

# Test URL probe
curl -X POST http://localhost:3001/api/projects/test \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://google.com"}'
```

---

## 12. What Happens Next?

### When you **add a project**:
1. Project saved to `projects.json`
2. Monitor starts immediately (first check)
3. Recurring checks scheduled based on interval
4. Logs saved to `logs.json` on each check

### When you **update a project**:
1. Project updated in `projects.json`
2. If interval changed: old timer cleared, new timer created
3. Other properties (email, retry threshold) updated

### When you **delete a project**:
1. Timer stopped
2. Project removed from `projects.json`
3. Logs/incidents remain in their files

### When you **restart the server**:
1. `projects.json` is read
2. All monitors start automatically
3. First check runs immediately
4. Monitoring resumes

---

## 13. Next Steps

1. **Test the UI** - Add/delete/edit monitors in the dashboard
2. **Check logs** - View logs and incidents as projects are checked
3. **Deploy** - Follow [DEPLOYMENT.md](./DEPLOYMENT.md)
4. **Scale** - Monitor multiple sites, adjust intervals as needed

---

## 💡 Tips

- **Start with 5-minute intervals** to avoid hammering external sites
- **Set retry threshold to 2-3** to reduce false DOWN alerts
- **Monitor docker export** if self-hosting: `backup backend/data/`
- **Use health endpoint** for monitoring the monitor: `GET /api/health`

---

## 🐛 Debugging

Enable debug mode (in checker.js):
```javascript
// Add at top of checkProject function:
console.log(`[DEBUG] Checking ${project.name}...`);
```

View raw data files:
```bash
jq . backend/data/projects.json
```

Watch logs stream:
```bash
tail -f backend/data/logs.json | jq . -s '.[0:5]'
```

---

**Questions?** Check [MONITOR_ENGINE.md](./MONITOR_ENGINE.md) for complete documentation.
