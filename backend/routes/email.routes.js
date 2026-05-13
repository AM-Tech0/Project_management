import express from "express"
import {sendEmail,sendBulkEmail} from "../controllers/email.controller.js"
import { verifyToken } from "../middleware/auth.middleware.js"
import requireRole from "../middleware/role.middleware.js"
const router=express.Router()
router.post("/send",verifyToken,requireRole("admin"),sendEmail)
router.post("/send-bulk",verifyToken,requireRole("admin"),sendBulkEmail)
export default router