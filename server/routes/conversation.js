const express = require("express");
const router = express.Router();
const { Message } = require("../models/Message");
const { Op } = require("sequelize");

// Route to get messages between sender and receiver
router.get("/:senderId/:receiverId", async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: senderId, receiverId: receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
      order: [["createdAt", "ASC"]],
    });

    res.status(200).json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ message: "Error fetching messages" });
  }
});

// Route to send a new message
router.post("/", async (req, res) => {
  try {
    const { sender, receiver, text } = req.body;

    // Create a new message and set the 'time' to the current date/time
    const newMessage = await Message.create({
      senderId: sender,
      receiverId: receiver,
      text: text,
      time: new Date(), // Set 'time' as the current timestamp
    });

    // Respond with the new message
    res.status(201).json(newMessage);
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ message: "Error sending message" });
  }
});

module.exports = router;
