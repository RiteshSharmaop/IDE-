# Code IDE Backend

A powerful MERN stack backend for a web-based code IDE with multi-language execution support, Redis caching, and Docker-based code isolation.

## 🚀 Features

- **Multi-language Support**: JavaScript, Python, C++, C, Java, C#
- **Secure Execution**: Docker container isolation with resource limits
- **Fast Caching**: Redis for user sessions and file caching
- **Authentication**: JWT-based auth with bcrypt password hashing
- **Rate Limiting**: 50 code executions per hour per user
- **File Management**: Create, read, update, delete code files
- **Real-time Execution**: Execute code with stdin support

## 📋 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB
- **Cache**: Redis
- **Authentication**: JWT + bcrypt
- **Code Execution**: Docker containers
- **Security**: Helmet, CORS, Rate limiting

## 🛠️ Installation

### Prerequisites

- Node.js >= 18.0.0
- Docker & Docker Compose
- MongoDB (or use Docker)
- Redis (or use Docker)

### Quick Start

```bash
# Clone repository
git clone <your-repo-url>
cd code-ide-backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your configurations

# Start services with Docker
docker-compose up -d

# Start code executor container
docker-compose -f docker-compose.executor.yml up -d

# Run backend in development mode
npm run dev
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js       # MongoDB connection
│   │   └── redis.js          # Redis connection & utilities
│   ├── models/
│   │   ├── User.js           # User schema
│   │   └── File.js           # File schema
│   ├── middleware/
│   │   └── auth.js           # JWT authentication
│   ├── routes/
│   │   ├── auth.js           # Auth routes
│   │   ├── files.js          # File CRUD routes
│   │   └── execute.js        # Code execution routes
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── fileController.js
│   │   └── executeController.js
│   ├── services/
│   │   └── codeExecutor/     # Code execution service
│   │       ├── index.js
│   │       ├── dockerExecutor.js
│   │       ├── Dockerfile
│   │       └── executors/    # Language-specific executors
│   └── server.js             # Main entry point
├── .env
├── docker-compose.yml
├── docker-compose.executor.yml
└── package.json
```

## 🔧 Configuration

### Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/code-ide

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your_secret_key_min_32_characters
JWT_EXPIRE=7d

# Client
CLIENT_URL=http://localhost:3000

# Execution
EXECUTION_TIMEOUT=10000
MAX_OUTPUT_SIZE=1048576
```

## 📡 API Endpoints

### Authentication

```bash
# Sign Up
POST /api/auth/signup
Body: { username, email, password }

# Sign In
POST /api/auth/signin
Body: { email, password }

# Get Current User
GET /api/auth/me
Headers: { Authorization: "Bearer <token>" }

# Logout
POST /api/auth/logout
Headers: { Authorization: "Bearer <token>" }
```

### Files

```bash
# Get All Files
GET /api/files
Headers: { Authorization: "Bearer <token>" }
Query: ?page=1&limit=50&search=filename

# Create File
POST /api/files
Headers: { Authorization: "Bearer <token>" }
Body: { name, content }

# Get Single File
GET /api/files/:id
Headers: { Authorization: "Bearer <token>" }

# Update File
PUT /api/files/:id
Headers: { Authorization: "Bearer <token>" }
Body: { name?, content? }

# Delete File
DELETE /api/files/:id
Headers: { Authorization: "Bearer <token>" }
```

### Code Execution

```bash
# Execute Code
POST /api/execute
Headers: { Authorization: "Bearer <token>" }
Body: { code, language, input? }

# Supported languages:
# - javascript
# - python
# - cpp
# - c
# - java
# - csharp
```

## 🧪 Testing

### Health Check

```bash
curl http://localhost:5000/api/health
```

### User Signup

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Execute Python Code

```bash
curl -X POST http://localhost:5000/api/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "code": "print(\"Hello World\")",
    "language": "python",
    "input": ""
  }'
```

## 🐳 Docker

### Start All Services

```bash
# Start MongoDB + Redis + Backend
docker-compose up -d

# Start Code Executor
docker-compose -f docker-compose.executor.yml up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
docker-compose -f docker-compose.executor.yml down
```

### Rebuild Containers

```bash
docker-compose up -d --build
docker-compose -f docker-compose.executor.yml up -d --build
```

## 🔒 Security Features

1. **JWT Authentication**: Secure token-based authentication
2. **Password Hashing**: bcrypt with salt rounds
3. **Rate Limiting**: Prevents abuse (50 executions/hour)
4. **Docker Isolation**: Code runs in isolated containers
5. **Resource Limits**: CPU, memory, and time restrictions
6. **CORS**: Configured for frontend origin
7. **Helmet**: Security headers
8. **Input Validation**: All inputs validated

## 💾 Redis Caching Strategy

| Data Type | Cache Duration | Key Pattern |
|-----------|----------------|-------------|
| User data | 24 hours | `user:{userId}` |
| File data | 1 hour | `file:{fileId}` |
| File list | 5 minutes | `user:{userId}:files:{page}:{search}` |
| Rate limit | 1 hour | `ratelimit:execute:{userId}` |

## 🐛 Troubleshooting

### MongoDB Connection Failed

```bash
docker-compose restart mongodb
docker-compose logs mongodb
```

### Redis Connection Failed

```bash
docker-compose restart redis
docker-compose logs redis
```

### Code Executor Not Working

```bash
# Restart executor
docker-compose -f docker-compose.executor.yml restart

# Check if container is running
docker ps | grep code-executor

# Rebuild executor
docker-compose -f docker-compose.executor.yml up -d --build
```

### Check Redis Cache

```bash
docker exec -it code-ide-redis redis-cli
> KEYS *
> GET user:123456
> DEL user:123456
```

### Check MongoDB Data

```bash
docker exec -it code-ide-mongo mongosh
> use code-ide
> db.users.find()
> db.files.find()
```

## 📊 Monitoring

### Health Endpoint

```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

### View Logs

```bash
# Backend logs
npm run dev

# Docker logs
docker-compose logs -f

# Specific service logs
docker-compose logs -f mongodb
docker-compose logs -f redis
```

## 🚀 Deployment

### Production Checklist

- [ ] Update `JWT_SECRET` with strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Configure production MongoDB URI
- [ ] Configure production Redis host
- [ ] Update `CLIENT_URL` with frontend domain
- [ ] Enable SSL/TLS
- [ ] Set up monitoring (PM2, New Relic, etc.)
- [ ] Configure backup strategy for MongoDB
- [ ] Set up log aggregation
- [ ] Configure firewall rules

### Deploy with PM2

```bash
npm install -g pm2

pm2 start src/server.js --name "code-ide-backend"
pm2 save
pm2 startup
```

## 📝 License

MIT

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@example.com

---

**Built with ❤️ using MERN Stack**