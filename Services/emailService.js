const nodemailer = require('nodemailer');
const { nodemailer: config } = require('../config.js');
const { service, email, password } = config;

const User = require('../Database/Models/userModel.js');

const transporter = nodemailer.createTransport({
  service: service,
  auth: {
    user: email,
    pass: password,
  },
});

exports.sendVerificationEmail = async (userEmail, verificationToken) => {
  try {
    await transporter.sendMail({
      from: email,
      to: userEmail,
      subject: 'Email Verification',
      text: `Please verify your email by clicking the following link: http://localhost:3000/verify?token=${verificationToken}`,
    });
  } catch (error) {
    console.error(error);
  }
}

exports.sendPasswordResetEmail = async (userEmail, resetToken) => {
  try {
    await transporter.sendMail({
      from: email,
      to: userEmail,
      subject: 'Password Reset',
      text: `Please reset your password by clicking the following link: http://localhost:3000/password-reset?token=${resetToken}`,
    });
  } catch (error) {
    console.error(error);
  }
}

exports.verifyUserEmail = async (verificationToken) => {
  const user = await User.findOne({ verificationToken });
  if (!user) throw new Error('Invalid verification token');

  if (user.isVerified) return;

  user.isVerified = true;
  user.verificationToken = null;
  await user.save();
}