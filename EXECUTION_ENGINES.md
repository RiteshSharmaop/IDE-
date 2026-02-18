# Code Execution Engines - Implementation Guide

## Overview
This IDE supports **two code execution engines**:

1. **🌐 Piston API** (Currently Active)
   - Remote execution on emkc.org servers
   - No setup required
   - Works from anywhere with internet
   - Rate-limited

2. **🐳 Docker** (Available as Reference)
   - Local execution in Docker containers
   - Requires Docker setup
   - Unlimited executions
   - No internet required

---

## ✅ Current Setup: Piston API

### Files Involved
- `backend/src/controllers/executeController.js` (Active)
- `backend/src/routes/execute.js`

### How It Works
```
User Code → Frontend → Backend → Piston API → Results
```

### Advantages
✅ No local setup  
✅ Reliable & tested  
✅ Works remotely  
✅ Automatic scaling  

### Disadvantages
❌ Requires internet  
❌ Rate limits  
❌ External dependency  
❌ Whitelist restrictions  

### Testing
```bash
# Test endpoint
curl http://localhost:8080/api/execute/test

# Expected: JavaScript hello world output
```

---

## 🐳 Alternative Setup: Docker (Reference Implementation)

### Files Involved
- `backend/src/controllers/dockerExecuteController.js` (Reference)
- `backend/src/services/codeExecutor/dockerExecutor.js`
- `backend/docker-compose.executor.yml`

### How It Works
```
User Code → Frontend → Backend → Docker Container → Results
```

### Advantages
✅ No internet needed  
✅ Unlimited executions  
✅ Fast & local  
✅ Full control  

### Disadvantages
❌ Requires Docker setup  
❌ Local CPU usage  
❌ Not portable  
❌ Need to maintain containers  

### Installation
```bash
# Start Docker daemon
sudo systemctl start docker

# Verify Docker
docker --version
docker-compose --version

# Start containers
cd backend
docker-compose -f docker-compose.executor.yml up -d

# Check running containers
docker ps
```

---

## 🔄 Switching Between Engines

### Option A: Piston → Docker

**Step 1: Edit `backend/src/routes/execute.js`**
```javascript
// OLD (Piston):
const { executeCodeApi: pistonExecute } = require('../controllers/executeController');
router.post('/run', pistonExecute);

// NEW (Docker):
const { executeCode: dockerExecute } = require('../controllers/dockerExecuteController');
router.post('/run', dockerExecute);
```

**Step 2: Start Docker**
```bash
cd backend
docker-compose -f docker-compose.executor.yml up -d
```

**Step 3: Restart Backend**
```bash
npm run dev
```

**Step 4: Test**
```bash
curl -X GET http://localhost:8080/api/execute/test
```

### Option B: Docker → Piston

**Step 1: Edit `backend/src/routes/execute.js`**
```javascript
// Change dockerExecute back to pistonExecute
const { executeCodeApi: pistonExecute } = require('../controllers/executeController');
router.post('/run', pistonExecute);
```

**Step 2: Restart Backend**
```bash
npm run dev
```

**Step 3: Test**
```bash
curl -X GET http://localhost:8080/api/execute/test
```

---

## API Compatibility

Both engines use the **same API format**:

### Request
```json
{
  "code": "print('hello')",
  "language": "python",
  "input": ""
}
```

### Response
```json
{
  "success": true,
  "data": {
    "success": true,
    "output": "hello\n",
    "error": "",
    "executionTime": 234,
    "language": "python"
  }
}
```

**No frontend changes needed** when switching engines!

---

## Supported Languages

### Piston API
- JavaScript (18.15.0)
- Python (3.10.0)
- C++ (10.2.0)
- TypeScript (5.0.3)
- Java (15.0.2)
- C# (6.12.0)
- C (10.2.0)

### Docker
- JavaScript
- Python
- C++
- C
- Java
- C#

---

## Troubleshooting

### Piston Issues

**Error: "Piston API is temporarily unavailable"**
- API is down or rate-limited
- Solution: Try again later or switch to Docker

**Error: "Too many requests"**
- Rate limit exceeded
- Solution: Wait a few minutes or switch to Docker

### Docker Issues

**Error: "Container not running"**
```bash
docker ps
docker-compose -f docker-compose.executor.yml up -d
```

**Error: "Docker not found"**
```bash
# Install Docker:
# On Ubuntu:
sudo apt-get install docker.io docker-compose

# Start Docker:
sudo systemctl start docker
sudo systemctl enable docker
```

**Error: "Permission denied"**
```bash
# Add user to docker group:
sudo usermod -aG docker $USER
newgrp docker
```

---

## Performance Comparison

| Metric | Piston | Docker |
|--------|--------|--------|
| Setup Time | 0 min | 5 min |
| Startup | ~500ms | ~100ms |
| Execution | ~1-2s | ~500ms |
| Rate Limit | Yes | No |
| Internet | Required | No |
| CPU Usage | Remote | Local |
| Cost | Free | Free |

---

## Production Recommendation

| Scenario | Recommended |
|----------|-------------|
| Small project, occasional use | **Piston** |
| High volume, reliable | **Docker** |
| Learning & testing | **Either** |
| CI/CD integration | **Docker** |
| Classroom/training | **Docker** |

---

## Switching Strategy

### For Development
Start with **Piston** (zero setup). If rate limits are hit, switch to **Docker**.

### For Production
Use **Docker** for reliability and control.

### For Testing
Use **Piston** first, then verify with Docker before production.

---

## File Structure

```
backend/
├── src/
│   ├── controllers/
│   │   ├── executeController.js           (✅ Piston - Active)
│   │   └── dockerExecuteController.js     (📚 Docker - Reference)
│   ├── routes/
│   │   └── execute.js                     (Route switching point)
│   └── services/
│       └── codeExecutor/
│           ├── dockerExecutor.js          (Docker implementation)
│           └── executors/
│               ├── javascript.js
│               └── python.js
├── docker-compose.executor.yml
└── Dockerfile
```

---

## Next Steps

1. ✅ Test Piston API (current setup)
   ```bash
   curl http://localhost:8080/api/execute/test
   ```

2. 📚 Keep Docker setup as reference
   - Files are ready to use
   - Switch anytime if needed

3. 🚀 Deploy with confidence
   - Both engines are production-ready
   - Switch based on requirements

---

## Quick Reference

### Check Current Engine
Look at `backend/src/routes/execute.js` line 12

### Switch to Docker
Edit line in execute.js:
```diff
- router.post('/run', pistonExecute);
+ router.post('/run', dockerExecute);
```

### Switch to Piston
Edit line in execute.js:
```diff
- router.post('/run', dockerExecute);
+ router.post('/run', pistonExecute);
```

### Restart Service
```bash
# After any change
npm run dev
```

---

## Support

- **Piston Issues**: Check piston.rocks status
- **Docker Issues**: Check Docker docs
- **API Issues**: Check controller files for error handling
- **Frontend Issues**: Check `frontend/src/lib/codeExecute.js`
