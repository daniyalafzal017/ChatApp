const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const User = require("../models/Users");
const { getSocket } = require("../socket");

router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  const io = getSocket();

  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "User exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    console.log("Emitting new-user event");
    io.emit("new-user", user);

    res.status(201).json({ message: "User created" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({
      message: "Server error during signup process",
      error: err.message,
    });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid credentials" });

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/users", async (req, res) => {
  const io = getSocket();

  try {
    const users = await User.findAll({
      attributes: ["id", "username", "email"],
    });
    res.json(users);

    // Emit the updated list of users to all connected clients
    io.emit("update-user", users); // Emit the updated list of users
  } catch (err) {
    console.error("Fetch users error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
