const { Router } = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult, oneOf } = require('express-validator');
const config = require('../../config.js');
const authorization = require("../../Middleware/authorization.js")

const router = Router();

const User = require('../../Database/Models/userModel.js');
const Token = require('../../Database/Models/tokenModel.js');

const generateAccessToken = user => {
  return jwt.sign({ userId: user._id }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessTokenExpiry,
  });
};

const generateRefreshToken = async (user, device) => {
  const refreshToken = jwt.sign({ userId: user._id }, config.jwt.refreshSecret, { 
    expiresIn: config.jwt.refreshTokenExpiry 
  });
  await new Token({ userId: user._id, token: refreshToken, device }).save();
  return refreshToken;
};

// SECURITY: MUST implement token blacklisting
//             * blacklist tokens yet to expire of logged out/changed tokens
const strongPasswordReg = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?\d)(?=.*?[#?!@$%^&*-]).{8,}$/;

router.post(
  '/register',
  authorization
  [
    body('username')
      .trim().escape()
      .notEmpty().withMessage('Username is required')
      .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters long')
      .isAlphanumeric().withMessage('Username must be alphanumeric')
      .not().contains(' ').withMessage('Username cannot contain spaces')
      .custom(async username => {
        const user = await User.findOne({
          username
        });
        if (user) {
          throw new Error('User already exists');
        }
      }),
    body('email')
      .trim().escape()
      .notEmpty().withMessage('E-mail is required')
      .isEmail().withMessage('Invalid E-mail address')
      .custom(async email => {
        const user = await User.findOne({ email });
        if (user) {
          throw new Error('User already exists');
        }
      }),
    body('password')
      .trim().escape()
      .notEmpty().withMessage('Password is required')
      .matches(strongPasswordReg)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number, and be at least 8 characters long'),
    body('device')
      .trim().escape()
      .notEmpty().withMessage('Device is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password, device } = req.body;

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await new User({ username, email, password: hashedPassword }).save();

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user, device);

      res.status(200).json({ accessToken, refreshToken });
    } catch (err) {
      await res.status(500).json({ message: err.message });
      console.error(err); // will remove in production env
    }    
  }
);

// gonna need /verify for email verification in the future

router.post(
  '/login',
  [
    oneOf(
      [
        body('username')
          .trim().escape()
          .notEmpty().withMessage('Username is required')
          .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters long')
          .isAlphanumeric().withMessage('Username must be alphanumeric')
          .not().contains(' ').withMessage('Username cannot contain spaces')
          .custom(async username => {
            const user = await User.findOne({ username });
            if (!user) {
              throw new Error('User doesn\'t exists');
            }
          }),
        body('email')
          .trim().escape()
          .notEmpty().withMessage('E-mail is required')
          .isEmail().withMessage('Invalid E-mail address')
          .custom(async email => {
            const user = await User.findOne({ email });
            if (!user) {
              throw new Error('User doesn\'t exists');
            }
          }),
      ],
      {
        message: 'At least Username or Email must be provided'
      }
    ),
    body('password')
      .trim().escape()
      .notEmpty().withMessage('Password is required')
      .matches(strongPasswordReg)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number, and be at least 8 characters long'),
    body('device')
      .trim().escape()
      .notEmpty().withMessage('Device is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

      const { username, email, password, device } = req.body;

      const user = await User.findOne({ $or: [{ username }, { email }] });
      if (!user)
        return res.status(401).json({ message: 'User does not exist' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(401).json({ message: 'Invalid credentials' });

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user, device);

      res.status(200).json({ accessToken, refreshToken });
    } catch (err) {
      res.status(500).json({ message: 'Internal server error' });
      console.error(err); // will be removed in production env
    }
  },
);

router.post(
  '/token', 
  [
    body('device')
      .trim().escape()
      .notEmpty().withMessage('Device is required'),
    // gonna check headers here instead of down there
  ], 
  async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ message: 'Missing or malformed authorization header' });

  const refreshToken = authHeader.split(' ')[1];
  
  if (!refreshToken)
    return res.status(401).json({ message: 'Missing refresh token' });

  const { device } = req.body;
  try {
    const payload = jwt.verify(refreshToken, config.jwt.refreshSecret);

    const savedToken = await Token.findOne({ userId: payload.userId, token: refreshToken, device });
    if (!savedToken)
      return res.status(401).json({ message: 'Invalid refresh token' });

    const user = await User.findById(payload.userId);
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = await generateRefreshToken(user, device);

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      await Token.deleteOne({ refreshToken });
      res.status(401).json({ message: 'Refresh token expired' });
    } else if (err instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Invalid refresh token' });
    } else {
      res.status(500).json({ message: 'Internal Server error' });
    }
    console.error(err); // will be removed in production env
  }
});

router.post('/password-reset', (req, res) => {});

router.post('/logout', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ message: 'Missing or malformed authorization header' });

  const refreshToken = authHeader.split(' ')[1];
  
  if (!refreshToken)
    return res.status(401).json({ message: 'Missing access token' });

  const { device } = req.body;
  try {
    const result = await Token.deleteOne({ refreshToken, device });

    if (result.deletedCount === 0)
      return res.status(401).json({ message: 'Invalid access token' });

    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
    console.error(err); // will be removed in production env
  }
});

module.exports = router;