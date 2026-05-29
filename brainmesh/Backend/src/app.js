import dotenv from "dotenv";
import express from "express";
import cors from 'cors';
const app = express();
import connectDB from "./db/db.js";
import cookieParser from "cookie-parser";

dotenv.config({
    path: "./.env"
});

// mongo connection
connectDB();

// redis connecrion

import { client , connectRedis } from "./db/redis.js";

connectRedis();
// // Set a key with expiration of 10 seconds
await client.set("mykey", "Hello Redisssss!", {
  EX: 10  // expires in 10 seconds
});
const get = await client.get("mykey")
console.log(get); // 'Hello Redisssss!'







app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import chatRoutes from "./routes/chat.routes.js";
import userRoutes from "./routes/user.routes.js";
import paymentRoutes from "./routes/payment.route.js";
import messageRoutes from "./routes/message.routes.js";


app.get('/', (req, res) => {
    res.send("Welcome to the Chat API");
});
app.use("/api/chat", chatRoutes);

app.use("/api/user", userRoutes);
app.use("/api/payment", paymentRoutes);

app.use("/api/message", messageRoutes);


export default app;
