const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const User = require("../models/Users");

router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body; // Extract email as well
  try {
    const existing = await User.findOne({ where: { username } });
    if (existing) return res.status(400).json({ message: "User exists" });

    // Now include email when creating the user
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User created" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt:", email, password); // Log the email and password

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // Compare the hashed password with the entered password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid credentials" });

    res.json({ message: "Login successful", user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
