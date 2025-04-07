const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const Message = require("./models/Message");
const User = require("./models/Users");
const sequelize = require("./config/database");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  socket.on("private-message", async ({ sender, receiver, text }) => {
    const newMsg = await Message.create({ sender, receiver, text });
    io.emit("private-message", newMsg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

// Connect to PostgreSQL and start server
sequelize
  .sync()
  .then(() => {
    console.log("PostgreSQL connected and models synced");
    server.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error("Database error:", err));
