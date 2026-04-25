const user_model = require('../models/user.model');
const jwt = require('jsonwebtoken');

//iss middileware ka kaam hai ki user authenticated hai ya nahi, agar authenticated hai to uska data req.user me store karna taki aage ke controllers me use kar sake
async function auth_middleware(req,res,next){

    const {token} = req.cookies;
    if(!token){
        return res.status(401).json({
            message:"Unauthorized"
        })
    }
    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        const user = await user_model.findById(decoded.id);
        if(!user){
            return res.status(401).json({
                message:"Unauthorized"
            })
        }
        req.user = user;
        next();
    }catch(err){
        return res.status(401).json({
            message:"Unauthorized"
        })
    }
}

module.exports = auth_middleware;