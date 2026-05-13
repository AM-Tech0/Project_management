import express from "express"
import {getUsers,getSingleUser,updateUser,deleteUser,inviteUser,activateUser,getUserActivity} from "../controllers/user.controller.js"
import { verifyToken } from "../middleware/auth.middleware.js"
import requireRole from "../middleware/role.middleware.js"
const router = express.Router()
router.get("/",verifyToken,requireRole("admin"),getUsers)
router.post("/invite",verifyToken,requireRole("admin"),inviteUser)
router.patch("/:id/activate",verifyToken,requireRole("admin"),activateUser)
router.get("/:id/activity",verifyToken,requireRole("admin","manager"),getUserActivity)
router.get("/:id",verifyToken,getSingleUser)
router.put("/:id",verifyToken,updateUser)
router.delete("/:id",verifyToken,requireRole("admin"),deleteUser)
export default router;