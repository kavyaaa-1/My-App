import {createClient} from "redis";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

const client = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: 'redis-15724.c330.asia-south1-1.gce.redns.redis-cloud.com',
        port: 15724
    }
});

client.on("error", (err) => console.error("Redis connection ERROR:", err));

client.connect()
    .then(() => console.log("Connected to Redis"))
    .catch(err => console.error("Redis connection error:", err));
    
export default client;
