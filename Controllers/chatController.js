const Message = require('../Database/Models/messageModel.js');
const User = require('../Database/Models/userModel.js');
const Chat = require('../Database/Models/chatModel.js');

exports.getUserChats = async (req, res) => {
  try {
    const { userId } = req.params;
    const userGet = await Chat.find({
      participants: {
        $in: userId
      }
    });
    if (!userGet) {
      res.status(404).json({ error: "User has no chats"});
    } else {
      res.status(200).json({ userGet });
    }
  } catch {
    console.log(error)
    res.status(500).json({ error: "Internal server error" });
  }
}

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
      await newMessage.save();
      res.status(200).json({ newMessage })
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" })
  }
}

exports.addReaction = async (req, res) => {
  try {
    const { messageId, reaction } = req.body;
    const messageGet = Message.findOne({
      _id: messageId
    });
    if (!messageGet) {
      res.status(404).json({ error: "Message was not found"});
    } else {
      await Message.updateOne({
        _id: messageId
      }, {
        $push: {
          reaction: reaction
        }
      });
      res.status(200).send(`Reaction was added successfully`);
    }
  } catch (error) {
    console.log(error)
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
      await Message.updateOne({
        _id: messageId
      }, {
        $set: {
          message
        }
      });
      res.status(200).send(`Message was edited successfully`);
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Internal server error" })
  }
}

exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const messageGet = await Message.deleteOne({ _id: messageId });
    if (messageGet) {
      res.status(200).send("Message was deleted successfully");
    } else {
      res.status(404).json({ error: "Message was not found" });
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Internal server error" });
  }
}