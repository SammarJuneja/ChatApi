const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 20,
    },
    avatar: {
        type: String,
        default: "https://media.discordapp.net/attachments/874887845049950259/1244545144141647922/dc9c614e3007080a5aff36aebb949474.jpg?ex=6655807c&is=66542efc&hm=c66870f5b15460a55108518471c5893d98dcece3b9b829b075be9fd1644f0c7f&"
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
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }]
    },
    groups: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chat'
        }]
    },
    bio: {
        type: String,
        default: "Just joined"
    }
});

const User = mongoose.model("User", userSchema);

module.exports = User;