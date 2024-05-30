const { validationResult } = require("express-validator");
const User = require("../Database/Models/userModel");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

exports.modifyUSer = async (req, res) => { 
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