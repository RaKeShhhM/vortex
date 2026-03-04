const express = require("express");
const router = express.Router();
const {
  createTask, getTasks, getTaskById,
  cancelTask, getSchedulerStatus,
  deleteTask, deleteTasksByDay
} = require("../controllers/taskController");
const { protect, adminOnly } = require("../middleware/auth");

router.use(protect);

router.get("/", getTasks);
router.post("/", createTask);

// ⚠️ ALL specific routes BEFORE any /:id routes
router.get("/scheduler/status", adminOnly, getSchedulerStatus);
router.delete("/bulk/day", deleteTasksByDay);

// ⚠️ Dynamic /:id routes LAST
router.get("/:id", getTaskById);
router.delete("/:id", cancelTask);
router.delete("/:id/permanent", deleteTask);

module.exports = router;