const BaseJob = require("./BaseJob");
const fs = require("fs");       // built-in Node.js — no install needed
const path = require("path");   // built-in Node.js — no install needed

class BackupJob extends BaseJob {
  constructor(taskData) {
    super(taskData);
    this.source = taskData.payload?.source || "";
    this.destination = taskData.payload?.destination || "";
    this.compress = taskData.payload?.compress || false;
  }

  async run() {
    console.log(`[BackupJob] Starting backup...`);
    console.log(`[BackupJob] Source: ${this.source}`);
    console.log(`[BackupJob] Destination: ${this.destination}`);

    // Validation
    if (!this.source || !this.destination)
      throw new Error("BackupJob requires 'source' and 'destination' in payload");

    // Check source folder exists
    if (!fs.existsSync(this.source))
      throw new Error(`Source folder does not exist: ${this.source}`);

    // Create destination folder if it doesn't exist
    fs.mkdirSync(this.destination, { recursive: true });

    // Read all files in source folder
    const files = fs.readdirSync(this.source);

    if (files.length === 0) {
      console.log(`[BackupJob] Source folder is empty — nothing to backup`);
      return { type: "backup", source: this.source, destination: this.destination, filesCopied: 0 };
    }

    // Copy each file one by one
    let filesCopied = 0;
    for (const file of files) {
      const sourcePath = path.join(this.source, file);
      const destPath = path.join(this.destination, file);

      // Only copy files, skip subfolders (keep it simple)
      const stat = fs.statSync(sourcePath);
      if (stat.isFile()) {
        fs.copyFileSync(sourcePath, destPath);
        filesCopied++;
        console.log(`[BackupJob] Copied: ${file}`);
      }
    }

    console.log(`[BackupJob] Done! ${filesCopied} files copied to ${this.destination}`);

    return {
      type: "backup",
      source: this.source,
      destination: this.destination,
      filesCopied,
      completedAt: new Date().toISOString(),
    };
  }

  getSummary() {
    return { ...super.getSummary(), type: "BackupJob", source: this.source, destination: this.destination };
  }
}

module.exports = BackupJob;
