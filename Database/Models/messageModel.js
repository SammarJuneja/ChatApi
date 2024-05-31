const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'Chat'
  },
  sender: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  message: {
    type: String,
    required: true
  },
  attachment: {
    type: String,
  },
  reaction: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['sent', 'read'],
    default: 'sent'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;