const jwt = require("jsonwebtoken");

const authorizationToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[0];

  if (!token) {
    return res.status(401).json({ error: "No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_TOKEN);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).json({ error: "Invalid token." });
  }
};

module.exports = authorizationToken;