const messageModel = require("../models/messageModel");
const { getSocket } = require("../socket/socketServer");

const sendMessage = async (req, res) => {
  const { senderId, receiverId, text, time } = req.body;
  const io = getSocket();

  try {
    const newMessage = await messageModel.createMessage(
      senderId,
      receiverId,
      text,
      new Date(time)
    );
    res.status(201).json(newMessage);
    io.to(senderId).emit("private-message", newMessage);
    io.to(receiverId).emit("private-message", newMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMessageHistory = async (req, res) => {
  const io = getSocket();
  const { sender, receiver } = req.params;
  try {
    const messages = await messageModel.getMessages(
      parseInt(sender),
      parseInt(receiver)
    );
    res.status(200).json(messages);
    io.emit("private-message", {
      senderId: parseInt(sender),
      receiverId: parseInt(receiver),
      messages,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  sendMessage,
  getMessageHistory,
};
