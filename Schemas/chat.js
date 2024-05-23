const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    recevier: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    senderMessage: {
        type: [String],
        required: true
    },
    recevierMessage: {
        type: [String],
        required: true
    }
});

const chat = mongoose.model("chat", chatSchema);

module.exports = chat;