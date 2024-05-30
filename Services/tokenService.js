const jwt = require('jsonwebtoken');
const config = require('../config.js');
const Token = require('../Database/Models/tokenModel');
const User = require('../Database/Models/userModel');
const BlacklistedToken = require('../Database/Models/blacklistedTokenModel');

exports.generateTokens = async (user, device) => {
  const accessToken = jwt.sign({ userId: user._id }, config.jwt.accessSecret, { expiresIn: config.jwt.accessExpiresIn });
  const refreshToken = jwt.sign({ userId: user._id }, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn });

  await new Token({ userId: user._id, token: refreshToken, device }).save();

  return { accessToken, refreshToken };
};

exports.refreshTokens = async (refreshToken, device) => {
  const payload = jwt.verify(refreshToken, config.jwt.refreshSecret);
  const savedToken = await Token.findOne({ userId: payload.userId, token: refreshToken, device });
  if (!savedToken) {
    throw new Error('Invalid refresh token');
  }

  const user = await User.findById(payload.userId);
  const newAccessToken = jwt.sign({ userId: user._id }, config.jwt.accessSecret, { expiresIn: config.jwt.accessExpiresIn });
  const newRefreshToken = jwt.sign({ userId: user._id }, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn });

  await new Token({ userId: user._id, token: newRefreshToken, device }).save();

  return { newAccessToken, newRefreshToken };
};

exports.invalidateTokens = async (accessToken, device) => {
  const payload = jwt.verify(accessToken, config.jwt.accessSecret);

  // blacklist access token
  new BlacklistedToken({ userId: payload.userId, token: accessToken, device });

  // delete refresh token
  const result = await Token.deleteOne({ userId: payload.userId, device });
  if (result.deletedCount === 0) {
    throw new Error('Invalid refresh token');
  }
};