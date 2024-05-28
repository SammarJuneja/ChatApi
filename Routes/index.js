const { Router } = require('express');
const router = Router();

const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const chatRoutes = require("./chatRoutes");

// Middleware for handling errors
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).send(err.message);
  console.error(err.message);
};

// Routes
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/chat", chatRoutes);

router.get('/', (req, res) => {
  res.status(200).send({ version: '^1.0.0' });
});

// Error handling should be the last piece of middleware
router.use(errorHandler);

module.exports = router;