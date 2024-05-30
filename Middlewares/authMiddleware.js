const jwt = require("jsonwebtoken");
const config = require("../config");
const User = require("../Database/Models/userModel");
const BlacklistedToken = require("../Database/Models/blacklistedTokenModel");

const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: `Missing or malformed authorization header` });
  }

  const token = authHeader.split(/Bearer /)[1];
  if (!token) {
    return res.status(401).json({ message: `Missing token in authorization header` });
  }

  try {
    jwt.verify(token, config.jwt.accessSecret, async (err, { userId }) => {
      if (err) 
        return res.status(401).json({ message: 'Invalid or expired token' });

      const blacklistedToken = await BlacklistedToken.findOne({ token });
      if (blacklistedToken)
        return res.status(401).json({ message: 'Invalid or expired token' });

      const dbUser = await User.findById(userId);
      if (!dbUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      req.userId = userId;
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