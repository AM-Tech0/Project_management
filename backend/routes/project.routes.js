import express from "express"
import {createProject,getProjects,getSingleProject,updateProject,deleteProject} from "../controllers/project.controller.js"
import { verifyToken } from "../middleware/auth.middleware.js"
import requireRole from "../middleware/role.middleware.js"

const router = express.Router()

router.post("/",verifyToken,requireRole("admin","manager"),createProject)
router.get("/",verifyToken,getProjects)
router.get("/:id",verifyToken,getSingleProject)
router.put("/:id",verifyToken,requireRole("admin","manager"),updateProject)
router.delete("/:id",verifyToken,requireRole("admin"),deleteProject)
export default router;