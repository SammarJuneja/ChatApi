const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();
require("dotenv").config();
const user = require("./Schemas/user.js");

app.use(express.json());

app.get("/", (req, res) => {
    res.send("hello world");
});

// SignUp endpoint
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({
      error: "Please fill all details"
    });
  }
  
  const usr = await user.findOne({
    email: req.body.email
  });
  
  if (usr) {
    return res.status(400).json({
      error: "The email your entered is already used"
    });
  }
  
  try {
    const encryption = await bcrypt.genSalt(10);
    
    const hashedPassword = await bcrypt.hash(password, encryption);
  
  const newUser = new user({
    username,
    email,
    password: hashedPassword
  });
  
  await newUser.save();
  
  const token = jwt.sign({
      id: newUser_.id
      email: email
    }, process.env.JWT_TOKEN);
  
  res.status(200).json({
    success: "User registered successfully",
    token: token
  });
  } catch(error) {
    res.status(500).json({
      error: error
    });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      error: "Please fill both email and password"
    });
  }
  
  const usr = await user.findOne({
    email
  });
  
  if (!usr) {
    return res.status(400).json({
      error: `User with email "${email}" doesn't exist`
    });
  }
  
  const pass = await bcrypt.compare(password, usr.password)
  if (!pass) {
    return res.status(400).json({
      error: "Invalid password"
    });
  }
  
  const token = jwt.sign({
    username: usr.username,
    email: usr.email
  }, process.env.JWT_TOKEN);
  
  res.status(200).json({
    success: `You are logged in as ${usr.username}`,
    token: token
  });
});

try {
mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log("MongoDB is connected successfully");
    app.listen(process.env.PORT || 3000, () => {
        console.log(`App is running on port https://localhost:${process.env.PORT || 3000}`);
    });
});
} catch (error) {
  res.status(400).json({
    error: error.message
  });
}

module.exports = app;