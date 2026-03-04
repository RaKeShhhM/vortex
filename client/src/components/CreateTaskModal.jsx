import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createTask } from "../store/taskSlice";

export default function CreateTaskModal({ onClose }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ name: "", type: "email", priority: 5, payload: {} });
  const [emailFields, setEmailFields] = useState({ to: "", subject: "", body: "" });
  const [backupFields, setBackupFields] = useState({ source: "/data", destination: "/backup", compress: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true); setError("");
    const payload = form.type === "email" ? emailFields : backupFields;
    const result = await dispatch(createTask({ ...form, payload }));
    if (createTask.fulfilled.match(result)) { onClose(); }
    else { setError(result.payload || "Failed to create task"); }
    setLoading(false);
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 style={styles.title}>New Task</h2>
        <label style={styles.label}>Task Name</label>
        <input style={styles.input} placeholder="e.g. Send Welcome Email"
          value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <label style={styles.label}>Type</label>
        <select style={styles.input} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
          <option value="email">Email Job</option>
          <option value="backup">Backup Job</option>
        </select>
        <label style={styles.label}>Priority (1=highest, 10=lowest)</label>
        <input style={styles.input} type="number" min="1" max="10"
          value={form.priority} onChange={e => setForm({ ...form, priority: parseInt(e.target.value) })} />
        {form.type === "email" && (<>
          <label style={styles.label}>To (Email)</label>
          <input style={styles.input} placeholder="user@example.com" value={emailFields.to} onChange={e => setEmailFields({ ...emailFields, to: e.target.value })} />
          <label style={styles.label}>Subject</label>
          <input style={styles.input} placeholder="Email subject" value={emailFields.subject} onChange={e => setEmailFields({ ...emailFields, subject: e.target.value })} />
          <label style={styles.label}>Body</label>
          <textarea style={{ ...styles.input, height: "80px", resize: "vertical" }} value={emailFields.body} onChange={e => setEmailFields({ ...emailFields, body: e.target.value })} />
        </>)}
        {form.type === "backup" && (<>
          <label style={styles.label}>Source Path</label>
          <input style={styles.input} value={backupFields.source} onChange={e => setBackupFields({ ...backupFields, source: e.target.value })} />
          <label style={styles.label}>Destination Path</label>
          <input style={styles.input} value={backupFields.destination} onChange={e => setBackupFields({ ...backupFields, destination: e.target.value })} />
          <label style={styles.label}>
            <input type="checkbox" checked={backupFields.compress} onChange={e => setBackupFields({ ...backupFields, compress: e.target.checked })} />
            {" "}Compress backup
          </label>
        </>)}
        {error && <div style={styles.error}>{error}</div>}
        <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={styles.cancelBtn}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading} style={styles.submitBtn}>{loading ? "Creating..." : "Create Task"}</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 },
  modal: { background: "#0d0d15", border: "1px solid #1e1e2e", borderRadius: "14px", padding: "2rem", width: "100%", maxWidth: "480px", maxHeight: "90vh", overflowY: "auto" },
  title: { fontFamily: "Syne, sans-serif", color: "#fff", margin: "0 0 1.5rem", fontSize: "1.3rem" },
  label: { display: "block", color: "#666", fontSize: "0.72rem", fontFamily: "Space Mono, monospace", marginBottom: "0.3rem", marginTop: "0.75rem" },
  input: { width: "100%", background: "#13131f", border: "1px solid #2a2a3e", borderRadius: "8px", padding: "0.6rem 0.75rem", color: "#e0e0e0", fontSize: "0.85rem", boxSizing: "border-box", outline: "none", fontFamily: "Space Mono, monospace" },
  error: { color: "#ff6666", fontSize: "0.8rem", marginTop: "0.75rem", background: "#1a0a0a", padding: "0.5rem", borderRadius: "6px" },
  cancelBtn: { padding: "0.6rem 1.25rem", background: "transparent", border: "1px solid #333", color: "#888", borderRadius: "8px", cursor: "pointer", fontFamily: "Space Mono, monospace" },
  submitBtn: { padding: "0.6rem 1.25rem", background: "#00ff88", border: "none", color: "#000", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontFamily: "Syne, sans-serif", fontSize: "0.85rem" },
};
