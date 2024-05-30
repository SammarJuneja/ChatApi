const { Router } = require("express");
const authenticateJWT = require("../Middlewares/authMiddleware.js");
const { body, oneOf } = require('express-validator');

const User = require("../Database/Models/userModel.js");
const { getAllUsers, modifyUser } = require("../Controllers/userController.js");

const router = Router();

router.get(
  "/users", 
  authenticateJWT,
  getAllUsers
);

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
  modifyUser
);

module.exports = router;