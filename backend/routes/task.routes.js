import express from "express"
import { createTask, getProjectTasks, getTaskById, updateTask, deleteTask, getMyTasks } from "../controllers/task.controller.js"
import { verifyToken } from "../middleware/auth.middleware.js"
import requireRole from '../middleware/role.middleware.js'
const router = express.Router()
router.post("/project/:projectId", verifyToken, requireRole("admin", "manager"), createTask)
router.get("/project/:projectId", verifyToken, getProjectTasks)
router.get('/my', verifyToken, getMyTasks)
router.get("/:id", verifyToken, getTaskById)
router.put("/:id", verifyToken, requireRole("admin", "manager"), updateTask)
router.delete("/:id", verifyToken, requireRole("admin", "manager"), deleteTask)
export default router