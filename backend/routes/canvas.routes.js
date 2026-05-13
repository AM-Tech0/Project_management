import express from "express"
import {getProjectCanvas,createCanvas,updateCanvas,updateCanvasElement,deleteCanvas} from "../controllers/canvas.controller.js"
import { verifyToken } from "../middleware/auth.middleware.js"
import requireRole from "../middleware/role.middleware.js"
const router=express.Router()
router.get("/project/:projectId",verifyToken,getProjectCanvas)
router.post("/project/:projectId",verifyToken,requireRole("admin","manager"),createCanvas)
router.put("/project/:projectId",verifyToken,requireRole("admin","manager"),updateCanvas)
router.patch("/project/:projectId/element",verifyToken,updateCanvasElement)
router.delete("/project/:projectId",verifyToken,requireRole("admin","manager"),deleteCanvas)
export default router