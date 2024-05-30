const User = require('../Database/Models/userModel.js');
const Chat = require('../Database/Models/chatModel.js');

exports.startChat = async (req, res) => {
  try {
    const { userid } = req.body;
    const loggedUser = req.userId;
    const chatGet = await Chat.find({ participants: [loggedUser, userid] });
    //  idk what i did here
    if (chatGet.length === 2) {
      res.status(200).json({ chatGet });
    } else {
      const newChat = new Chat({ participants });
      await newChat.save()
    }
    res.status(200).json({ newChat });
  } catch (error) {
    res.status(500).json({ error: error });
  }
}