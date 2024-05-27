const { Router } = require("express");
const bcrypt = require("bcrypt");
const config = require("../../config.js");
const authenticateJWT = require("../../Middleware/authorization.js");
const { body } = require('express-validator');

const User = require("../../Database/Models/userModel.js");
const Chat = require("../../Database/Models/chatModel.js");

const router = Router();