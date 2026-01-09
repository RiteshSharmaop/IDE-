# Collaborative IDE Platform

Notion Link: https://www.notion.so/Multi-user-IDE-26be870d6d9b80b0aadbc1b8d67fc468?source=copy_link


## Overview
This project is a full-stack collaborative IDE platform designed for real-time code editing, execution, and team collaboration. It leverages modern web technologies, containerized code execution, and scalable event streaming for a robust developer experience.

## Repository Structure
```
backend/
  ├── src/
  │   ├── controllers/        # API controllers (auth, file, execute)
  │   ├── middleware/         # Express middlewares
  │   ├── models/             # Mongoose models (User, File)
  │   ├── routes/             # Express routes
  │   ├── services/
  │   │   └── codeExecutor/   # Docker-based code execution engine
  │   └── utils/              # Logger, Redis utils
  ├── Dockerfile              # Backend Dockerfile
  ├── docker-compose.yml      # Main compose file
  ├── docker-compose.executor.yml # Executor compose file
  ├── package.json            # Backend dependencies
  └── ...
frontend/
  ├── src/
  │   ├── components/         # UI components
  │   ├── hooks/              # Custom React hooks
  │   ├── lib/                # Auth, API, utilities
  │   ├── pages/              # App pages (Login, Signup, IDE)
  │   └── animation/          # Animated UI elements
  ├── public/                 # Static assets
  ├── package.json            # Frontend dependencies
  └── ...
```

## Key Features
- **Real-time Collaborative Editing**: Multiple users can edit code together using Yjs/CRDT and Socket.IO.
- **Multi-language Code Execution**: Supports Python, JavaScript, C++, Java, C#, and more via Docker-based sandboxing.
- **User Authentication**: Secure login/signup with JWT and context-based user state management.
- **File Management**: Upload, download, and manage code files in the cloud.
- **Event Streaming**: Kafka integration for scalable event and activity logging.
- **Redis Caching**: Fast session and state management using Redis.
- **Modern UI**: Built with React, Vite, and custom UI components for a responsive experience.
- **Security**: Non-root Docker execution, resource limits, and best practices for safe code execution.
- **Extensible Architecture**: Modular backend and frontend for easy feature addition.

## Technologies Used
- **Frontend**: React, Vite, JavaScript/JSX, CSS
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Collaboration**: Socket.IO
- **Event Streaming**: Kafka
- **Caching**: Redis
- **Code Execution**: Docker, Ubuntu, language compilers/interpreters
- **Authentication**: JWT, Context API
- **DevOps**: Docker Compose, Kubernetes (recommended for production)

## How It Works
- **Frontend**: Users interact with a modern IDE interface, edit code, and see real-time changes.
- **Backend**: Handles authentication, file management, and orchestrates code execution requests.
- **Code Executor**: Receives code, runs it in a secure Docker container, and returns output/errors.
- **Collaboration**: Socket.IO and Yjs enable real-time document sync; Kafka streams events for analytics and scaling.

## Getting Started
1. **Clone the repository**
2. **Install dependencies**:
   - Backend: `cd backend && npm install`
   - Frontend: `cd frontend && npm install`
3. **Start services**:
   - Backend: `npm start` or use Docker Compose
   - Frontend: `npm run dev`
   - Code Executor: `docker-compose -f docker-compose.executor.yml up -d`
4. **Access the app**: Open the frontend in your browser and sign up/login to start collaborating.

## Project Highlights
- **Architecture Diagram**: See `/backend/Readme.md` for a visual overview.
- **Extensible Execution Engine**: Easily add new languages in `/backend/src/services/codeExecutor/executors/`
- **Production Ready**: Designed for scaling with Kubernetes, monitoring, and secure secrets management.

## Contributing
Pull requests and issues are welcome! Please see individual `README.md` files in `backend` and `frontend` for more details.

## License
MIT License

# Made With ❤️ and Ritesh Sharma
