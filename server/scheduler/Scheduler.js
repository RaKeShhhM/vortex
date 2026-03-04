const { Worker } = require("worker_threads");
const path = require("path");
const mongoose = require("mongoose");
const Task = require("../models/Task");
const TaskLog = require("../models/TaskLog");
const PriorityQueue = require("./PriorityQueue");
const resourceMonitor = require("../utils/resourceMonitor");
const logger = require("../config/logger");

class Scheduler {
  constructor() {
    this.queue = new PriorityQueue();
    this.activeWorkers = new Map();
    this.isRunning = false;
    this.pollInterval = 5000;
    this._timer = null;
  }

  start() {
    if (this.isRunning) { logger.warn("Scheduler already running!"); return; }
    this.isRunning = true;
    logger.info("Vortex Scheduler started - polling every 5s");
    this._timer = setInterval(() => this._tick(), this.pollInterval);
    this._tick();
  }

  stop() {
    this.isRunning = false;
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
    logger.info("Scheduler stopped.");
  }

  async _tick() {
    try {
      await this._loadPendingTasks();
      await this._dispatchTasks();
    } catch (error) {
      logger.error(`Scheduler tick error: ${error.message}`);
    }
  }

  async _loadPendingTasks() {
    const pendingTasks = await Task.find({
      status: "pending", isLocked: false, scheduledAt: { $lte: new Date() },
    }).sort({ priority: 1 }).limit(10);

    for (const task of pendingTasks) {
      const alreadyQueued = this.queue._heap.find(j => j.id === task._id.toString());
      if (!alreadyQueued) {
        this.queue.enqueue({ id: task._id.toString(), name: task.name, priority: task.priority,
          type: task.type, payload: task.payload, status: "pending", createdBy: task.createdBy });
      }
    }
    if (pendingTasks.length > 0)
      logger.info(`Loaded ${pendingTasks.length} tasks. Queue: ${this.queue.size}`);
  }

  async _dispatchTasks() {
    while (!this.queue.isEmpty()) {
      const check = resourceMonitor.canAcceptNewTask(this.activeWorkers.size);
      if (!check.canAccept) { logger.warn("Resources low. Waiting..."); break; }
      const jobData = this.queue.dequeue();
      if (jobData) await this._spawnWorker(jobData);
    }
  }

  async _spawnWorker(jobData) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const task = await Task.findByIdAndUpdate(jobData.id,
        { status: "running", isLocked: true, startedAt: new Date(), workerId: `worker_${Date.now()}` },
        { new: true, session });
      if (!task) { await session.abortTransaction(); session.endSession(); return; }
      await TaskLog.create([{ task: task._id, user: task.createdBy, event: "started",
        message: `"${task.name}" picked up by ${task.workerId}`, workerId: task.workerId }], { session });
      await session.commitTransaction();
      session.endSession();
      this._createWorkerThread(task);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error(`Failed to lock task: ${error.message}`);
    }
  }

  _createWorkerThread(task) {
    const workerPath = path.join(__dirname, "../workers/taskWorker.js");
    const worker = new Worker(workerPath, {
      workerData: { taskId: task._id.toString(), taskName: task.name, taskType: task.type,
        taskPayload: task.payload, workerId: task.workerId, createdBy: task.createdBy.toString() },
    });
    this.activeWorkers.set(task.workerId, worker);
    logger.info(`Worker spawned for "${task.name}"`);
    worker.on("message", (msg) => logger.info(`[${task.workerId}] ${msg}`));
    worker.on("exit", async (code) => {
      this.activeWorkers.delete(task.workerId);
      if (code !== 0) await this._handleWorkerCrash(task._id, task.workerId, code);
    });
    worker.on("error", async (err) => {
      this.activeWorkers.delete(task.workerId);
      await this._handleWorkerCrash(task._id, task.workerId, err.message);
    });
  }

  async _handleWorkerCrash(taskId, workerId, reason) {
    try {
      await Task.findByIdAndUpdate(taskId, { status: "failed", isLocked: false,
        errorMessage: `Worker crashed: ${reason}`, completedAt: new Date() });
    } catch (err) { logger.error(`Failed to update crashed task: ${err.message}`); }
  }

  getStatus() {
    return { isRunning: this.isRunning, queueSize: this.queue.size,
      activeWorkers: this.activeWorkers.size, workerIds: Array.from(this.activeWorkers.keys()),
      nextTask: this.queue.peek() ? { name: this.queue.peek().name, priority: this.queue.peek().priority } : null };
  }
}

module.exports = new Scheduler();
