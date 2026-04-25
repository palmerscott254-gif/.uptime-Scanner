# Uptime Scanner - Deployment Guide

Complete guide for deploying the Uptime Scanner frontend dashboard to production.

## Build Process

The dashboard is production-ready and builds without any test/mock data.

```bash
# Install dependencies
npm install

# Development preview
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Build Output

- **Location:** `dist/` folder
- **Entry:** `dist/index.html`
- **Assets:** 
  - CSS: ~22 KB (gzipped: ~4.7 KB)
  - JavaScript: ~633 KB (gzipped: ~178 KB)

## Deployment Platforms

### 1. Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

Configuration in `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_API_BASE_URL": "https://api.your-domain.com"
  },
  "routes": [
    { "src": "/assets/.*", "headers": { "cache-control": "max-age=31536000, immutable" } },
    { "src": "/.*", "dest": "/index.html" }
  ]
}
```

### 2. Netlify

```bash
npm i -g netlify-cli
netlify deploy
```

`netlify.toml`:
```toml
[build]
command = "npm run build"
publish = "dist"

[[redirects]]
from = "/*"
to = "/index.html"
status = 200

[env]
API_BASE_URL = "https://api.your-domain.com"
```

### 3. Docker

`Dockerfile`:
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
RUN npm install -g http-server
COPY --from=build /app/dist ./dist
EXPOSE 3000

CMD ["http-server", "dist", "-p", "3000", "-c-1"]
```

Build and run:
```bash
docker build -t uptime-scanner:latest .
docker run -p 3000:8080 uptime-scanner:latest
```

### 4. AWS S3 + CloudFront

```bash
aws s3 sync dist/ s3://your-bucket-name/ --delete
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### 5. Traditional Server (Nginx)

```nginx
server {
    listen 80;
    server_name uptime.your-domain.com;
    
    root /var/www/uptime-scanner;
    index index.html;
    
    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API proxy
    location /api/ {
        proxy_pass https://api.your-domain.com/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # HTTPS redirect
    error_page 497 https://$host$request_uri;
}
```

## Environment Variables

Create `.env.production` for production-specific settings:

```env
# API Configuration
VITE_API_BASE_URL=https://api.your-domain.com
VITE_WS_URL=wss://api.your-domain.com/ws

# Optional: Analytics
VITE_ANALYTICS_ID=your-analytics-id

# Optional: Feature Flags
VITE_ENABLE_REAL_TIME_UPDATES=true
```

## Optimization Tips

### 1. Code Splitting
For large applications, consider splitting the bundle:

```typescript
// src/vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'recharts': ['recharts'],
          'vendor': ['react', 'react-dom'],
          'lucide': ['lucide-react']
        }
      }
    }
  }
});
```

### 2. Compress Assets
```bash
npm install -D rollup-plugin-gzip
```

### 3. Image Optimization
- Use WebP format for images
- Implement lazy loading where possible
- Use responsive image sizes

### 4. Content Delivery
- Enable HTTP/2 push for critical assets
- Use a CDN for global distribution
- Set proper cache headers

## Performance Metrics

Target metrics:
- **First Contentful Paint (FCP):** < 1.5s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Cumulative Layout Shift (CLS):** < 0.1
- **Time to Interactive (TTI):** < 3.5s

Measure using:
```bash
npm install -D @vitejs/plugin-basic-ssl
# or use Google PageSpeed Insights
```

## Security Checklist

- [ ] HTTPS enforced (redirect HTTP to HTTPS)
- [ ] Security headers configured:
  - `Content-Security-Policy`
  - `X-Frame-Options: SAMEORIGIN`
  - `X-Content-Type-Options: nosniff`
  - `X-XSS-Protection: 1; mode=block`
  - `Strict-Transport-Security: max-age=31536000`
  - `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] CORS properly configured
- [ ] API authentication implemented
- [ ] Rate limiting enabled
- [ ] SQL injection prevention (if applicable)
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented

### Security Headers Example (Nginx)

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;" always;
```

## Monitoring

### Error Tracking
```bash
npm install @sentry/react
```

### Analytics
```bash
npm install gtag
```

## Maintenance

### Regular Updates
```bash
npm outdated  # Check for updates
npm update    # Update packages
npm audit     # Check for vulnerabilities
```

### Database Backups
If using a database for project data, implement:
- Daily automated backups
- Multi-region replication
- Point-in-time recovery

### Logging
Set up centralized logging:
- CloudWatch (AWS)
- Stackdriver (GCP)
- Datadog
- LogRocket

## Rollback Strategy

Keep previous versions:
```bash
# Tag releases
git tag v1.0.0
git push origin v1.0.0

# Easy rollback if needed
git checkout v1.0.0
npm run build
```

## Support & Documentation

- **GitHub Issues:** Report bugs and request features
- **Documentation:** See `API_INTEGRATION.md` for API setup
- **Examples:** Check `src/` for component examples

## Production Readiness Checklist

- [x] Mock data removed
- [x] Production build verified
- [x] Error handling implemented
- [x] Environment variables configured
- [x] API endpoints documented
- [x] Security headers configured
- [x] Performance optimized
- [x] Monitoring set up
- [ ] Load testing complete
- [ ] Staging environment validated
- [ ] Runbook created
- [ ] On-call rotation established

---

**Happy monitoring! Your Uptime Scanner is ready for production deployment.**
