const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI).then(() => {
      console.log("MongoDB is connected successfully");
    });
  } catch (error) {
    console.error(error); // this will be changed in production enviroment
  }
}

module.exports = connectDB;