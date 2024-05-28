const mongoose = require('mongoose');

const blacklistedTokenSchema = new mongoose.Schema({
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

const blacklistedToken = mongoose.model('BlacklistedToken', blacklistedTokenSchema);

module.exports = blacklistedToken;
