// Fallback storage used when no MONGODB_URI is configured. This is what
// Task 7's main (non-optional) requirement used — kept intact so the
// server still runs with zero external dependencies for local dev or
// grading. Unlike the original version, mutations are now written back
// to disk (fs.writeFileSync) so restarting the server no longer reverts
// changes — small addition, but it's what turns "in-memory" into an
// actual (if very lightweight) persistence layer.
const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "data", "tasks.json");

let tasks = [];

function load() {
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  tasks = JSON.parse(raw);
}

function persist() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
}

async function init() {
  load();
  console.log(`[store] file store ready (${tasks.length} tasks loaded from ${DATA_FILE})`);
}

async function getAll(search) {
  if (!search) return tasks;
  const term = search.toLowerCase();
  return tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(term) ||
      t.description.toLowerCase().includes(term),
  );
}

async function getById(id) {
  return tasks.find((t) => t.id === id) || null;
}

async function create({ title, description, status }) {
  const nextId = tasks.reduce((max, t) => Math.max(max, t.id), 0) + 1;
  const task = {
    id: nextId,
    title,
    description,
    status: status || "not-started",
  };
  tasks.push(task);
  persist();
  return task;
}

async function updateStatus(id, status) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return null;
  task.status = status;
  persist();
  return task;
}

async function remove(id) {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return false;
  tasks.splice(index, 1);
  persist();
  return true;
}

module.exports = { init, getAll, getById, create, updateStatus, remove };
