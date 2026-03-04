const mongoose = require("mongoose");

const TaskLogSchema = new mongoose.Schema({
  task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  event: { type: String, enum: ["started", "completed", "failed", "cancelled", "scheduled"], required: true },
  message: { type: String, default: "" },
  result: { type: mongoose.Schema.Types.Mixed, default: null },
  executionTime: { type: Number, default: 0 },
  workerId: { type: String, default: null },
}, { timestamps: true });

TaskLogSchema.index({ task: 1, createdAt: -1 });
TaskLogSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("TaskLog", TaskLogSchema);
