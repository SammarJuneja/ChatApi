const { Router } = require("express");
const bcrypt = reqiure("bcrypt");
const config = require("../../config.js");
const authenticateJWT = require("../../Middleware/authorization.js");
const { body } = require('express-validator');
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
    '/update-appearance',
    [
    body("username")
        .trim().escape()
        .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters long')
        .isAlphanumeric().withMessage('Username must be alphanumeric')
        .not().contains(' ').withMessage('Username cannot contain spaces')
        .custom(async username => {
            const user = await User.findOne({ username });
            if (user) {
                throw new Error("Username is already taken");
            }
        }),
    body('email')
        .trim().escape()
        .isEmail().withMessage('Invalid E-mail address')
        .custom(async email => {
            const user = await User.findOne({ email });
            if (user) {
                throw new Error("User is already used");
            }
        }),
    body('password')
        .trim().escape()
        .notEmpty().withMessage('Password is required')
        .matches(strongPasswordReg)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number, and be at least 8 characters long'),
    ],
    authenticateJWT, async (req, res) => { 
        const { username, email, password } = req.body;
        const userid = req.user.userId;
        const userGet = await User.findOne({ _id: userid });

        const passwordCompare = bcrypt.compare(password, userGet.password);

        if (!passwordCompare) {
            return res.status(400).json({ error: "Incorrect password" })
        }
        
        if (username) {
            if (userGet.username === username) {
                res.status(400).json({ error: "Your new username must be different from old username"});
            } else {
                await User.updateOne({ userid }, { username });
                res.status(200).json({ message: `Username changed to ${username} successfully` });
            }
        }

        if (email) {
            if (userGet.email === email) {
                res.status(400).json({ error: "Your new email must be different from old email"});
            } else {
                await User.updateOne({ userid }, { email });
                res.status(200).json({ message: `Email changed to ${email} successfully` });
            }
        }
    });


module.exports = router;