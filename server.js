import express, { json } from "express";
import redis from "redis";
import cors from "cors";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(json());
app.use(cors());

const client = redis.createClient({
    url: process.env.REDIS_URL
});

client.on("error", (err) => console.error("Redis connection ERROR:", err));

client.connect()
.then(() => console.log("Connected to Redis Cloud"))
.catch( err => console.error("Conection Failed", err));

app.post("/save-task", async(req, res) => {
    const {date, task} = req.body;

    if(!date || !task){
        return res.status(400).json({error : "Date and Task are required!"});
    }

    try {
        let tasks = await client.get(`task:${date}`);
        tasks = tasks ? JSON.parse(tasks) : [];
        tasks.push(task);

        await client.set(`task:${date}`, JSON.stringify(tasks));
        res.json({message: "Task saved"});
    } catch(err) {
        res.status(500).json({error: "Error in saving", details: err});
    }
});

// **API to Get Tasks for a Date**
app.get('/get-tasks/:date', async (req, res) => {
    const { date } = req.params;

    try {
        const tasks = await client.get(`task:${date}`);
        res.json({ date, tasks: tasks ? JSON.parse(tasks) : [] });
    } catch (err) {
        res.status(500).json({ error: "Error fetching tasks", details: err });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on", PORT));