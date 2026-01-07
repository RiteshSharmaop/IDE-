# Notification System - Deployment Checklist

## Pre-Deployment Verification

### ✅ Backend Files

- [ ] `backend/src/models/Notification.js` exists
- [ ] `backend/src/services/notificationService.js` exists
- [ ] `backend/src/controllers/notificationController.js` exists
- [ ] `backend/src/routes/notifications.js` exists
- [ ] `backend/src/socket.js` updated with notification handlers
- [ ] `backend/src/server.js` imports notification routes

### ✅ Frontend Files

- [ ] `frontend/src/lib/notificationApi.js` exists
- [ ] `frontend/src/hooks/useNotifications.js` exists
- [ ] `frontend/src/components/CheckboxInTable.jsx` updated
- [ ] `frontend/src/lib/auth.jsx` has `getAuthToken` function
- [ ] `frontend/src/lib/auth.js` exports `getAuthToken`
- [ ] `frontend/src/pages/CodeIDE.jsx` updated with userId

### ✅ Dependencies

- [ ] Backend `package.json` has mongoose (for MongoDB)
- [ ] Backend `package.json` has socket.io
- [ ] Backend `package.json` has redis
- [ ] Frontend `package.json` has react
- [ ] Frontend `package.json` has socket.io-client
- [ ] All dependencies installed (`npm install`)

### ✅ Environment Variables

- [ ] `.env` has `MONGODB_URI` set
- [ ] `.env` has `REDIS_URL` set
- [ ] `.env` has `CLIENT_URL` set (for CORS)
- [ ] `.env` has `PORT` set (optional, defaults to 8000)
- [ ] `.env.local` in frontend has `VITE_API_URL` set (if needed)

### ✅ Database Setup

- [ ] MongoDB is running
- [ ] MongoDB database exists (`ide_db` or configured name)
- [ ] MongoDB connection tested:
  ```bash
  mongosh
  > db.version()
  ```

### ✅ Cache Setup

- [ ] Redis is running
- [ ] Redis connection tested:
  ```bash
  redis-cli
  > PING
  ```

---

## Local Testing (Before Production)

### ✅ Backend Startup

```bash
cd backend
npm install  # If not done yet
npm run dev
```

- [ ] Server starts without errors
- [ ] MongoDB connection message appears
- [ ] Redis connection message appears
- [ ] Socket.io initialized message appears
- [ ] No console errors in logs

### ✅ Frontend Startup

```bash
cd frontend
npm install  # If not done yet
npm run dev
```

- [ ] Frontend compiles without errors
- [ ] No TypeScript/linting errors
- [ ] Dev server accessible at localhost:5173

### ✅ Basic Functionality Test

1. [ ] Open http://localhost:5173
2. [ ] Login successfully
3. [ ] Create or join a room
4. [ ] CheckboxInTable component loads
5. [ ] Open second tab/browser
6. [ ] Join same room in second tab
7. [ ] First tab: Create a file
8. [ ] Second tab: Notification appears instantly

### ✅ API Testing

```bash
# Get auth token from localStorage in browser console
TOKEN=$(localStorage.getItem('token'))

# Test notification endpoints
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/notifications/unread-count

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/notifications/room/YOUR_ROOM_ID
```

- [ ] Endpoints return 200 OK
- [ ] Responses have correct structure
- [ ] No authentication errors

### ✅ Database Verification

```bash
mongosh
> db.notifications.find().limit(1)
```

- [ ] Notifications collection exists
- [ ] Documents are being inserted
- [ ] Document structure matches schema

### ✅ Redis Verification

```bash
redis-cli
> KEYS "*notification*"
> LLEN "room:YOUR_ROOM_ID:notifications"
```

- [ ] Cache keys exist
- [ ] Data is being cached
- [ ] TTL is set correctly

---

## Performance Testing

### ✅ Real-Time Latency

- [ ] Notification appears within 100ms across 3+ tabs
- [ ] No UI lag when notifications arrive
- [ ] No console errors during activity

### ✅ Bulk Operations

- [ ] Create 10 files rapidly
- [ ] All notifications appear
- [ ] No notifications are lost
- [ ] Table still responsive

### ✅ Database Performance

- [ ] Query notifications: < 200ms response time
- [ ] API endpoints respond in < 500ms
- [ ] No database timeouts

---

## Security Verification

### ✅ Authentication

- [ ] All `/api/notifications/*` endpoints require token
- [ ] Invalid token returns 401 Unauthorized
- [ ] No notifications visible without auth

### ✅ Authorization

- [ ] User A can't access User B's private notifications
- [ ] Users only see notifications for their rooms
- [ ] Socket.io events limited to specific room

### ✅ Data Validation

- [ ] Malformed requests return 400 Bad Request
- [ ] Injection attempts are prevented
- [ ] No sensitive data in logs

---

## Production Deployment Checklist

### ✅ Before Deploying

#### Backend

- [ ] All console.log statements removed/commented out
- [ ] Error handling in place for all operations
- [ ] Database connection pooling configured
- [ ] Redis connection retry logic enabled
- [ ] Socket.io namespace isolated
- [ ] CORS settings restrict to production domain
- [ ] Rate limiting enabled
- [ ] Helmet security middleware enabled

#### Frontend

