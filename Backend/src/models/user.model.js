const mongoose = require('mongoose');
require('dotenv').config();
// ...existing code...

const user_model = new mongoose.Schema({
    fullName:{
         firstname: {
        type: String,
        required: true
    },
    lastname:{
        type: String,
        required: true
    }
    }
   ,
    email: {
        type: String,
        required: true,
        unique: true
    },
    Password:{
        type: String,
    },
    
},{
    timestamps: true
});

const User = mongoose.model('User', user_model);

module.exports = User;