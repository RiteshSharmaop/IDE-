
# 🚀 HexaHub – Real-Time Collaborative IDE with Event-Driven AI Architecture

Live: https://hexahub-mern.onrender.com


Notion Link: https://www.notion.so/Multi-user-IDE-26be870d6d9b80b0aadbc1b8d67fc468?source=copy_link


## Collaborative Code Editor System Design.
![image](https://github.com/RiteshSharmaop/IDE-/blob/main/codeEditor%20SystemDesign.png)


## Code Compilation System Design.
![image](https://github.com/RiteshSharmaop/IDE-/blob/main/compilation%20SystemDesign.png)


HexaHub is a **real-time collaborative IDE** that allows multiple users to write, edit, and execute code together in shared sessions with **low latency and high scalability**.  
This project combines the **real-time collaboration engine of HexaHub** with the **event-driven, multi-LLM orchestration layer of BrainMesh**, enabling collaborative coding with **AI-assisted intelligence**.

The system is designed using **Kafka for event streaming** and **Redis for caching**, following modern distributed system principles.

---

## ✨ Key Features

- 🧑‍🤝‍🧑 **Real-Time Collaborative Editing**
  - Multiple users can edit code simultaneously in shared rooms
  - Changes are synced instantly across all connected clients

- 🧠 **AI-Assisted Development (BrainMesh Integration)**
  - Multi-LLM orchestration (OpenAI, Gemini, Claude, LLaMA, DeepSeek)
  - Context-aware code suggestions, explanations, and debugging help
  - Reduced hallucinations via response validation and caching

- ⚡ **Event-Driven Architecture**
  - Kafka used to stream collaboration events (code edits, cursor moves, execution requests)
  - Enables scalable, decoupled real-time processing
  - Supports horizontal scaling across multiple backend instances

- 🚀 **Low-Latency System Design**
  - WebSockets for real-time client communication
  - Kafka ensures reliable and ordered event delivery
  - Redis caching minimizes repeated computations and API calls

- 🔐 **Secure Code Execution**
  - User code executed inside **isolated Docker containers**
  - Prevents unauthorized access to host system
  - Resource-limited execution (CPU, memory, time)

- **Multi-language Code Execution**
  - Supports Python, JavaScript, C++, Java, C#, and more via Docker-based sandboxing.

- **User Authentication**
  - Secure login/signup with JWT and context-based user state management.

- **File Management**
  - Upload, download, and manage code files in the cloud.

- **Redis Caching**
  - Fast session and state management using Redis.

---

## 🛠 Tech Stack

### Frontend
- React.js
- JavaScript / TypeScript
- WebSockets

### Backend
- Node.js
- Express.js
- WebSockets
- Apache Kafka (event streaming)
- Redis (caching layer)

### Infrastructure
- Docker (sandboxed execution)
- Kafka (message broker)
- Redis (in-memory cache)
- Linux-based environment

---

## 🏗 System Architecture (High Level)

1. Users join a **collaboration room**
2. Code edits and actions are sent via **WebSockets**
3. Backend produces events to **Kafka topics**
4. Consumers process and distribute events to relevant sessions
5. Redis caches:
   - Session metadata
   - LLM responses
   - Frequently accessed state
6. Code execution requests are handled by **Docker-based isolated workers**
7. Execution results and AI responses are streamed back to users

---

## 🔄 Event Flow (Simplified)

---

## 🧠 Role of BrainMesh

BrainMesh acts as the **AI orchestration layer**:
- Routes requests to the best LLM
- Caches responses using Redis
- Applies rate limiting and analytics
- Streams AI responses back into collaborative sessions

---

## 🔐 Security Considerations

- Docker-based sandboxed execution
- No direct host access
- Controlled resource usage
- Stateless backend services
- Cached data expiration via Redis TTLs

---

## 🚧 Future Enhancements

- Full TypeScript migration
- Go-based high-performance execution workers
- Kubernetes-based orchestration
- Persistent collaboration history
- Role-based access control
- Observability with metrics and tracing

---

## 📌 Why HexaHub?

HexaHub demonstrates:
- Real-time systems engineering
- Event-driven architecture with Kafka
- Caching strategies using Redis
- Secure code execution
- AI orchestration in collaborative environments
- Scalable backend design

This project reflects **how modern developer tools are built at scale**.




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


---

## 👤 Author

Made With ❤️ and **Ritesh Sharma**  

---

⭐ If you find this project interesting, feel free to star the repository!