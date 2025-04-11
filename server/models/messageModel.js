// src/models/messageModel.js

const { prisma } = require("../prismaClient/client");

const createMessage = async (sender, receiver, text, time) => {
  console.log("Creating message:", {
    sender,
    receiver,
    text,
    time,
  });
  try {
    const message = await prisma.message.create({
      data: {
        sender,
        receiver,
        text,
        time,
      },
    });
    return message;
  } catch (error) {
    throw new Error("Error creating message: " + error.message);
  }
};

const getMessages = async (sender, receiver) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: sender,
            receiverId: receiver,
          },
          {
            senderId: receiver,
            receiverId: sender,
          },
        ],
      },
      orderBy: {
        time: "asc",
      },
    });
    return messages;
  } catch (error) {
    throw new Error("Error fetching messages: " + error.message);
  }
};

module.exports = {
  createMessage,
  getMessages,
};
