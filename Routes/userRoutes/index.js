<<<<<<< HEAD
const { Router } = require("express");
const config = require("../../config.js");
const authorization = require("../../Middleware/authorization.js");
const User = require("../../Database/Models/userModel.js");

const router = Router();

router.post(
  "update-apperance",
  [
    body("username")
  ],
  authorization,
  async (req, res) => {
  
});
=======
const { Router } = require('express');
const config = require('../../config.js');
const authenticateJWT = require('../../Middleware/authorization.js');
const User = require('../../Database/Models/userModel.js');

const router = Router();

router.get('users', authenticateJWT, async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
})
>>>>>>> refs/remotes/origin/main

module.exports = router;