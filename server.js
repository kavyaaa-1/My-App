import express, { json } from "express";
import redis from "redis";
import cors from "cors";
import dotenv from "dotenv";

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
  .catch(err => console.error("Connection Failed", err));

// Save Task Endpoint
app.post("/save-task", async (req, res) => {
  const { date, task, status } = req.body;

  // Only check for date and task; status may be false
  if (!date || !task) {
    return res.status(400).json({ error: "Date and Task are required!" });
  }

  try {
    let tasks = await client.get(`task:${date}`);
    tasks = tasks ? JSON.parse(tasks) : [];
    // Store tasks as objects with task and status properties
    let taskItem = {
        task: task,
        status: status
    };
    tasks.push(taskItem);
    await client.set(`task:${date}`, JSON.stringify(tasks));
    console.log("Saved tasks:", tasks);
    res.json({ message: "Task saved"});
  } catch (err) {
    res.status(500).json({ error: "Error in saving", details: err });
  }
});

// Get Tasks Endpoint
app.get('/get-tasks/:date', async (req, res) => {
  const { date } = req.params;
  try {
    let tasks = await client.get(`task:${date}`);
    tasks = tasks ? JSON.parse(tasks) : [];
    // Convert any old string entries into objects
    tasks = tasks.map(t => (typeof t === "string" ? { task: t, status: false } : t));
    console.log("Retrieved tasks:", tasks);
    res.json({ date, tasks });
  } catch (err) {
    res.status(500).json({ error: "Error fetching tasks", details: err });
  }
});

// Update Task Endpoint (PATCH)
app.patch("/update-task", async (req, res) => {
  const { date, task, status } = req.body;

  // Check for undefined status instead of false
  if (!date || !task || status === undefined) {
    return res.status(400).json({ error: "Date, Task, and Status are required!" });
  }

  try {
    let tasks = await client.get(`task:${date}`);
    tasks = tasks ? JSON.parse(tasks) : [];
    // Update the matching task’s status
    const updatedTasks = tasks.map(t =>
      t.task === task ? { ...t, status } : t
    );
    await client.set(`task:${date}`, JSON.stringify(updatedTasks));
    console.log("Updated tasks:", updatedTasks);
    res.json({ message: "Task updated successfully", tasks: updatedTasks });
  } catch (err) {
    res.status(500).json({ error: "Error updating task", details: err });
  }
});

app.delete("/delete-task", async (req, res) => {
    const {date, task} = req.body;
    // Check for undefined status instead of false
    if (!date || !task) {
        return res.status(400).json({ error: "Date and Task are required!" });
    }   
            
    try {
        let tasks = await client.get(`task:${date}`);
        tasks = tasks ? JSON.parse(tasks) : [];
        let updatedTasks = [];

        tasks.forEach(t => {
            if(t.task == task){
                return;
            }
            updatedTasks.push(t);
        });
        
        if(updatedTasks.length == 0){
          console.log("Empty arraay");
          await client.del(`task:${date}`);
          res.json({ message: "Task deleted successfully", tasks: updatedTasks });
        }else{
          await client.set(`task:${date}`, JSON.stringify(updatedTasks));
          console.log("Updated tasks:", updatedTasks);
          res.json({ message: "Task deleted successfully", tasks: updatedTasks });
        }
      } catch (err) {
        res.status(500).json({ error: "Error deleted task", details: err });
      }
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on", PORT));
