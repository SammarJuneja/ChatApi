const { Router } = require("express");
const authenticateJWT = require("../Middlewares/authMiddleware.js");
const { body } = require('express-validator');
const router = Router();

const { startChat, sendMessage } = require('../Controllers/chatController.js');

// idk what this endpoint is for so i am leaving it till we get closer to client
router.get(
  "/chat", 
  authenticateJWT, 
  async (req, res) => {
  
});

router.post(
  "/start-chat",
  [
    body("userid")
    .notEmpty().withMessage("User was not found"),
  ],
  authenticateJWT, 
  startChat
);

router.post(
  "/send-message"
  [
    body("chat")
    .trim().escape()
    .notEmpty().withMessage("ChatId was not provided")
    .custom(async chatId => {
      const chatGet = await Chat.findOne({
        _id: chatId
      });
      if (!chatGet) {
        res.status(404).json({ message: "Chat with provided id was not found" })
      }
    }),
    body("message")
    .trim().escape()
    .notEmpty().withMessage("You can\'t send empty message")
  ],
  authenticateJWT,
  sendMessage
);

module.exports = router;