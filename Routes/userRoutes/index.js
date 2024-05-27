const { Router } = require("express");
const config = require("../../config.js");
const authorization = require("../../Middleware/authorization.js");
const User = require("../../Database/Models/userModel.js");

const router = Router();

const strongPasswordReg = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?\d)(?=.*?[#?!@$%^&*-]).{8,}$/;

router.get('users', authenticateJWT, async (req, res) => {
    try {
      const users = await User.find();
      res.status(200).json({ users });
    } catch (err) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
});


router.post(
    'update-appearance',
    [
        body("username")
        .trim().escape()
        .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters long')
        .isAlphanumeric().withMessage('Username must be alphanumeric')
        .not().contains(' ').withMessage('Username cannot contain spaces')
        .custom(async username => {
        const user = await User.findOne({ username });
        if (user) {
          throw new Error('Username is already taken');
        }
    }),
    ],
    authorization, async (req, res) => {
        const { username } = req.body;
        const userid = req.user.userId;
        
        if (username) {
            const userGet = await User.findOne({ userid });
            if (userGet.username == username) {
                res.status(400).json({ error: "Your new username must be different from old username"});
            } else {
                await User.updateOne({ userid }, { username });
                res.status(200).json({ message: `Username changed to ${username} successfully` });
            }
        }
    });

module.exports = router;