const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ["email", "backup"], required: true },
  priority: { type: Number, min: 1, max: 10, default: 5 },
  status: { type: String, enum: ["pending", "running", "completed", "failed", "cancelled"], default: "pending" },
  payload: { type: mongoose.Schema.Types.Mixed, default: {} },
  scheduledAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  workerId: { type: String, default: null },
  isLocked: { type: Boolean, default: false },
  startedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  errorMessage: { type: String, default: null },
}, { timestamps: true });

TaskSchema.index({ status: 1, priority: 1 });
TaskSchema.index({ createdBy: 1, status: 1 });
TaskSchema.index({ scheduledAt: 1, status: 1 });

module.exports = mongoose.model("Task", TaskSchema);
