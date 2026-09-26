const mongoose = require("mongoose");

// We keep a numeric `id` field (rather than relying on Mongo's own
// ObjectId) so the API contract is identical whether the server is
// running against MongoDB or the file-store fallback in store.js. The
// frontend never needs to know which one it's talking to.
const taskSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["completed", "in-progress", "not-started"],
      default: "not-started",
    },
  },
  { versionKey: false },
);

module.exports = mongoose.model("Task", taskSchema);
