const bcrypt = require("bcryptjs");
const {
  createUser,
  getUserByEmail,
  getAllUsers,
} = require("../models/userModel");
const { getSocket } = require("../socket/socketServer");

// Signup Controller
async function signup(req, res) {
  const { username, email, password } = req.body;
  const io = getSocket();

  try {
    const existing = await getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ message: "User exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser(username, email, hashedPassword);

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
}

// Login Controller
async function login(req, res) {
  const { email, password } = req.body;

  try {
    const user = await getUserByEmail(email);
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
}

// Get Users Controller
async function getUsers(req, res) {
  const io = getSocket();

  try {
    const users = await getAllUsers();
    res.json(users);
    io.emit("update-user", users);
  } catch (err) {
    console.error("Fetch users error:", err);
    res.status(500).json({ message: err.message });
  }
}

module.exports = { signup, login, getUsers };
