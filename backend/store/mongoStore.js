// Real persistence, Option 4. Used automatically when MONGODB_URI is set
// (see server.js) — same method shapes as fileStore.js, so server.js and
// every route handler is completely unaware of which one is active.
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Task = require("../models/Task");

const SEED_FILE = path.join(__dirname, "..", "data", "tasks.json");

async function init() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("[store] connected to MongoDB");

  // First run against an empty collection: seed it from the same
  // tasks.json the file store uses, so switching MONGODB_URI on/off
  // doesn't change what data you start with.
  const count = await Task.countDocuments();
  if (count === 0) {
    const seed = JSON.parse(fs.readFileSync(SEED_FILE, "utf-8"));
    await Task.insertMany(seed);
    console.log(`[store] seeded MongoDB with ${seed.length} tasks`);
  }
}

async function getAll(search) {
  if (!search) return Task.find().sort({ id: 1 }).lean();
  // Escape regex metacharacters so user input is matched literally (and a
  // stray "(" can't throw or trigger catastrophic backtracking).
  const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escaped, "i");
  return Task.find({ $or: [{ title: regex }, { description: regex }] })
    .sort({ id: 1 })
    .lean();
}

async function getById(id) {
  return Task.findOne({ id }).lean();
}

async function create({ title, description, status }) {
  const last = await Task.findOne().sort({ id: -1 }).lean();
  const nextId = last ? last.id + 1 : 1;
  const task = await Task.create({
    id: nextId,
    title,
    description,
    status: status || "not-started",
  });
  return task.toObject();
}

async function updateStatus(id, status) {
  return Task.findOneAndUpdate({ id }, { status }, { returnDocument: "after" }).lean();
}

async function remove(id) {
  const result = await Task.deleteOne({ id });
  return result.deletedCount > 0;
}

module.exports = { init, getAll, getById, create, updateStatus, remove };
