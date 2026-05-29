# 🚀 Brain Mesh Chat Platform  

## Hosted Link : https://brainmash-1.onrender.com/
A web application that allows users to interact with multiple **Large Language Models (LLMs)** simultaneously. The platform provides **free LLM responses** as well as a **paid Multi-LLM feature**, which consolidates responses from all available LLMs into one concise summary using OpenAI GPT.  

The project also integrates **Stripe** for secure payments and uses **MongoDB** for persistent storage. Redis caching will be added later for payment/session optimization.  

---

## 🛠️ Tech Stack  

**Frontend**: ReactJS (in `/frontend`)  
**Backend**: Node.js, Express.js (in `/backend`)  
**Database**: MongoDB + Redis
**Payment Gateway**: Stripe API  
**Authentication**: JWT + Cookies  

---
## Key Features
**User authentication**: Signup, login, secure token-based auth, session management

**Multiple LLMs**: Chat with various models (GPT, Gemini, Deepseek, Perplexity, Lama, DeepSeek)

**Multi-LLM Pro**: Paid feature that merges multiple LLM responses into a concise summary

**Payment**: Stripe integration for subscriptions (card/net-banking/UPI)

**Role-based access**: Free users access standard LLMs; paid users unlock Multi-LLM

**Session persistence**: User, chat history and subscription status persisted

---

## 📂 Folder Structure  

```
.
├── frontend/               # ReactJS frontend
│   ├── src/                
|      ├──  Components/      # All UI
|            ├──  Chat/      # Chat UI 
|            ├──  Layout/    # Layout UI
|            ├──  payment/   # Payment UI
|      ├──  context          # context
|      ├──  Pages            # Pages
|      ├──  App.jsx          # API route definitions
├── backend/
│   ├── routes/             # API route definitions
│   ├── controller/         # Business logic
│   ├── models/             # MongoDB models
│   ├── middleware/         # Auth middleware
│   ├── db/                 # DB connection
│   └── app.js              # Main Express app
└── README.md
```

---

## ⚙️ Installation & Setup  

### 🔹 Backend  

1. Clone the repo  
   ```bash
   git clone https://github.com/RiteshSharmaop/BrainMash
   cd Backend
   ```
2. Install dependencies  
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`  
   ```env
   PORT=8000
   MONGODB_URI=
   CORS_ORIGIN=
   OPENROUTER_API_KEY=
   OPENROUTER_BASE_URL="https://openrouter.ai/api/v1"
   JWT_SECRET_EXPIRE=
   JWT_SECRET=
  

   # For development
   NODE_ENV=development

   # For production
   NODE_ENV=production

   STRIPE_SECRET_KEY=

   ```
4. Start backend  
   ```bash
   npm run dev
   ```
   Backend will run at: **http://localhost:8000**

---

### 🔹 Frontend  

1. Go to frontend folder  
   ```bash
   cd ../Frontend
   ```
2. Install dependencies  
   ```bash
   npm install
   ```
3. Start frontend dev server  
   ```bash
   npm run dev
   ```
   Frontend will run at: **http://localhost:5173**

4. Configure environment variables in `.env`  
   ```
   VITE_BACKEND_URL=http://localhost:8000/
   # stripe_PUBLISHABLE_KEY
   VITE_PUBLISHABLE_KEY=
   ```
---

## 🔑 User Flow  

1. **Register/Login** using email & username  
2. Navigate to **chat** → access multiple LLMs  
3. **Free LLMs** available to all users  
4. **Multi-LLM (Paid)**: consolidates responses from all LLMs into one summary  
5. **Payments** handled securely via Stripe  
6. After payment, user unlocks Multi-LLM feature  

---

## 📡 API Endpoints  

### 👤 User APIs (`/api/user`)  
| Method | Endpoint       | Description                | Auth Required |
|--------|---------------|----------------------------|---------------|
| POST   | `/register`   | Register new user          | ❌ |
| POST   | `/login`      | Login user                 | ❌ |
| GET    | `/me`         | Get current user profile   | ✅ |
| GET    | `/logout`     | Logout user                | ✅ |

---

### 💬 Chat APIs (`/api/chat`)  
| Method | Endpoint   | Description                  | Auth Required |
|--------|------------|------------------------------|---------------|
| POST   | `/`        | Send user prompt to LLMs     | ✅ |

Request Example:
```json
{
    "prompt": "Who is Virat Kohli?"
}
```


Response Example:
```json
{
    "gpt": "Virat Kohli is an Indian cricketer",
    "deepseek": "Virat Kohli is a former captain.",
    "response": "Virat Kohli is an Influencer."
}
```
### 💬 multillm APIs ()  
Request Example:
```json
{
    "prompt": "Who is Virat Kohli?"
}
```


Response Example:
```json
{
    "response": "Virat Kohli is an Indian cricketer and a former captain and an Influencer."
}
```

---

### 💳 Payment APIs (`/api/payment`)  
| Method | Endpoint                   | Description                       | Auth Required |
|--------|-----------------------------|-----------------------------------|---------------|
| POST   | `/create-checkout-session` | Create Stripe checkout session    | ✅ |

Response Example:
```json
{
  "id": "cs_test_a1b2c3d4",
  "url": "https://checkout.stripe.com/pay/cs_test_a1b2c3d4"
}
```

---

## 🗄️ Database  

- **MongoDB**:  
  - Stores **user data** (credentials, auth tokens)  
  - Stores **chat history**  

- **Redis (Planned)**:  
  - Cache payment/session status  
  - Faster retrieval of user subscription status  

---

## 🔮 Future Enhancements  

- ✅ Redis integration for caching  
- ✅ Forgot password & password reset  
- ✅ Admin dashboard for subscription & chat monitoring  
- ✅ Support for additional payment providers  

---

## 🤝 Contributing  

1. Fork the repo  
2. Create a feature branch  
3. Commit changes  
4. Open a Pull Request  

---

## 📜 License  

MIT License © 2025 Ritesh Sharma 
