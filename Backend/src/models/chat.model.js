const mongoose = require('mongoose');

const chat_model = new mongoose.Schema({

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    title:{
        type:String,
        required:true
    },
    lastActivity:{
        type:Date,
        default:Date.now
    }
    

},{
    timestamps: true
});

 const chatModel = mongoose.model('Chat', chat_model);

module.exports = chatModel;  