const { Router } = require("express");
const config = require("../../config.js");
const authenticateJWT = require("../../Middleware/authorization.js");
const { body, validationResult, oneOf } = require('express-validator');

const User = require("../../Database/Models/userModel.js");

const router = Router();

router.get("/users", authenticateJWT, async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

const strongPasswordReg = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?\d)(?=.*?[#?!@$%^&*-]).{8,}$/;

router.post(
  '/edit',
  [
    oneOf([
      body("newUsername")
        .trim().escape()
        .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters long')
        .isAlphanumeric().withMessage('Username must be alphanumeric')
        .not().contains(' ').withMessage('Username cannot contain spaces')
        .custom(async username => {
          const user = await User.findOne({ username });
          if (user) throw new Error("Username is already taken");
        }),
      body('newEmail')
        .trim().escape()
        .isEmail().withMessage('Invalid E-mail address')
        .custom(async email => {
          const user = await User.findOne({ email });
          if (user) throw new Error("An account with this email already exist");
        }),
    ], {
      message: 'Must include one of the following: newUsername|newEmail'
    })
  ],
  authenticateJWT, 
  async (req, res) => { 
    const errors = validationResult(req);
    if (!errors.isEmpty()) 
      return res.status(400).json({ errors: errors.array() });

    const { newUsername, newEmail } = req.body;

    const userId = req.userId;
    const dbUser = await User.findOne({ _id: userId });
    if (!dbUser)
      return res.status(500).json({ message: "An unexpected error has occured" });
    
    let result = [];
    if (newUsername && dbUser.username !== newUsername) {
      dbUser.username = newUsername;
      await dbUser.save();
      result.push({ message: `Username changed to ${newUsername} successfully` });
    } else if (newUsername) {
      return res.status(400).json({ error: "Your new username must be different from old username"});
    }
        
    if (newEmail && dbUser.email !== newEmail) {
      dbUser.email = newEmail;
      await dbUser.save();
      result.push({ message: `Email changed to ${newEmail} successfully` });
    } else if (newEmail) {
      return res.status(400).json({ error: "Your new email must be different from old email"});
    }

    res.status(200).json({ message: 'Success', data: result });
  }
);

module.exports = router;
