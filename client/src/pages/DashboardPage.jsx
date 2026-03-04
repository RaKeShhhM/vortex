import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTasks, deleteTask, deleteTasksByDay } from "../store/taskSlice";
import Navbar from "../components/Navbar";
import TaskCard from "../components/TaskCard";
import CreateTaskModal from "../components/CreateTaskModal";
import SystemStatus from "../components/SystemStatus";

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector(s => s.tasks);
  const { user } = useSelector(s => s.auth);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [deletingDay, setDeletingDay] = useState(null);

  useEffect(() => {
    dispatch(fetchTasks());
    const interval = setInterval(() => dispatch(fetchTasks()), 5000);
    return () => clearInterval(interval);
  }, [dispatch]);

  // ---- GROUP TASKS BY DAY ----
  const groupedByDay = groupTasksByDay(list, filter);
  const days = Object.keys(groupedByDay).sort((a, b) => new Date(b) - new Date(a)); // newest day first

  const handleDeleteDay = async (dateStr) => {
    if (!window.confirm(`Delete all tasks from ${formatDayLabel(dateStr)}?`)) return;
    setDeletingDay(dateStr);
    await dispatch(deleteTasksByDay(dateStr));
    dispatch(fetchTasks());
    setDeletingDay(null);
  };

  const STATUS_FILTERS = ["all", "pending", "running", "completed", "failed"];

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.content}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>Task Queue</h1>
            <p style={styles.pageSub}>
              {list.length} total · Welcome, <span style={{ color: "#00ff88" }}>{user?.name}</span>
            </p>
          </div>
          <button onClick={() => setShowModal(true)} style={styles.newTaskBtn}>+ New Task</button>
        </div>

        {/* System status — admin only */}
        <SystemStatus />

        {/* Filter tabs */}
        <div style={styles.filters}>
          {STATUS_FILTERS.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              style={{ ...styles.filterBtn, ...(filter === s ? styles.filterActive : {}) }}>
              {s.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && list.length === 0 && (
          <div style={styles.empty}>Loading tasks...</div>
        )}

        {/* Empty state */}
        {!loading && list.length === 0 && (
          <div style={styles.empty}>
            No tasks yet. <span onClick={() => setShowModal(true)} style={styles.emptyLink}>Create one →</span>
          </div>
        )}

        {/* DAY GROUPS */}
        {days.map(dateStr => {
          const hourGroups = groupedByDay[dateStr]; // { "05:00": [...tasks], "06:00": [...] }
          const hours = Object.keys(hourGroups).sort((a, b) => b.localeCompare(a)); // latest hour first
          const totalTasksInDay = hours.reduce((acc, h) => acc + hourGroups[h].length, 0);
          if (totalTasksInDay === 0) return null;

          return (
            <div key={dateStr} style={styles.dayGroup}>

              {/* Day Header */}
              <div style={styles.dayHeader}>
                <div style={styles.dayLeft}>
                  <div style={styles.dayDot}></div>
                  <span style={styles.dayLabel}>{formatDayLabel(dateStr)}</span>
                  <span style={styles.dayCount}>{totalTasksInDay} tasks</span>
                </div>
                <button
                  onClick={() => handleDeleteDay(dateStr)}
                  disabled={deletingDay === dateStr}
                  style={styles.deleteDayBtn}>
                  {deletingDay === dateStr ? "Deleting..." : "🗑 Delete Day"}
                </button>
              </div>

              {/* HOUR SEGMENTS within this day */}
              {hours.map(hour => (
                <div key={hour} style={styles.hourSegment}>
                  {/* Hour label */}
                  <div style={styles.hourLabel}>
                    <span style={styles.hourTime}>{hour}</span>
                    <div style={styles.hourLine}></div>
                  </div>

                  {/* Tasks in this hour */}
                  <div style={styles.taskGrid}>
                    {hourGroups[hour].map(task => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        onDelete={async () => {
                          await dispatch(deleteTask(task._id));
                          dispatch(fetchTasks());
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })}

      </div>
      {showModal && <CreateTaskModal onClose={() => setShowModal(false)} />}
    </div>
  );
}

// ---- HELPER: Group tasks by day → hour ----
function groupTasksByDay(tasks, filter) {
  const filtered = filter === "all" ? tasks : tasks.filter(t => t.status === filter);
  const groups = {};

  filtered.forEach(task => {
    const date = new Date(task.createdAt || task.scheduledAt);
    const dayKey = date.toISOString().split("T")[0]; // "2026-03-04"
    const hour = date.getHours().toString().padStart(2, "0") + ":00"; // "05:00"

    if (!groups[dayKey]) groups[dayKey] = {};
    if (!groups[dayKey][hour]) groups[dayKey][hour] = [];
    groups[dayKey][hour].push(task);
  });

  return groups;
}

// ---- HELPER: Format day label ----
function formatDayLabel(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (dateStr === today.toISOString().split("T")[0]) return "Today";
  if (dateStr === yesterday.toISOString().split("T")[0]) return "Yesterday";
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

const styles = {
  page: { minHeight: "100vh", background: "#0a0a0f", color: "#e0e0e0" },
  content: { maxWidth: "1200px", margin: "0 auto", padding: "2rem 1.5rem" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" },
  pageTitle: { fontFamily: "Syne, sans-serif", fontSize: "2rem", fontWeight: 800, color: "#fff", margin: 0 },
  pageSub: { color: "#555", fontSize: "0.82rem", fontFamily: "Space Mono, monospace", marginTop: "0.4rem" },
  newTaskBtn: { padding: "0.65rem 1.5rem", background: "#00ff88", border: "none", borderRadius: "8px",
    color: "#000", fontWeight: 700, cursor: "pointer", fontFamily: "Syne, sans-serif", fontSize: "0.9rem" },
  filters: { display: "flex", gap: "0.5rem", marginBottom: "2rem", flexWrap: "wrap" },
  filterBtn: { padding: "0.35rem 0.85rem", background: "transparent", border: "1px solid #1e1e2e",
    borderRadius: "6px", color: "#555", cursor: "pointer", fontFamily: "Space Mono, monospace", fontSize: "0.68rem" },
  filterActive: { background: "#1a1a2e", borderColor: "#00ff8844", color: "#00ff88" },
  empty: { color: "#444", fontFamily: "Space Mono, monospace", fontSize: "0.85rem",
    padding: "3rem", textAlign: "center" },
  emptyLink: { color: "#00ff88", cursor: "pointer" },

  // Day group
  dayGroup: { marginBottom: "3rem" },
  dayHeader: { display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: "1.5rem", paddingBottom: "0.75rem", borderBottom: "1px solid #1a1a2e" },
  dayLeft: { display: "flex", alignItems: "center", gap: "0.75rem" },
  dayDot: { width: "10px", height: "10px", borderRadius: "50%", background: "#00ff88" },
  dayLabel: { fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#fff" },
  dayCount: { fontFamily: "Space Mono, monospace", fontSize: "0.72rem", color: "#555",
    background: "#13131f", padding: "0.2rem 0.6rem", borderRadius: "20px" },
  deleteDayBtn: { padding: "0.35rem 0.85rem", background: "transparent",
    border: "1px solid #ff444433", color: "#ff6666", borderRadius: "6px",
    cursor: "pointer", fontFamily: "Space Mono, monospace", fontSize: "0.72rem" },

  // Hour segment
  hourSegment: { marginBottom: "1.5rem", paddingLeft: "1rem" },
  hourLabel: { display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.75rem" },
  hourTime: { fontFamily: "Space Mono, monospace", fontSize: "0.72rem", color: "#444",
    minWidth: "40px" },
  hourLine: { flex: 1, height: "1px", background: "#1a1a2e" },
  taskGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1rem" },
};
