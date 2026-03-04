import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSchedulerStatus } from "../store/taskSlice";

export default function SystemStatus() {
  const dispatch = useDispatch();
  const { schedulerStatus } = useSelector((s) => s.tasks);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    if (user?.role === "admin") {
      dispatch(fetchSchedulerStatus());
      const interval = setInterval(() => dispatch(fetchSchedulerStatus()), 5000);
      return () => clearInterval(interval);
    }
  }, [user, dispatch]);

  if (!schedulerStatus || user?.role !== "admin") return null;
  const { scheduler, system } = schedulerStatus;
  const memUsed = parseFloat(system?.memory?.usagePercent || 0);
  const cpuLoad = parseFloat(system?.cpu?.loadPercent || 0);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>System Status <span style={{ color: "#00ff88", fontSize: "0.7rem" }}>● LIVE</span></h3>
      <div style={styles.grid}>
        <StatBox label="Queue Size" value={scheduler?.queueSize ?? 0} color="#00ff88" />
        <StatBox label="Active Workers" value={scheduler?.activeWorkers ?? 0} color="#00aaff" />
        <StatBox label="RAM Used" value={`${memUsed}%`} color={memUsed > 80 ? "#ff4444" : "#ffaa00"} />
        <StatBox label="CPU Load" value={`${cpuLoad}%`} color={cpuLoad > 80 ? "#ff4444" : "#ffaa00"} />
      </div>
      {scheduler?.nextTask && (
        <div style={styles.next}>Next: <span style={{ color: "#00ff88" }}>{scheduler.nextTask.name}</span> P{scheduler.nextTask.priority}</div>
      )}
      <div style={styles.uptime}>Uptime: {system?.uptime} · {system?.hostname}</div>
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div style={{ background: "#13131f", border: `1px solid ${color}33`, borderRadius: "8px", padding: "0.75rem", textAlign: "center" }}>
      <div style={{ fontFamily: "Space Mono, monospace", fontSize: "1.4rem", fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: "0.7rem", color: "#666", marginTop: "0.25rem", fontFamily: "Space Mono, monospace" }}>{label}</div>
    </div>
  );
}

const styles = {
  container: { background: "#0d0d15", border: "1px solid #1e1e2e", borderRadius: "12px", padding: "1.5rem", marginBottom: "2rem" },
  title: { fontFamily: "Syne, sans-serif", color: "#fff", margin: "0 0 1rem", fontSize: "0.95rem" },
  grid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" },
  next: { marginTop: "1rem", fontSize: "0.8rem", color: "#777", fontFamily: "Space Mono, monospace" },
  uptime: { marginTop: "0.5rem", fontSize: "0.7rem", color: "#444", fontFamily: "Space Mono, monospace" },
};
