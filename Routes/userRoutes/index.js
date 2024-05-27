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

module.exports = router;