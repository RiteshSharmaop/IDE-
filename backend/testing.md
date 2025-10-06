{
  "name": "code-ide-backend",
  "version": "1.0.0",
  "description": "Backend for Code IDE with multi-language execution support",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f app",
    "docker:executor:up": "docker-compose -f docker-compose.executor.yml up -d",
    "docker:executor:down": "docker-compose -f docker-compose.executor.yml down",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [
    "code-ide",
    "mern",
    "redis",
    "mongodb",
    "code-execution"
  ],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.3",
    "redis": "^4.6.12",
    "ioredis": "^5.3.2",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express-rate-limit": "^7.1.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "vm2": "^3.9.19"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}

// ============================================
// COMPLETE SETUP INSTRUCTIONS
// ============================================

/**
 * STEP 1: PROJECT STRUCTURE
 * Create the following folder structure:
 */

code-ide-backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── redis.js
│   ├── models/
│   │   ├── User.js
│   │   └── File.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── files.js
│   │   └── execute.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── fileController.js
│   │   └── executeController.js
│   ├── services/
│   │   └── codeExecutor/
│   │       ├── index.js
│   │       ├── dockerExecutor.js
│   │       ├── Dockerfile
│   │       └── executors/
│   │           ├── javascript.js
│   │           ├── python.js
│   │           ├── cpp.js
│   │           ├── java.js
│   │           ├── csharp.js
│   │           └── c.js
│   └── server.js
├── .env
├── .gitignore
├── .dockerignore
├── Dockerfile
├── docker-compose.yml
├── docker-compose.executor.yml
├── package.json
└── README.md

/**
 * STEP 2: INSTALL DEPENDENCIES
 */

// Initialize project
npm init -y

// Install all dependencies
npm install express mongoose redis ioredis bcryptjs jsonwebtoken cors dotenv express-rate-limit helmet morgan vm2

// Install dev dependencies
npm install --save-dev nodemon

/**
 * STEP 3: CREATE .ENV FILE
 */

// Create .env file in root directory with:

PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/code-ide

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_min_32_chars
JWT_EXPIRE=7d

# Client URL
CLIENT_URL=http://localhost:3000

# Code Execution
EXECUTION_TIMEOUT=10000
MAX_OUTPUT_SIZE=1048576

/**
 * STEP 4: CREATE .GITIGNORE
 */

node_modules/
.env
.env.local
.DS_Store
*.log
npm-debug.log*
dist/
build/
temp/
.vscode/
.idea/

/**
 * STEP 5: CREATE .DOCKERIGNORE
 */

node_modules
npm-debug.log
.env
.git
.gitignore
README.md
.DS_Store

/**
 * STEP 6: START SERVICES WITH DOCKER
 */

// Start MongoDB and Redis
docker-compose up -d

// Start code executor container
docker-compose -f docker-compose.executor.yml up -d

// Check running containers
docker ps

/**
 * STEP 7: RUN THE BACKEND
 */

// Development mode with auto-reload
npm run dev

// Production mode
npm start

/**
 * STEP 8: TEST THE API
 */

// 1. Health Check
curl http://localhost:5000/api/health

// 2. Sign Up
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'

// Response will include token, save it for next requests

// 3. Sign In
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

// 4. Get User Profile (use token from signup/signin)
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

// 5. Create a File
curl -X POST http://localhost:5000/api/files \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "test.js",
    "content": "console.log(\"Hello World\");"
  }'

// 6. Get All Files
curl http://localhost:5000/api/files \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

// 7. Execute Code
curl -X POST http://localhost:5000/api/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "code": "print(\"Hello from Python\")",
    "language": "python",
    "input": ""
  }'

/**
 * STEP 9: CONNECT FRONTEND TO BACKEND
 */

// Update your React frontend to use these API endpoints:

const API_URL = 'http://localhost:5000/api';

// Example: Sign up
const signup = async (username, email, password) => {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
  }
  return data;
};

// Example: Execute code
const executeCode = async (code, language, input = '') => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ code, language, input })
  });
  return await response.json();
};

// Example: Create file
const createFile = async (name, content) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/files`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ name, content })
  });
  return await response.json();
};

/**
 * STEP 10: PRODUCTION DEPLOYMENT
 */

// For production, update your .env:
NODE_ENV=production
MONGODB_URI=mongodb://your-production-db/code-ide
REDIS_HOST=your-redis-host
CLIENT_URL=https://your-frontend-domain.com

// Build and run with Docker:
docker-compose up -d --build

/**
 * API ENDPOINTS SUMMARY
 */

// AUTH ENDPOINTS
POST   /api/auth/signup     - Register new user
POST   /api/auth/signin     - Login user
GET    /api/auth/me         - Get current user (requires auth)
POST   /api/auth/logout     - Logout user (requires auth)

// FILE ENDPOINTS (all require auth)
GET    /api/files           - Get all user files
POST   /api/files           - Create new file
GET    /api/files/:id       - Get single file
PUT    /api/files/:id       - Update file
DELETE /api/files/:id       - Delete file

// EXECUTION ENDPOINT (requires auth)
POST   /api/execute         - Execute code

/**
 * SUPPORTED LANGUAGES
 */

- JavaScript (Node.js)
- Python 3
- C++ (g++)
- C (gcc)
- Java (OpenJDK 17)
- C# (Mono)

/**
 * REDIS CACHING STRATEGY
 */

// User data: cached for 24 hours
// File data: cached for 1 hour
// File list: cached for 5 minutes
// Execution results: cached for 5 minutes
// Rate limiting: 50 executions per hour per user

/**
 * SECURITY FEATURES
 */

- JWT authentication
- Password hashing with bcrypt
- Rate limiting on code execution
- Docker container isolation for code execution
- Resource limits (CPU, memory, time)
- Input validation
- CORS configuration
- Helmet security headers

/**
 * TROUBLESHOOTING
 */

// If MongoDB connection fails:
docker-compose restart mongodb

// If Redis connection fails:
docker-compose restart redis

// If code executor fails:
docker-compose -f docker-compose.executor.yml restart

// Check logs:
docker-compose logs -f
npm run docker:logs

// Reset everything:
docker-compose down -v
docker-compose -f docker-compose.executor.yml down
npm run docker:up
npm run docker:executor:up

/**
 * MONITORING
 */

// Check Redis cache:
docker exec -it code-ide-redis redis-cli
> KEYS *
> GET user:123456
> TTL user:123456

// Check MongoDB:
docker exec -it code-ide-mongo mongosh
> use code-ide
> db.users.find()
> db.files.find()

// Server health:
curl http://localhost:5000/api/health