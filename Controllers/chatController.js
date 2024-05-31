const Message = require('../Database/Models/messageModel.js');
const User = require('../Database/Models/userModel.js');
const Chat = require('../Database/Models/chatModel.js');

exports.startChat = async (req, res) => {
  try {
    const { userid } = req.body;
    const loggedUser = req.userId
    const users = [loggedUser, userid]
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

exports.sendMessage = async (req, res) => {
  try {
    const { chatId, message } = req.body;
    const chatGet = await Chat.findOne({
      _id: chatId
    });

    if (!chatGet) {
      res.status(404).json({ message: "Chat with provided id was not found" })
    } else {
      const newMessage = new Message({
        chatId,
        message,
        sender: req.userId
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" })
  }
}

exports.editMessage = async (req, res) => {
  try {
    const { messageId, message } = req.body;
    const messageGet = Message.findOne({
      _id: messageId
    });
    if (!messageGet) {
      res.status(404).json({ error: "Message was not found"});
    } else {
      const messageGet = Message.updateOne({
        _id: messageId
      }, {
        $set: {
          message
        }
      });
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Internal server error" })
  }
}