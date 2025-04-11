const { Server } = require("socket.io");
const { prisma } = require("../prismaClient/client"); // Ensure Prisma client is imported correctly

let io;

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // Adjust to your frontend URL
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join the user to a room using their user ID
    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their private room`);
    });

    socket.on("new-user", async () => {
      try {
        const users = await prisma.user.findMany({
          select: {
            id: true,
            username: true,
            email: true,
          },
        });

        io.emit("update-users", users);
        console.log("Broadcasted updated user list.");
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    });

    socket.on("private-message", async ({ senderId, receiverId, text }) => {
      console.log(
        "Private message received:",
        senderId,
        "->",
        receiverId,
        text
      );
      const currentTime = new Date();

      try {
        const newMessage = await prisma.message.create({
          data: {
            senderId,
            receiverId,
            text,
            time: currentTime,
          },
        });

        const messagePayload = {
          ...newMessage,
          time: currentTime.toISOString(),
        };

        // Emit to sender and receiver using their user ID rooms
        io.to(senderId).emit("private-message", messagePayload);
        io.to(receiverId).emit("private-message", messagePayload);
        console.log("Emitted private message to both sender and receiver");
      } catch (err) {
        console.error("Error saving message:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
}

function getSocket() {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}

module.exports = { initializeSocket, getSocket };