- [ ] Build optimized (`npm run build`)
- [ ] API URLs point to production backend
- [ ] Console errors cleaned up
- [ ] Dev tools removed/disabled
- [ ] Environment variables configured
- [ ] Asset optimization verified

#### Infrastructure

- [ ] MongoDB replicated (for HA)
- [ ] Redis replicated or clustered
- [ ] Backup strategy in place
- [ ] Monitoring/alerting configured
- [ ] Log aggregation setup
- [ ] Load balancer configured (if needed)

### ✅ Production Configuration

#### Backend `.env`

```
NODE_ENV=production
PORT=8000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ide_db
REDIS_URL=redis://user:pass@redis-host:6379
CLIENT_URL=https://your-domain.com
NOTIFICATION_TTL=86400
```

#### Frontend `.env.production`

```
VITE_API_URL=https://api.your-domain.com
VITE_SOCKET_URL=https://api.your-domain.com
```

### ✅ Deployment Steps

1. **Deploy Backend**

   ```bash
   # On production server
   cd /app/backend
   git pull origin main
   npm ci  # Use ci instead of install for production
   npm run build  # If TypeScript compilation needed
   pm2 restart ide-backend  # Or your process manager
   ```

2. **Deploy Frontend**

   ```bash
   # On production server/CDN
   cd /app/frontend
   git pull origin main
   npm ci
   npm run build
   # Serve dist/ folder via nginx/apache or upload to CDN
   ```

3. **Database Migrations**
   ```bash
   mongosh production_uri
   > use your_db
   > db.notifications.createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 })
   > db.notifications.createIndex({ roomId: 1, createdAt: -1 })
   ```

### ✅ Post-Deployment Verification

1. [ ] Website loads without errors
2. [ ] User can login
3. [ ] Can create/join rooms
4. [ ] Notifications appear in real-time
5. [ ] CheckboxInTable displays properly
6. [ ] API endpoints work (test with curl)
7. [ ] Database writes are successful
8. [ ] Redis cache is populated
9. [ ] No error messages in logs
10. [ ] Performance acceptable

### ✅ Monitoring Setup

- [ ] Log aggregation active (ELK, Splunk, etc.)
- [ ] Error tracking enabled (Sentry, Rollbar, etc.)
- [ ] APM configured (New Relic, DataDog, etc.)
- [ ] Database monitoring active
- [ ] Redis monitoring active
- [ ] Alert rules configured for:
  - [ ] High error rate
  - [ ] Slow API responses
  - [ ] Database connection errors
  - [ ] Redis connection errors
  - [ ] Low disk space

### ✅ Backup Strategy

- [ ] MongoDB automated backups enabled
- [ ] Backup retention: 30 days minimum
- [ ] Backup restoration tested
- [ ] Redis persistence enabled (RDB/AOF)
- [ ] Point-in-time recovery possible
- [ ] Disaster recovery plan documented

---

## Rollback Plan

If issues occur in production:

### ✅ Quick Rollback

```bash
# Backend
git revert <bad-commit>
npm install
npm run dev
pm2 restart ide-backend

# Frontend
git revert <bad-commit>
npm run build
# Serve previous build from CDN/static server
```

### ✅ Database Rollback

```bash
# Use MongoDB backup
mongorestore --uri="mongodb://..." --archive=backup.archive

# No data loss - notifications auto-expire after 24h
```

### ✅ Communication

- [ ] Notify users of issue
- [ ] Provide status updates
- [ ] Confirm fix before closing
- [ ] Post-mortem analysis scheduled

---

## Health Check Endpoints

Add these for monitoring:

```bash
# Health check
curl http://your-api.com/api/health

# Response should be:
# {
#   "status": "IDE server is healthy and running",
#   "timestamp": "2024-01-06T...",
#   "uptime": 3600
# }
```

---

## Documentation Checklist

- [ ] NOTIFICATION_SYSTEM.md is accurate
- [ ] NOTIFICATION_INTEGRATION_GUIDE.md is up-to-date
- [ ] API documentation is complete
- [ ] Deployment guide exists
- [ ] Troubleshooting guide exists
- [ ] Database schema documented
- [ ] Socket event reference documented
- [ ] Environment variables documented

---

## Post-Deployment Maintenance

### Weekly

- [ ] Check error logs for issues
- [ ] Verify backup completion
- [ ] Monitor API response times

### Monthly

- [ ] Analyze notification metrics
- [ ] Review database performance
- [ ] Update security patches
- [ ] Run cleanup jobs
- [ ] Review cost (especially Redis/MongoDB)

### Quarterly

- [ ] Full disaster recovery test
- [ ] Performance optimization review
- [ ] Security audit
- [ ] User feedback incorporation
- [ ] Capacity planning

---

## Success Indicators

- ✅ Notifications appear in < 100ms
- ✅ API response time < 500ms
- ✅ 99.9% uptime
- ✅ Zero data loss
- ✅ < 1% error rate
- ✅ Happy users!

---

## Sign-Off

- [ ] Team Lead: ********\_******** Date: **\_\_\_**
- [ ] DevOps: ********\_******** Date: **\_\_\_**
- [ ] QA: ********\_******** Date: **\_\_\_**
- [ ] Product: ********\_******** Date: **\_\_\_**

---

**Status: Ready for Production** ✅
**Last Updated:** 2024-01-06
**Next Review:** After First 7 Days in Production
