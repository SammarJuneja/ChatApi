const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  token: {
    type: String,
    required: true
  },
  device: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '7d'
  }
});

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;
