const mongoose = require('mongoose');
const { mongoURI } = require('../config.js');

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI).then(() => {
      console.log("MongoDB is connected successfully");
    });
  } catch (error) {
    console.error(error); // this will be changed in production enviroment
  }
}

module.exports = connectDB;