// controllers/canvas.controller.js

import mongoose from "mongoose"

import Canvas from "../models/Canvas.model.js"
import Project from "../models/Project.model.js"

export const getProjectCanvas=async(req,res)=>{
    const { projectId }=req.params

    try{

        if(!mongoose.Types.ObjectId.isValid(projectId)){
            return res.status(400).json({
                success:false,
                message:"invalid project id"
            })
        }

        const project=await Project.findById(projectId)

        if(!project){
            return res.status(404).json({
                success:false,
                message:"project not found"
            })
        }

        let canvas=await Canvas.findOne({
            project:projectId
        })

        if(!canvas){

            canvas={
                project:projectId,
                data:{ objects:[] },
                version:0
            }
        }

        return res.status(200).json({
            success:true,
            data:canvas
        })

    }
    catch(error){

        console.log("get canvas error",error)

        return res.status(500).json({
            success:false,
            message:"server error"
        })
    }
}

export const createCanvas=async(req,res)=>{
    const { projectId }=req.params

    try{

        if(!mongoose.Types.ObjectId.isValid(projectId)){
            return res.status(400).json({
                success:false,
                message:"invalid project id"
            })
        }

        const project=await Project.findById(projectId)

        if(!project){
            return res.status(404).json({
                success:false,
                message:"project not found"
            })
        }

        const oldCanvas=await Canvas.findOne({
            project:projectId
        })

        if(oldCanvas){
            return res.status(400).json({
                success:false,
                message:"canvas already exists"
            })
        }

        const canvas=new Canvas({
            project:projectId,
            data:req.body.data || { objects:[] },
            lastEditedBy:req.user.id,
            version:1
        })

        await canvas.save()

        const io=req.app.get("io")

        io.to(projectId).emit(
            "canvas_updated",
            {
                projectId,
                data:canvas.data,
                version:canvas.version
            }
        )

        return res.status(201).json({
            success:true,
            data:canvas,
            message:"canvas created"
        })

    }
    catch(error){

        console.log("create canvas error",error)

        return res.status(500).json({
            success:false,
            message:"server error"
        })
    }
}

export const updateCanvas=async(req,res)=>{
    const { projectId }=req.params

    try{

        if(!mongoose.Types.ObjectId.isValid(projectId)){
            return res.status(400).json({
                success:false,
                message:"invalid project id"
            })
        }

        const canvas=await Canvas.findOne({
            project:projectId
        })

        if(!canvas){
            return res.status(404).json({
                success:false,
                message:"canvas not found"
            })
        }

        const body=req.body

        if(body.version !== canvas.version){
            return res.status(409).json({
                success:false,
                message:"canvas version mismatch"
            })
        }

        canvas.data=body.data || canvas.data
        canvas.lastEditedBy=req.user.id
        canvas.version=canvas.version + 1

        await canvas.save()

        const io=req.app.get("io")

        io.to(projectId).emit(
            "canvas_updated",
            {
                projectId,
                data:canvas.data,
                version:canvas.version
            }
        )

        return res.status(200).json({
            success:true,
            data:canvas,
            message:"canvas updated"
        })

    }
    catch(error){

        console.log("update canvas error",error)

        return res.status(500).json({
            success:false,
            message:"server error"
        })
    }
}

export const updateCanvasElement=async(req,res)=>{
    const { projectId }=req.params

    try{

        if(!mongoose.Types.ObjectId.isValid(projectId)){
            return res.status(400).json({
                success:false,
                message:"invalid project id"
            })
        }

        const canvas=await Canvas.findOne({
            project:projectId
        })

        if(!canvas){
            return res.status(404).json({
                success:false,
                message:"canvas not found"
            })
        }

        const body=req.body

        if(!body.element){
            return res.status(400).json({
                success:false,
                message:"element missing"
            })
        }

        if(!canvas.data){
            canvas.data={ objects:[] }
        }

        if(!canvas.data.objects){
            canvas.data.objects=[]
        }

        canvas.data.objects.push(body.element)

        canvas.lastEditedBy=req.user.id
        canvas.version=canvas.version + 1

        await canvas.save()

        const io=req.app.get("io")

        io.to(projectId).emit(
            "canvas_updated",
            {
                projectId,
                element:body.element,
                version:canvas.version
            }
        )

        return res.status(200).json({
            success:true,
            data:canvas,
            message:"canvas element updated"
        })

    }
    catch(error){

        console.log("canvas element error",error)

        return res.status(500).json({
            success:false,
            message:"server error"
        })
    }
}

export const deleteCanvas=async(req,res)=>{
    const { projectId }=req.params

    try{

        if(!mongoose.Types.ObjectId.isValid(projectId)){
            return res.status(400).json({
                success:false,
                message:"invalid project id"
            })
        }

        const canvas=await Canvas.findOne({
            project:projectId
        })

        if(!canvas){
            return res.status(404).json({
                success:false,
                message:"canvas not found"
            })
        }

        await Canvas.findByIdAndDelete(canvas._id)

        const io=req.app.get("io")

        io.to(projectId).emit(
            "canvas_deleted",
            {
                projectId
            }
        )

        return res.status(200).json({
            success:true,
            message:"canvas deleted"
        })

    }
    catch(error){

        console.log("delete canvas error",error)

        return res.status(500).json({
            success:false,
            message:"server error"
        })
    }
}