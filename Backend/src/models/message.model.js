const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    content: {
        type: String,
        required: true, },
        role:{
            type: String,
            enum: ["user", "model","system"],
            default: "user",
        },
    chat: {
        type: Schema.Types.ObjectId,
        ref: "Chat",
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);