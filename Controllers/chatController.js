const User = require('../Database/Models/userModel.js');
const Chat = require('../Database/Models/chatModel.js');

exports.startChat = async (req, res) => {
  try {
    const { userid } = req.body;
    const loggedUser = req.userId
    const users = [loggedUser, userid]
    console.log(users)
    const chatGet = await Chat.find({
      _id: {
        $in: users
      }
    });
    if (chatGet.length === 2) {
      res.status(200).json({ chatGet });
    } else {
      const newChat = new Chat({
        participants: users
      });
      await newChat.save()
      res.status(200).json({ newChat });
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Internal server error" });
  }
}