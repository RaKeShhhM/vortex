const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer"))
      token = req.headers.authorization.split(" ")[1];
    if (!token) return res.status(401).json({ success: false, message: "No token - access denied" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "vortex_secret_key");
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ success: false, message: "User not found" });
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") return next();
  res.status(403).json({ success: false, message: "Admin access required" });
};

module.exports = { protect, adminOnly };
