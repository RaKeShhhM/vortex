const mongoose = require("mongoose");
const Task = require("../models/Task");
const TaskLog = require("../models/TaskLog");
const User = require("../models/User");
const scheduler = require("../scheduler/Scheduler");
const resourceMonitor = require("../utils/resourceMonitor");
const logger = require("../config/logger");

const createTask = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { name, type, priority, payload, scheduledAt } = req.body;
    if (!name || !type)
      return res.status(400).json({ success: false, message: "Name and type are required" });

    //I implemented a credit system where each user gets 100 credits and each task costs 1 credit — this demonstrates the ACID transaction concept where task creation and credit deduction happen atomically. For the live demo I removed the limit so anyone can test freely.
    // const user = await User.findById(req.user._id).session(session);
    // if (user.credits <= 0) {
    //   await session.abortTransaction(); session.endSession();
    //   return res.status(403).json({ success: false, message: "Insufficient credits" });
    // }
    const task = await Task.create([{ name, type, priority: priority || 5, payload: payload || {},
      scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(), createdBy: req.user._id }], { session });
    await User.findByIdAndUpdate(req.user._id, { $inc: { credits: -1 } }, { session });
    await TaskLog.create([{ task: task[0]._id, user: req.user._id, event: "scheduled",
      message: `Task "${name}" scheduled by ${req.user.name}` }], { session });
    await session.commitTransaction(); session.endSession();
    res.status(201).json({ success: true, data: task[0] });
  } catch (error) {
    await session.abortTransaction(); session.endSession();
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTasks = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { createdBy: req.user._id };
    if (status) filter.status = status;
    const tasks = await Task.find(filter).sort({ priority: 1, createdAt: -1 })
      .skip((page - 1) * limit).limit(parseInt(limit)).populate("createdBy", "name email");
    const total = await Task.countDocuments(filter);
    res.json({ success: true, data: tasks, pagination: { total, page: parseInt(page), pages: Math.ceil(total/limit) } });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, createdBy: req.user._id }).populate("createdBy","name email");
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });
    const logs = await TaskLog.find({ task: task._id }).populate("user","name email").sort({ createdAt: -1 });
    res.json({ success: true, data: { task, logs } });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const cancelTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });
    if (task.status === "running")
      return res.status(400).json({ success: false, message: "Cannot cancel a running task" });
    task.status = "cancelled"; await task.save();
    await TaskLog.create({ task: task._id, user: req.user._id, event: "cancelled", message: "Task cancelled" });
    res.json({ success: true, message: "Task cancelled" });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getSchedulerStatus = (req, res) => {
  try {
    res.json({ success: true, data: { scheduler: scheduler.getStatus(), system: resourceMonitor.getSystemSnapshot() } });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const deleteTasksByDay = async (req, res) => {
  try {
    const { date } = req.body;
    if (!date) return res.status(400).json({ success: false, message: "Date required" });
    const start = new Date(date); start.setHours(0, 0, 0, 0);
    const end = new Date(date); end.setHours(23, 59, 59, 999);
    const tasks = await Task.find({
      createdBy: req.user._id,
      createdAt: { $gte: start, $lte: end },
      status: { $nin: ["running"] },
    });
    const taskIds = tasks.map(t => t._id);
    await TaskLog.deleteMany({ task: { $in: taskIds } });
    await Task.deleteMany({ _id: { $in: taskIds } });
    res.json({ success: true, message: `Deleted ${taskIds.length} tasks`, count: taskIds.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });
    if (task.status === "running")
      return res.status(400).json({ success: false, message: "Cannot delete a running task" });
    await TaskLog.deleteMany({ task: task._id });
    await Task.findByIdAndDelete(task._id);
    res.json({ success: true, message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createTask, getTasks, getTaskById, cancelTask, getSchedulerStatus, deleteTask, deleteTasksByDay };
