// config/socket.js

import { Server } from "socket.io"
import jwt from "jsonwebtoken"
import User from "../models/User.model.js"

const connectedUsers={}

const initSocket=(server)=>{

    const io=new Server(server,{
        cors:{
            origin:process.env.CLIENT_URL,
            credentials:true
        }
    })

    io.use(async(socket,next)=>{

        try{

            let token=null

            if(socket.handshake.auth){
                token=socket.handshake.auth.token
            }

            if(!token){
                return next(new Error("token missing"))
            }

            let decoded

            try{

                decoded=jwt.verify(
                    token,
                    process.env.JWT_SECRET
                )
            }
            catch(error){

                return next(new Error("invalid token"))
            }

            const user=await User.findById(decoded.id)

            if(!user){
                return next(new Error("user not found"))
            }

            socket.user={
                id:user._id.toString(),
                role:user.role,
                name:user.name
            }

            connectedUsers[user._id.toString()]=socket.id

            next()

        }
        catch(error){

            console.log("socket auth error",error)

            next(new Error("socket error"))
        }
    })

    io.on("connection",(socket)=>{

        console.log("socket connected",socket.id)

        socket.join(socket.user.id)

        socket.on("join_project",(data)=>{

            if(!data.projectId){
                return
            }

            socket.join(data.projectId)

            socket.to(data.projectId).emit(
                "user_joined",
                {
                    user:socket.user
                }
            )
        })

        socket.on("leave_project",(data)=>{

            if(!data.projectId){
                return
            }

            socket.leave(data.projectId)

            socket.to(data.projectId).emit(
                "user_left",
                {
                    userId:socket.user.id
                }
            )
        })

        socket.on("canvas_update",(data)=>{

            if(!data.projectId){
                return
            }

            socket.to(data.projectId).emit(
                "canvas_updated",
                {
                    element:data.element,
                    action:data.action,
                    editedBy:socket.user
                }
            )
        })

        socket.on("task_update",(data)=>{

            if(!data.projectId){
                return
            }

            socket.to(data.projectId).emit(
                "task_updated",
                {
                    taskId:data.taskId,
                    changes:data.changes
                }
            )
        })

        socket.on("typing",(data)=>{

            if(!data.projectId){
                return
            }

            socket.to(data.projectId).emit(
                "typing_indicator",
                {
                    user:socket.user,
                    taskId:data.taskId
                }
            )
        })

        socket.on("disconnect",()=>{

            console.log("socket disconnected",socket.id)

            delete connectedUsers[socket.user.id]
        })
    })

    return io
}

export default initSocket

export { connectedUsers }