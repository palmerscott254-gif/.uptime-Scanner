# Uptime Scanner - API Integration Guide

This document provides instructions for integrating the Uptime Scanner frontend with your backend monitoring service.

## Frontend Ready for Production

The dashboard has been cleaned of all mock data and is ready to connect to your backend API. The following changes were made:

- ✅ Removed mock project data generators
- ✅ Cleaned up test/dummy data
- ✅ Ready for live API endpoints
- ✅ Production build: `npm run build`

## API Endpoints Required

Implement the following endpoints in your backend to fully power the dashboard:

### 1. Get All Projects
```
GET /api/projects
Response:
{
  "data": [
    {
      "id": "project-1",
      "name": "My Website",
      "url": "https://example.com",
      "status": "up",        // "up" | "down" | "slow"
      "responseTime": 145,   // milliseconds
      "lastChecked": "2024-04-25T10:30:00Z",
      "interval": 1,         // check interval in minutes
      "email": "user@example.com",
      "alertsEnabled": true,
      "keepAlive": false,
      "tags": ["Production", "API"],
      "logs": [
        {
          "id": "log-1",
          "type": "up",        // "up" | "down" | "slow"
          "message": "Site UP",
          "timestamp": "2024-04-25T10:30:00Z",
          "details": "Response time: 142ms"
        }
      ]
    }
  ]
}
```

### 2. Create New Project
```
POST /api/projects
Request:
{
  "url": "https://example.com",
  "name": "Example",
  "interval": 5,
  "email": "alerts@example.com"
}

Response: (Same as Get All Projects, single object)
```

### 3. Get Project Details
```
GET /api/projects/:id
Response: (Single project object as above)
```

### 4. Get Uptime Series Data
```
GET /api/projects/:id/uptime?range=24h
Response:
{
  "data": [
    {
      "label": "00",
      "uptime": 99,
      "response": 145
    },
    ...
  ]
}
```

Valid ranges: `24h`, `7d`, `30d`

### 5. Get Response Time Series
```
GET /api/projects/:id/response?range=24h
Response: (Same structure as uptime series)
```

### 6. Get Logs Timeline
```
GET /api/projects/:id/logs?limit=20
Response:
{
  "data": [
    {
      "id": "log-1",
      "type": "up",        // "up" | "down" | "slow"
      "message": "Site UP",
      "timestamp": "2024-04-25T10:30:00Z",
      "details": "Optional details about the event"
    }
  ]
}
```

### 7. Update Project Settings
```
PATCH /api/projects/:id
Request:
{
  "interval": 5,
  "email": "newemail@example.com",
  "alertsEnabled": true,
  "keepAlive": false
}

Response: (Updated project object)
```

### 8. Delete Project
```
DELETE /api/projects/:id
Response: { "success": true }
```

### 9. Test URL Connectivity
```
POST /api/projects/test
Request:
{
  "url": "https://example.com"
}

Response:
{
  "reachable": true,
  "statusCode": 200,
  "responseTime": 142,
  "timestamp": "2024-04-25T10:30:00Z"
}
```

## Frontend Integration Code

To integrate with these endpoints, update the commented sections in `src/App.tsx`:

```typescript
// Fetch projects on mount
useEffect(() => {
  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      setProjects(data.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };
  fetchProjects();
}, []);

// Create new project
const handleCreateProject = async () => {
  if (!formValues.url.trim()) return;
  const normalizedUrl = normalizeUrl(formValues.url);
  const nextName = formValues.name.trim() || extractProjectName(normalizedUrl);
  
  try {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: normalizedUrl,
        name: nextName,
        interval: formValues.interval,
        email: formValues.email
      })
    });
    const created = await response.json();
    setProjects(prev => [created.data, ...prev]);
    setSelectedProjectId(created.data.id);
    setModalOpen(false);
  } catch (error) {
    console.error('Failed to create project:', error);
  }
};

// Test URL before creating
const handleTestUrl = async () => {
  setTestStatus('loading');
  try {
    const response = await fetch('/api/projects/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: formValues.url })
    });
    const result = await response.json();
    setTestStatus(result.reachable ? 'success' : 'error');
    if (!formValues.name.trim()) {
      setFormValues(prev => ({
        ...prev,
        name: extractProjectName(formValues.url)
      }));
    }
  } catch (error) {
    setTestStatus('error');
  }
};
```

## Real-Time Updates

For live status updates, consider implementing WebSockets:

```typescript
useEffect(() => {
  const ws = new WebSocket('wss://your-api.com/ws/projects');
  
  ws.onmessage = (event) => {
    const update = JSON.parse(event.data);
    setProjects(prev => 
      prev.map(p => p.id === update.id ? { ...p, ...update } : p)
    );
  };
  
  return () => ws.close();
}, []);
```

## Error Handling

Implement proper error handling for:
- Network failures
- Invalid URLs
- Timeout scenarios
- Rate limiting (429)
- Authentication failures (401)

## Environment Configuration

Create a `.env.local` file:
```
VITE_API_BASE_URL=https://api.your-domain.com
VITE_WS_URL=wss://api.your-domain.com/ws
```

Update fetch calls:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const response = await fetch(`${API_BASE_URL}/projects`);
```

## Development vs Production

**Development:**
```bash
npm run dev
# API calls will route to: http://localhost:5173/api
```

**Production:**
```bash
npm run build
# Serve dist/ folder with proper API proxy/CORS configuration
```

## Next Steps

1. Implement the required API endpoints in your backend
2. Update the fetch URLs to match your API base URL
3. Test each endpoint with the dashboard
4. Implement WebSocket support for real-time updates
5. Set up proper error handling and user notifications
6. Configure CORS headers on your backend

## Deployment Checklist

- [ ] API endpoints implemented and tested
- [ ] CORS configured correctly
- [ ] Environment variables set for production
- [ ] SSL/HTTPS enforced
- [ ] Rate limiting configured
- [ ] Error handling implemented
- [ ] WebSocket support added (optional but recommended)
- [ ] Database backups configured
- [ ] Monitoring and alerting set up
- [ ] Load testing performed

Your dashboard is now ready to connect to your backend monitoring service!
