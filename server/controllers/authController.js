const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || "vortex_secret_key", { expiresIn: "7d" });

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: "Email already registered" });
    const user = await User.create({ name, email, password, role: role || "user" });
    const token = generateToken(user._id);
    res.status(201).json({ success: true, token,
      data: { id: user._id, name: user.name, email: user.email, role: user.role, credits: user.credits } });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password required" });
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    const token = generateToken(user._id);
    res.json({ success: true, token,
      data: { id: user._id, name: user.name, email: user.email, role: user.role, credits: user.credits } });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getMe = async (req, res) => res.json({ success: true, data: req.user });

module.exports = { register, login, getMe };
