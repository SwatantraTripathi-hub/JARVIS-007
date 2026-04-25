const mongoose = require('mongoose');
require('dotenv').config();
// ...existing code...

const connectDB = async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB connected successfully");
    }
    catch(e){
        console.log("DB is not connected",e);
    }
}

module.exports = connectDB;