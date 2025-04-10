// src/controllers/messageController.js

const messageModel = require("../models/messageModel");

const sendMessage = async (req, res) => {
  const { sender, receiver, text, time } = req.body;
  try {
    const newMessage = await messageModel.createMessage(
      sender,
      receiver,
      text,
      new Date(time)
    );
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMessageHistory = async (req, res) => {
  const { sender, receiver } = req.params;
  try {
    const messages = await messageModel.getMessages(
      parseInt(sender),
      parseInt(receiver)
    );
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  sendMessage,
  getMessageHistory,
};
