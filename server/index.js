const express = require("express");
const http = require("http");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { initializeSocket } = require("./socket/socketServer");
const { prisma } = require("./prismaClient/client"); // Correct import

const app = express();
app.use(cors());
app.use(express.json());

app.use(async (req, res, next) => {
  try {
    await prisma.$connect();
    console.log("Connected to the database successfully");
    next();
  } catch (error) {
    console.error("Error connecting to the database:", error);
    res.status(500).send("Error connecting to the database");
  }
});

app.use("/auth", authRoutes);
app.use("/messages", messageRoutes);

const server = http.createServer(app);
const io = initializeSocket(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
