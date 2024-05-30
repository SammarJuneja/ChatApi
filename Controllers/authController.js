const jwt = require('jsonwebtoken');

const Token = require('../Database/Models/tokenModel.js');
const { generateTokens, refreshTokens, invalidateTokens } = require('../Services/tokenService.js');
const { createUser, authenticateUser } = require('../Services/authService.js');


// SECURITY: MUST implement token blacklisting
//             * blacklist tokens yet to expire of logged out/changed tokens

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) 
      return res.status(400).json({ errors: errors.array() });

    const { username, email, password, device } = req.body;

    const user = await createUser(username, email, password);
    const tokensObj = await generateTokens(user, device);

    res.status(200).json(tokensObj);
  } catch (err) {
    await res.status(500).json({ message: err.message });
    console.error(err); // will remove in production env
  }    
}

exports.verify = async (req, res) => {

}

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) 
      return res.status(400).json({ errors: errors.array() });

    const { username, email, password, device } = req.body;

    const user = await authenticateUser(username, email, password);
    const tokensObj = await generateTokens(user, device);

    res.status(200).json(tokensObj);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
    console.error(err); // will be removed in production env
  }
}

exports.token = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer '))
      return res.status(401).json({ message: 'Missing or malformed authorization header' });

    const refreshToken = authHeader.split(/Bearer /)[1];
    if (!refreshToken)
      return res.status(401).json({ message: 'Missing refresh token' });

    const errors = validationResult(req);
    if (!errors.isEmpty()) 
      return res.status(400).json({ errors: errors.array() });

    const { device } = req.body;
    const tokensObj = await refreshTokens(refreshToken, device);

    res.json(tokensObj);
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
}

exports.passwordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const userGet = await User.findOne({ email });
    if (!userGet) {
      res.status(400).json({ error: "User with that email doesn\'t exist" });
    }
    // need nodemailer setup
  } catch (error) {
    console.log(error)
    res.status(500).json({error: "Internal server error" });
  }
}

exports.logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer '))
      return res.status(401).json({ message: 'Missing or malformed authorization header' });

    const accessToken = authHeader.split(/Bearer /)[1];
    if (!accessToken)
      return res.status(401).json({ message: 'Missing access token' });

    const errors = validationResult(req);
    if (!errors.isEmpty()) 
      return res.status(400).json({ errors: errors.array() });

    const { device } = req.body;
    await invalidateTokens(accessToken, device);

    res.status(200).json({ message: 'Session terminated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
    console.error(err); // will be removed in production env
  }
};