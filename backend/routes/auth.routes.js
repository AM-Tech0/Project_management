import express from "express"
import {registerUser,loginUser,refreshAccessToken,logoutUser,forgotPassword,resetPassword,getMe} from "../controllers/auth.controller.js"
import { verifyToken } from "../middleware/auth.middleware.js"
const router = express.Router()
router.post("/register" , registerUser)
router.post("/login" , loginUser)
router.post("/refresh" , refreshAccessToken)
router.post("/logout" , verifyToken , logoutUser)
router.post("/forgot-password" , forgotPassword)
router.post("/reset-password/:token" , resetPassword)
router.get("/me" , verifyToken , getMe)
export default router;