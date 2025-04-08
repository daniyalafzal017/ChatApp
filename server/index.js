const express = require("express");
const http = require("http");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const Message = require("./models/Message");
const User = require("./models/Users");
const sequelize = require("./config/database");
const { initializeSocket } = require("./socket"); // Import socket logic

const app = express();
app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = initializeSocket(server);
console.log("Socket.io initialized");

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  socket.on("new-user", async (data) => {
    console.log("New user event received", data);

    try {
      const users = await User.findAll();
      io.emit("update-users", users);
      console.log("Emitted update-users event to all clients");
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  });

  socket.on("private-message", async ({ sender, receiver, text }) => {
    console.log("Private message received:", sender, receiver, text);
    const newMsg = await Message.create({ sender, receiver, text });
    console.log("New message saved:", newMsg);
    io.emit("private-message", newMsg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

sequelize
  .sync()
  .then(() => {
    console.log("PostgreSQL connected and models synced");
    server.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error("Database error:", err));

module.exports = { io };
