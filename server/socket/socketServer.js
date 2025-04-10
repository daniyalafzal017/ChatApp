const { Server } = require("socket.io");
const { prisma } = require("../prismaClient/client"); // Ensure Prisma client is imported correctly

let io;

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // Adjust this to match your frontend's URL
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected: " + socket.id);

    socket.on("new-user", async (data) => {
      console.log("New user event received", data);

      try {
        const users = await prisma.user.findMany({
          select: {
            id: true,
            username: true,
            email: true,
          },
        });

        io.emit("update-users", users);
        console.log("Emitted update-users event to all clients");
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    });

    socket.on("private-message", async ({ senderId, receiverId, text }) => {
      console.log("Private message received:", senderId, receiverId, text);
      const currentTime = new Date();

      try {
        const newMessage = await prisma.message.create({
          data: {
            senderId: senderId, // Correct field name
            receiverId: receiverId, // Correct field name
            text: text,
            time: currentTime,
          },
          include: {
            sender: {
              select: {
                id: true,
                username: true,
              },
            },
            receiver: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        });

        console.log("Message saved:", newMessage);

        // Emit message to receiver
        io.to(receiver).emit("private-message", {
          ...newMessage,
          time: currentTime.toISOString(),
        });

        // Emit message to sender
        io.to(sender).emit("private-message", {
          ...newMessage,
          time: currentTime.toISOString(),
        });
      } catch (err) {
        console.error("Error saving message:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected", socket.id);
    });
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
