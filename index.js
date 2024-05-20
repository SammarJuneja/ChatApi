const express = require("express");
const mongoose = require("mongoose");
const app = express();
require("dotenv").config();
const User = require("./Schemas/user.js");

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
  
  const user = await User.findOne({
    email: req.body.email
  });
  
  if (user) {
    return res.status(400).json({
      error: "The email your entered is already used"
    });
  }
  
  try {
  const newUser = new User({
    username,
    email,
    password
  });
  
  await newUser.save();
  
  res.status(200).json({
    success: "User registered successfully"
  });
  } catch(error) {
    res.status(400).json({
      error: error.message
    });
  }
});

app.get("/login", async (req, res) => {
  res.send("no");
});

//test
//ok

mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log("MongoDB is connected successfully");
    app.listen(process.env.PORT || 3000, () => {
        console.log(`App is running on port https://localhost:${process.env.PORT || 3000}`);
    });
});

module.exports = app;