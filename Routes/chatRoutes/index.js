const { Router } = require("express");
const bcrypt = require("bcrypt");
const config = require("../../config.js");
const authenticateJWT = require("../../Middleware/authorization.js");
const {body} = require('express-validator');
const router = Router();

const User = require("../../Database/Models/userModel.js");
const Chat = require("../../Database/Models/chatModel.js");


router.get("/chats/:userId", authenticateJWT, async (req, res) => {
  
});

// Does not work tight now
router.post(
  "/start-chat",
  [
  body("participants")
  .isArray({ min: 2 })
  .custom(async (participants) => {
    const userGet = await User.find({
      _id: {
        $in: participants
      }
    });
  if (users.length !== participants.length) {
    throw new Error("Users were not found");
  }
  });
  ], authenticateJWT, async (req, res) {
    try {
      const { participants } = req.body;
      const newChat = new Chat({ participants });
      await newChat.save()
      res.status(200).json({ newChat });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  });

module.exports = router;