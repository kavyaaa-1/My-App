import {createClient} from "redis";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

const client = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: 'redis-11334.c301.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 11334
    }
});

client.on("error", (err) => console.error("Redis connection ERROR:", err));

client.connect()
    .then(() => console.log("Connected to Redis"))
    .catch(err => console.error("Redis connection error:", err));
    
export default client;
