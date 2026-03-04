const os = require("os");

class ResourceMonitor {
  constructor() {
    this.MIN_FREE_MEMORY_MB = 200;
    this.MAX_CPU_LOAD = 0.85;
    this.MAX_CONCURRENT_TASKS = 3;
  }

  getMemoryStatus() {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    return { totalMB: (total/1024/1024).toFixed(2), freeMB: (free/1024/1024).toFixed(2),
      usedMB: (used/1024/1024).toFixed(2), usagePercent: ((used/total)*100).toFixed(1) };
  }

  getCPUStatus() {
    const cpuCount = os.cpus().length;
    const [load1min] = os.loadavg();
    const loadPerCore = load1min / cpuCount;
    return { cores: cpuCount, load1min: load1min.toFixed(2),
      loadPerCore: loadPerCore.toFixed(2), loadPercent: (loadPerCore*100).toFixed(1), platform: os.platform() };
  }

  canAcceptNewTask(currentRunningCount = 0) {
    const memory = this.getMemoryStatus();
    const cpu = this.getCPUStatus();
    const checks = {
      memoryOK: parseFloat(memory.freeMB) >= this.MIN_FREE_MEMORY_MB,
      cpuOK: parseFloat(cpu.loadPerCore) <= this.MAX_CPU_LOAD,
      concurrencyOK: currentRunningCount < this.MAX_CONCURRENT_TASKS,
    };
    return { canAccept: checks.memoryOK && checks.cpuOK && checks.concurrencyOK, checks, memory, cpu };
  }

  getSystemSnapshot() {
    return { memory: this.getMemoryStatus(), cpu: this.getCPUStatus(),
      uptime: (os.uptime()/3600).toFixed(2) + " hours", hostname: os.hostname(),
      timestamp: new Date().toISOString() };
  }
}

module.exports = new ResourceMonitor();
