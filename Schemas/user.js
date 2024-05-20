const mongoose = require("mongoose");

const userSchema = new mongoose.schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 20,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    friends: {
        type: [String]
    },
    groups: {
        type: [String]
    },
    bio: {
        type: String,
        default: "Just joined"
    }
});

const user = mongoose.model("User", userSchema);

module.exports = User;