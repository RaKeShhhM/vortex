import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const handleLogout = () => { dispatch(logout()); navigate("/login"); };

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>
        <span style={styles.logoIcon}>⚡</span>
        <span style={styles.logoText}>VORTEX</span>
      </div>
      <div style={styles.right}>
        {user && (
          <>
            <span style={styles.userInfo}>
              <span style={styles.dot}></span>
              {user.name} · <span style={{ color: "#00ff88" }}>{user.credits} credits</span>
            </span>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: { display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 2rem", height: "64px", background: "#0d0d15",
    borderBottom: "1px solid #1e1e2e", position: "sticky", top: 0, zIndex: 100 },
  logo: { display: "flex", alignItems: "center", gap: "0.5rem" },
  logoIcon: { fontSize: "1.4rem" },
  logoText: { fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.3rem",
    color: "#00ff88", letterSpacing: "0.15em" },
  right: { display: "flex", alignItems: "center", gap: "1.5rem" },
  userInfo: { fontFamily: "Space Mono, monospace", fontSize: "0.78rem", color: "#888" },
  dot: { display: "inline-block", width: "7px", height: "7px", borderRadius: "50%",
    background: "#00ff88", marginRight: "6px" },
  logoutBtn: { padding: "0.4rem 1rem", background: "transparent", border: "1px solid #333",
    color: "#aaa", borderRadius: "6px", cursor: "pointer", fontFamily: "Space Mono, monospace", fontSize: "0.75rem" },
};
