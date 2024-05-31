const express = require("express");
const app = express();
const connectDB = require('./Database/index.js');
connectDB();

app.use(express.json());

const Routes = require('./Routes');

app.use('/api/v2', Routes);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

/* to be moved
// User
app.get("/user/:id", authorizatonToken, async (req, res) => {
    try {
  const usr = await user.findOne({
    _id: req.params.id
  }).select({
    password: 0
  });
  
  console.log(usr)
  
  if (!usr) {
    return res.status(404).json({
      error: "User not found"
    });
  }
  
  res.status(200).json({
    user: usr
  });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Send message

app.post("sendmessage/:userid", authorizatonToken, async (req, res) => {
  const chatGet = chat.findOne({
    
  });
});
// */

module.exports = app;