import jwt from "jsonwebtoken"
import User from "../models/User.model.js"
export const verifyToken = async(req,res,next)=>{
    try{
        let token = null
        if(req.headers.authorization){
            if(req.headers.authorization.startsWith("Bearer")){
                token = req.headers.authorization.split(" ")[1]
            }
        }
        if(!token){
            return res.status(401).json({
                success:false,
                message:"Token missing"
            })
        }
        let decoded
        try{
            decoded = jwt.verify(
                token ,
                process.env.JWT_SECRET
            )
        }
        catch(error){
            return res.status(401).json({
                success:false,
                message:"Invalid or expired token"
            })
        }
        const user = await User.findById(decoded.id)
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"
            })
        }
        if(user.isActive === false){
            return res.status(403).json({
                success:false,
                message:"Account inactive"
            })
        }
        req.user = {
            id:user._id,
            role:user.role,
            email:user.email
        }
        next()
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Server error",
            error:error.message
        })
    }
}
export const optionalAuth = async(req,res,next)=>{
    try{
        let token = null
        if(req.headers.authorization){
            if(req.headers.authorization.includes("Bearer")){
                token = req.headers.authorization.split(" ")[1]
        }
        }
        if(!token){
            req.user = null
            return next()
        }
        let decoded
        try{
            decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            )
        }
        catch(error){
            req.user = null
            return next()

        }
        const user = await User.findById(decoded.id)
        if(!user){
            req.user = null
            return next()
        }
        req.user = {
            id:user._id,
            role:user.role
        }
        next()
    }
    catch(error){
        req.user = null
        next()
    }
}