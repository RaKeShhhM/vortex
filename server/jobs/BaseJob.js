class BaseJob {
  constructor(taskData) {
    this.id = taskData._id?.toString() || `job_${Date.now()}`;
    this.name = taskData.name || "Unnamed Job";
    this.priority = taskData.priority || 5;
    this.payload = taskData.payload || {};
    this.createdAt = taskData.createdAt || new Date();
    this.scheduledAt = taskData.scheduledAt || new Date();
    this._status = "pending";
    this._startTime = null;
    this._endTime = null;
    this._error = null;
  }

  get status() { return this._status; }

  start() {
    if (this._status !== "pending") throw new Error(`Cannot start job that is already ${this._status}`);
    this._status = "running";
    this._startTime = Date.now();
    console.log(`[${this.name}] Job started`);
  }

  complete() {
    this._status = "completed";
    this._endTime = Date.now();
    console.log(`[${this.name}] Completed in ${this.getElapsedTime()}s`);
  }

  fail(errorMessage) {
    this._status = "failed";
    this._endTime = Date.now();
    this._error = errorMessage;
    console.error(`[${this.name}] Failed: ${errorMessage}`);
  }

  getElapsedTime() {
    if (!this._startTime) return 0;
    return ((Date.now() - this._startTime) / 1000).toFixed(2);
  }

  getSummary() {
    return { id: this.id, name: this.name, priority: this.priority,
      status: this._status, elapsedTime: this.getElapsedTime() + "s", error: this._error };
  }

  async run() {
    throw new Error(`run() not implemented in ${this.constructor.name}`);
  }

  async execute() {
    try {
      this.start();
      await this.run();
      this.complete();
    } catch (error) {
      this.fail(error.message);
      throw error;
    }
  }
}

module.exports = BaseJob;
