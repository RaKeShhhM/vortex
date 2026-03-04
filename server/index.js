require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const logger = require("./config/logger");
const scheduler = require("./scheduler/Scheduler");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ← ADD THIS LINE

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Vortex server is running!", timestamp: new Date().toISOString() });
});

app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }));

app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`);
  res.status(500).json({ success: false, message: "Internal server error" });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.success(`Vortex running on http://localhost:${PORT}`);
      logger.info("POST   /api/auth/register");
      logger.info("POST   /api/auth/login");
      logger.info("GET    /api/auth/me");
      logger.info("GET    /api/tasks");
      logger.info("POST   /api/tasks");
      logger.info("GET    /api/tasks/:id");
      logger.info("DELETE /api/tasks/:id");
      logger.info("GET    /api/tasks/scheduler/status  [admin]");
      logger.info("GET    /api/health");
    });
    scheduler.start();
    process.on("SIGINT", () => { scheduler.stop(); process.exit(0); });
    process.on("SIGTERM", () => { scheduler.stop(); process.exit(0); });
  } catch (error) {
    logger.error(`Failed to start: ${error.message}`);
    process.exit(1);
  }
};

startServer();
