require("dotenv").config(); 
const { workerData, parentPort } = require("worker_threads");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Task = require("../models/Task");
const TaskLog = require("../models/TaskLog");
const EmailJob = require("../jobs/EmailJob");
const BackupJob = require("../jobs/BackupJob");

function createJob(taskData) {
  switch (taskData.type) {
    case "email": return new EmailJob(taskData);
    case "backup": return new BackupJob(taskData);
    default: throw new Error(`Unknown job type: ${taskData.type}`);
  }
}

async function runWorker() {
  const { taskId, taskName, taskType, taskPayload, workerId, createdBy } = workerData;
  parentPort.postMessage(`Starting "${taskName}" (${taskType})`);
  try {
    await connectDB();
    const job = createJob({ _id: taskId, name: taskName, type: taskType, payload: taskPayload });
    parentPort.postMessage(`Job created: ${job.constructor.name}`);
    const startTime = Date.now();
    await job.execute();
    const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);
    parentPort.postMessage(`"${taskName}" completed in ${executionTime}s`);

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      await Task.findByIdAndUpdate(taskId,
        { status: "completed", isLocked: false, completedAt: new Date(), workerId: null }, { session });
      await TaskLog.create([{ task: taskId, user: createdBy, event: "completed",
        message: `Task "${taskName}" completed`, executionTime: parseFloat(executionTime),
        workerId, result: job.getSummary() }], { session });
      await session.commitTransaction();
      session.endSession();
    } catch (dbError) {
      await session.abortTransaction();
      session.endSession();
      throw new Error(`DB update failed: ${dbError.message}`);
    }
    process.exit(0);
  } catch (error) {
    parentPort.postMessage(`ERROR: ${error.message}`);
    try {
      await Task.findByIdAndUpdate(taskId, { status: "failed", isLocked: false,
        errorMessage: error.message, completedAt: new Date() });
      await TaskLog.create({ task: taskId, user: createdBy, event: "failed",
        message: `Task "${taskName}" failed: ${error.message}`, workerId });
    } catch (dbError) { parentPort.postMessage(`DB error: ${dbError.message}`); }
    process.exit(1);
  }
}

runWorker();
