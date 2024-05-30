const { Router } = require("express");
const authenticateJWT = require("../Middlewares/authMiddleware.js");
const { body } = require('express-validator');
const router = Router();

const { startChats } = require('../Controllers/chatController.js');

// idk what this endpoint is for so i am leaving it till we get closer to client
router.get(
  "/chat", 
  authenticateJWT, 
  async (req, res) => {
  
});

// Does not work tight now
router.post(
  "/start-chat", 
  authenticateJWT, 
  startChats
);

module.exports = router;