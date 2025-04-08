const { Server } = require("socket.io");

let io;

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  return io;
}

function getSocket() {
  if (!io) {
    throw new Error("Socket.io is not initialized");
  }
  return io;
}

module.exports = { initializeSocket, getSocket };
