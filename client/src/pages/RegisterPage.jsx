import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, clearError } from "../store/authSlice";
import { useNavigate, Link } from "react-router-dom";

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector(s => s.auth);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });

  useEffect(() => { if (token) navigate("/dashboard"); }, [token, navigate]);
  useEffect(() => { return () => dispatch(clearError()); }, [dispatch]);

  const handleSubmit = (e) => { e.preventDefault(); dispatch(registerUser(form)); };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>⚡ VORTEX</div>
        <h1 style={styles.title}>Create Account</h1>
        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Name</label>
          <input style={styles.input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <label style={styles.label}>Email</label>
          <input style={styles.input} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <label style={styles.label}>Password</label>
          <input style={styles.input} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          <label style={styles.label}>Role</label>
          <select style={styles.input} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          {error && <div style={styles.error}>{error}</div>}
          <button type="submit" disabled={loading} style={styles.btn}>{loading ? "Creating..." : "Create Account →"}</button>
        </form>
        <p style={styles.footer}>Have an account? <Link to="/login" style={styles.link}>Sign in</Link></p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0f", fontFamily: "Space Mono, monospace" },
  card: { background: "#0d0d15", border: "1px solid #1e1e2e", borderRadius: "16px", padding: "2.5rem", width: "100%", maxWidth: "400px" },
  logo: { fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#00ff88", marginBottom: "1.5rem" },
  title: { color: "#fff", margin: "0 0 1.5rem", fontFamily: "Syne, sans-serif", fontSize: "1.6rem" },
  label: { display: "block", color: "#555", fontSize: "0.72rem", marginBottom: "0.3rem", marginTop: "1rem" },
  input: { width: "100%", background: "#13131f", border: "1px solid #2a2a3e", borderRadius: "8px", padding: "0.65rem 0.75rem", color: "#e0e0e0", fontSize: "0.85rem", boxSizing: "border-box", outline: "none", fontFamily: "Space Mono, monospace" },
  error: { color: "#ff6666", fontSize: "0.78rem", margin: "0.75rem 0", background: "#1a0a0a", padding: "0.5rem 0.75rem", borderRadius: "6px" },
  btn: { width: "100%", marginTop: "1.5rem", padding: "0.75rem", background: "#00ff88", border: "none", borderRadius: "8px", color: "#000", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", fontFamily: "Syne, sans-serif" },
  footer: { textAlign: "center", marginTop: "1.5rem", color: "#444", fontSize: "0.78rem" },
  link: { color: "#00ff88", textDecoration: "none" },
};
