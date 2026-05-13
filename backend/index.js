import express from 'express'
import CORS from 'cors'
import dotenv from 'dotenv'
import http from 'http'
import cookieParser from 'cookie-parser'
import initSocket from "./config/socket.js"
import { connectDB } from './config/db.js'
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import projectRoutes from './routes/project.routes.js'
import taskRoutes from './routes/task.routes.js'
import canvasRoutes from './routes/canvas.routes.js'
import teamRoutes from './routes/team.routes.js'
import emailRoutes from './routes/email.routes.js'
dotenv.config();

const app =express();
app.use(CORS({
    origin: process.env.CLIENT_URL,
    credentials:true

}))
const server=http.createServer(app)

const io=initSocket(server)

app.set("io",io)

app.use(express.json())
app.use(cookieParser())

const PORT = process.env.PORT || 5000

connectDB()

app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/users", userRoutes)
app.use("/api/v1/projects", projectRoutes)
app.use("/api/v1/tasks", taskRoutes)
app.use("/api/v1/email", emailRoutes)
app.use("/api/v1/canvas", canvasRoutes)
app.use("/api/v1/team", teamRoutes)

app.get('/',(req,res)=>{
    res.send("Hello World")
}
)
server.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
}
)