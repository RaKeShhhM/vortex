import React from "react";
import { useDispatch } from "react-redux";
import { cancelTask } from "../store/taskSlice";

const STATUS_COLORS = {
  pending: "#ffaa00", running: "#00aaff",
  completed: "#00ff88", failed: "#ff4444", cancelled: "#666"
};

export default function TaskCard({ task, onDelete }) {
  const dispatch = useDispatch();

  const time = new Date(task.createdAt || task.scheduledAt).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", second: "2-digit"
  });

  return (
    <div style={styles.card}>
      {/* Top row */}
      <div style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          <span style={styles.typeTag}>{task.type.toUpperCase()}</span>
          <span style={styles.name}>{task.name}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem",
            fontSize: "0.75rem", fontFamily: "Space Mono, monospace", color: STATUS_COLORS[task.status] }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%",
              background: STATUS_COLORS[task.status], display: "inline-block" }}></span>
            {task.status}
          </div>
        </div>
      </div>

      {/* Meta info */}
      <div style={styles.meta}>
        <span>Priority: <b style={{ color: "#fff" }}>{task.priority}</b></span>
        <span>Time: <b style={{ color: "#aaa" }}>{time}</b></span>
        {task.workerId && <span>Worker: <b style={{ color: "#00aaff", fontSize: "0.65rem" }}>{task.workerId}</b></span>}
      </div>

      {/* Error message */}
      {task.errorMessage && (
        <div style={styles.error}>⚠ {task.errorMessage}</div>
      )}

      {/* Action buttons */}
      <div style={styles.actions}>
        {task.status === "pending" && (
          <button onClick={() => dispatch(cancelTask(task._id))} style={styles.cancelBtn}>
            Cancel
          </button>
        )}
        {task.status !== "running" && (
          <button onClick={onDelete} style={styles.deleteBtn}>
            🗑 Delete
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: { background: "#0d0d15", border: "1px solid #1e1e2e", borderRadius: "10px",
    padding: "1.25rem", transition: "border-color 0.2s" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" },
  typeTag: { background: "#1a1a2e", color: "#00aaff", fontSize: "0.65rem",
    padding: "0.15rem 0.5rem", borderRadius: "4px", fontFamily: "Space Mono, monospace" },
  name: { color: "#e0e0e0", fontFamily: "Syne, sans-serif", fontWeight: 600 },
  meta: { display: "flex", flexWrap: "wrap", gap: "1rem", fontSize: "0.75rem",
    color: "#666", fontFamily: "Space Mono, monospace", marginBottom: "0.5rem" },
  error: { marginTop: "0.5rem", fontSize: "0.75rem", color: "#ff6666",
    background: "#1a0a0a", padding: "0.4rem 0.75rem", borderRadius: "6px",
    fontFamily: "Space Mono, monospace" },
  actions: { display: "flex", gap: "0.5rem", marginTop: "0.75rem" },
  cancelBtn: { padding: "0.3rem 0.75rem", background: "transparent",
    border: "1px solid #ffaa0044", color: "#ffaa00", borderRadius: "6px",
    cursor: "pointer", fontSize: "0.72rem", fontFamily: "Space Mono, monospace" },
  deleteBtn: { padding: "0.3rem 0.75rem", background: "transparent",
    border: "1px solid #ff444433", color: "#ff6666", borderRadius: "6px",
    cursor: "pointer", fontSize: "0.72rem", fontFamily: "Space Mono, monospace" },
};
