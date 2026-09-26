// TechBridge Task Management API
//
// Endpoints:
//   GET    /api/tasks      -> all tasks
//   GET    /api/tasks/:id  -> one task by id
//   PUT    /api/tasks/:id  -> update a task's status
//
// Task data starts from data/tasks.json and is kept in memory from there.
// Updates (PUT) change the in-memory copy only — restarting the server
// resets progress back to whatever's in tasks.json. That's a deliberate
// simplification for this task (see Optional Challenge 4 in the brief for
// the real-database version) rather than an oversight.

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const TASKS_FILE = path.join(__dirname, "data", "tasks.json");
const VALID_STATUSES = ["completed", "in-progress", "not-started"];

app.use(cors());
app.use(express.json());

let tasks = JSON.parse(fs.readFileSync(TASKS_FILE, "utf-8"));

// Quick sanity-check route — visiting http://localhost:3000 in a browser
// confirms the server is actually up, separately from the /api routes.
app.get("/", (req, res) => {
  res.json({ message: "TechBridge Task Management API is running." });
});

// GET /api/tasks — return every task.
app.get("/api/tasks", (req, res) => {
  res.json(tasks);
});

// GET /api/tasks/:id — return one task, or 404 if the id doesn't exist.
app.get("/api/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({ error: `No task found with id ${id}.` });
  }
  res.json(task);
});

// PUT /api/tasks/:id — update a task's status.
// Expects a JSON body like { "status": "completed" }.
app.put("/api/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({ error: `No task found with id ${id}.` });
  }

  const { status } = req.body;
  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `status must be one of: ${VALID_STATUSES.join(", ")}`,
    });
  }

  task.status = status;
  res.json(task);
});

app.listen(PORT, () => {
  console.log(`TechBridge API running at http://localhost:${PORT}`);
});
