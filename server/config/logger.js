class Logger {
  static instance = null;
  constructor() {
    if (Logger.instance) return Logger.instance;
    Logger.instance = this;
  }
  _timestamp() { return new Date().toISOString(); }
  info(message) { console.log(`[${this._timestamp()}] INFO: ${message}`); }
  warn(message) { console.warn(`[${this._timestamp()}] WARN: ${message}`); }
  error(message) { console.error(`[${this._timestamp()}] ERROR: ${message}`); }
  success(message) { console.log(`[${this._timestamp()}] SUCCESS: ${message}`); }
}
module.exports = new Logger();
