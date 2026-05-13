// controllers/team.controller.js

import mongoose from "mongoose"

import Team from "../models/Team.model.js"
import User from "../models/User.model.js"

export const getTeam=async(req,res)=>{

    try{

        const team=await Team.findOne()
            .populate("createdBy","name email")
            .populate("members.user","name email role isActive")

        if(!team){
            return res.status(404).json({
                success:false,
                message:"team not found"
            })
        }

        return res.status(200).json({
            success:true,
            data:team
        })

    }
    catch(error){

        console.log("get team error",error)

        return res.status(500).json({
            success:false,
            message:"server error"
        })
    }
}

export const createTeam=async(req,res)=>{

    try{

        const already=await Team.findOne()

        if(already){
            return res.status(400).json({
                success:false,
                message:"team already exists"
            })
        }

        if(!req.body.name || req.body.name.trim() === ""){
            return res.status(400).json({
                success:false,
                message:"team name required"
            })
        }

        const team=new Team({
            name:req.body.name,
            description:req.body.description || "",
            createdBy:req.user.id,
            members:[]
        })

        await team.save()

        return res.status(201).json({
            success:true,
            data:team,
            message:"team created"
        })

    }
    catch(error){

        console.log("create team error",error)

        return res.status(500).json({
            success:false,
            message:"server error"
        })
    }
}

export const updateTeam=async(req,res)=>{

    try{

        const team=await Team.findOne()

        if(!team){
            return res.status(404).json({
                success:false,
                message:"team not found"
            })
        }

        if(req.body.name !== undefined){

            if(req.body.name.trim() === ""){
                return res.status(400).json({
                    success:false,
                    message:"name empty"
                })
            }

            team.name=req.body.name
        }

        if(req.body.description !== undefined){
            team.description=req.body.description
        }

        await team.save()

        return res.status(200).json({
            success:true,
            data:team,
            message:"team updated"
        })

    }
    catch(error){

        console.log("update team error",error)

        return res.status(500).json({
            success:false,
            message:"server error"
        })
    }
}

export const getMembers=async(req,res)=>{

    let page=parseInt(req.query.page) || 1
    let limit=parseInt(req.query.limit) || 10

    if(limit > 50){
        limit=50
    }

    const skip=(page - 1) * limit

    try{

        const total=await User.countDocuments({
            isActive:true
        })

        const members=await User.find({
            isActive:true
        })
        .select("name email role avatar")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt:-1 })

        return res.status(200).json({
            success:true,
            total,
            page,
            limit,
            data:members
        })

    }
    catch(error){

        console.log("get members error",error)

        return res.status(500).json({
            success:false,
            message:"server error"
        })
    }
}

export const getMemberById=async(req,res)=>{
    const { id }=req.params

    try{

        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                success:false,
                message:"invalid member id"
            })
        }

        const member=await User.findById(id)
            .select("-password")

        if(!member){
            return res.status(404).json({
                success:false,
                message:"member not found"
            })
        }

        return res.status(200).json({
            success:true,
            data:member
        })

    }
    catch(error){

        console.log("get member error",error)

        return res.status(500).json({
            success:false,
            message:"server error"
        })
    }
}

export const addMember=async(req,res)=>{
    const { userId }=req.params

    try{

        if(!mongoose.Types.ObjectId.isValid(userId)){
            return res.status(400).json({
                success:false,
                message:"invalid user id"
            })
        }

        const user=await User.findById(userId)

        if(!user){
            return res.status(404).json({
                success:false,
                message:"user not found"
            })
        }

        const team=await Team.findOne()

        if(!team){
            return res.status(404).json({
                success:false,
                message:"team not found"
            })
        }

        let already=false

        for(let i = 0 ; i < team.members.length ; i++){

            if(team.members[i].user.toString() === userId){
                already=true
            }
        }

        if(already){
            return res.status(400).json({
                success:false,
                message:"member already exists"
            })
        }

        team.members.push({
            user:userId,
            role:user.role,
            joinedAt:new Date()
        })

        await team.save()

        return res.status(200).json({
            success:true,
            data:team,
            message:"member added"
        })

    }
    catch(error){

        console.log("add member error",error)

        return res.status(500).json({
            success:false,
            message:"server error"
        })
    }
}

export const removeMember=async(req,res)=>{
    const { userId }=req.params

    try{

        if(!mongoose.Types.ObjectId.isValid(userId)){
            return res.status(400).json({
                success:false,
                message:"invalid user id"
            })
        }

        const team=await Team.findOne()

        if(!team){
            return res.status(404).json({
                success:false,
                message:"team not found"
            })
        }

        let temp=[]

        for(let i = 0 ; i < team.members.length ; i++){

            if(team.members[i].user.toString() !== userId){
                temp.push(team.members[i])
            }
        }

        team.members=temp

        await team.save()

        return res.status(200).json({
            success:true,
            message:"member removed"
        })

    }
    catch(error){

        console.log("remove member error",error)

        return res.status(500).json({
            success:false,
            message:"server error"
        })
    }
}