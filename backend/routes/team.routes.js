import express from "express"
import {getTeam,createTeam,updateTeam,getMembers,getMemberById,addMember,removeMember} from "../controllers/team.controller.js"
import { verifyToken } from "../middleware/auth.middleware.js"
import requireRole from "../middleware/role.middleware.js"
const router=express.Router()
router.get("/",verifyToken,getTeam)
router.post("/",verifyToken,requireRole("admin"),createTeam)
router.put("/",verifyToken,requireRole("admin"),updateTeam)
router.get("/members",verifyToken,getMembers)
router.get("/members/:id",verifyToken,getMemberById)
router.post("/members/:userId",verifyToken,requireRole("admin"),addMember)
router.delete("/members/:userId",verifyToken,requireRole("admin"),removeMember)
export default router