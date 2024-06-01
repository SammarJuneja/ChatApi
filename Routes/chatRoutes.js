const { Router } = require("express");
const { body } = require('express-validator');
const authenticateJWT = require("../Middlewares/authMiddleware.js");

const Message = require('../Database/Models/messageModel.js');
const User = require('../Database/Models/userModel.js');
const Chat = require('../Database/Models/chatModel.js');

const router = Router();

const {
  startChat,
  sendMessage,
  editMessage,
  addReaction
} = require('../Controllers/chatController.js');

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
  "/send-message",
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

router.put(
  "/edit-message",
  [
    body("messageId")
    .trim().escape()
    .notEmpty().withMessage("MessageId was not provided")
    .custom(async chatId => {
      const messageGet = await Message.findOne({
        _id: messageId
      });
      if (!messageGet) {
        throw new Error("Message with provided id was not found")
      }
    }),
    body("message")
    .trim().escape(),
  ],
  authenticateJWT,
  editMessage
  );
  
router.put(
  "/add-reaction",
  [
    body("messageId")
    .trim().escape()
    .notEmpty().withMessage("MessageId was not provided")
    .custom(async chatId => {
      await Message.findOne({
        _id: messageId
      });
      if (!messageGet) {
        res.status(404).json({ message: "Message with provided id was not found" })
      }
    }),
    body("reaction")
    .trim().escape()
    .notEmpty().withMessage("Cannot add empty reaction"),
    ],
    authenticateJWT,
    addReaction
    )

module.exports = router;
