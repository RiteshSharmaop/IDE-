import { createClient } from "redis";


const client = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

// Error handler
client.on("error", (err) => console.error("❌ Redis Client Error:", err));

async function connectRedis() {
  if (!client.isOpen) {
    await client.connect();
    console.log("✅ Connected to Redis");
  }
}

export { client, connectRedis };
