const mongoose = require("mongoose");

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
