const jwt = require("jsonwebtoken");
const config = require("../config");
const User = require("../Database/Models/userModel");

const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: `Missing or malformed authorization header ${authHeader}` });
  }

  const token = authHeader.match(/Bearer (.*)/)[0];


  if (!token) {
    return res.status(401).json({ message: `Missing token in authorization header token - ${token}` });
  }

  try {
    jwt.verify(token, config.jwt.accessSecret, async (err, user) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }

      // (future) blacklisted tokens: check if token is blacklisted

      const dbUser = await User.findById(user.userId);
      if (!dbUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      req.user = user;
      next();
    });
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Access token expired' });
    } else if (err instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Invalid access token' });
    } else {
      res.status(500).json({ message: 'Internal Server error' });
    }
    console.error(err); // will be removed in production env
  }
};

module.exports = authenticateJWT;