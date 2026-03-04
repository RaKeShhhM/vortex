const { workerData, parentPort } = require("worker_threads");

// ✅ Extract env vars passed from Scheduler
const { taskId, taskName, taskType, taskPayload, workerId, createdBy, env } = workerData;

// ✅ Set env vars so all modules can use process.env
process.env.MONGO_URI = env.MONGO_URI;
process.env.EMAIL_USER = env.EMAIL_USER;
process.env.EMAIL_PASS = env.EMAIL_PASS;

// Now load modules AFTER setting env vars
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
  parentPort.postMessage(`Starting "${taskName}" (${taskType})`);
  try {
    await connectDB();
    const job = createJob({ _id: taskId, name: taskName, type: taskType, payload: taskPayload });
    parentPort.postMessage(`Job created: ${job.constructor.name}`);

    const startTime = Date.now();
    await job.execute();
    const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);
    parentPort.postMessage(`"${taskName}" completed in ${executionTime}s`);

    // ✅ No transactions — works on all MongoDB setups
    await Task.findByIdAndUpdate(taskId, {
      status: "completed", isLocked: false,
      completedAt: new Date(), workerId: null
    });

    await TaskLog.create({
      task: taskId, user: createdBy, event: "completed",
      message: `Task "${taskName}" completed`,
      executionTime: parseFloat(executionTime),
      workerId, result: job.getSummary()
    });

    parentPort.postMessage(`✅ "${taskName}" done!`);
    process.exit(0);

  } catch (error) {
    parentPort.postMessage(`ERROR: ${error.message}`);
    try {
      await Task.findByIdAndUpdate(taskId, {
        status: "failed", isLocked: false,
        errorMessage: error.message, completedAt: new Date()
      });
      await TaskLog.create({
        task: taskId, user: createdBy, event: "failed",
        message: `Task "${taskName}" failed: ${error.message}`, workerId
      });
    } catch (dbError) {
      parentPort.postMessage(`DB error: ${dbError.message}`);
    }
    process.exit(1);
  }
}

runWorker();