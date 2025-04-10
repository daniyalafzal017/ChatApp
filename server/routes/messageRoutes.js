// src/routes/messageRoutes.js

const express = require("express");
const messageController = require("../controller/messageController");
const router = express.Router();

router.post("/send", messageController.sendMessage);
router.get("/history/:sender/:receiver", messageController.getMessageHistory);

module.exports = router;
