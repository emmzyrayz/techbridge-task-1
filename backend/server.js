require("dotenv").config();
const express = require("express");
const cors = require("cors");

const store = process.env.MONGODB_URI
  ? require("./store/mongoStore")
  : require("./store/fileStore");

const VALID_STATUSES = ["completed", "in-progress", "not-started"];

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "TechBridge Task Management API",
    storage: process.env.MONGODB_URI ? "mongodb" : "file",
  });
});

app.get("/api/tasks", async (req, res) => {
  const tasks = await store.getAll(req.query.search);
  res.json(tasks);
});

app.get("/api/tasks/:id", async (req, res) => {
  const id = Number(req.params.id);
  const task = await store.getById(id);
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.json(task);
});

app.post("/api/tasks", async (req, res) => {
  const { title, description, status } = req.body;

  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "title is required" });
  }
  if (!description || typeof description !== "string" || !description.trim()) {
    return res.status(400).json({ error: "description is required" });
  }
  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `status must be one of: ${VALID_STATUSES.join(", ")}`,
    });
  }

  const task = await store.create({
    title: title.trim(),
    description: description.trim(),
    status,
  });
  res.status(201).json(task);
});

app.put("/api/tasks/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;

  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `status must be one of: ${VALID_STATUSES.join(", ")}`,
    });
  }

  const task = await store.updateStatus(id, status);
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.json(task);
});

app.delete("/api/tasks/:id", async (req, res) => {
  const id = Number(req.params.id);
  const deleted = await store.remove(id);
  if (!deleted) return res.status(404).json({ error: "Task not found" });
  res.status(204).send();
});

const PORT = process.env.PORT || 3000;

store
  .init()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`TechBridge API running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start:", err);
    process.exit(1);
  });
