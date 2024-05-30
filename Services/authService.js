const bcrypt = require('bcrypt');
const User = require('../Database/Models/userModel');

exports.createUser = async (username, email, password, verificationToken) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return new User({ username, email, password: hashedPassword, verificationToken }).save();
};

exports.authenticateUser = async (username, email, password) => {
  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user) {
    throw new Error('User does not exist');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  return user;
};