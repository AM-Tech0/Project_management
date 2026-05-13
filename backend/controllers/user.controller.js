// controllers/user.controller.js

import User from "../models/User.model.js"
import RefreshToken from "../models/RefreshToken.model.js"
import Task from "../models/Task.model.js"
import Project from "../models/Project.model.js"
import bcrypt from 'bcryptjs'
import { sendNoticeEmail } from '../services/email.service.js'




// GET ALL USERS
export const getUsers = async (req, res) => {

  try {

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10

    const skip = (page - 1) * limit

    const role = req.query.role
    const search = req.query.search
    const isActive = req.query.isActive

    let users = await User.find()

    if (role) {
      users = users.filter((item) => {
        return item.role === role
      })
    }

    if (isActive) {

      if (isActive === "true") {
        users = users.filter((item) => {
          return item.isActive === true
        })
      }

      if (isActive === "false") {
        users = users.filter((item) => {
          return item.isActive === false
        })
      }

    }

    if (search) {

      let temp = []

      for (let i = 0; i < users.length; i++) {

        let item = users[i]

        let name = item.name.toLowerCase()
        let email = item.email.toLowerCase()

        if (
          name.includes(search.toLowerCase()) ||
          email.includes(search.toLowerCase())
        ) {
          temp.push(item)
        }

      }

      users = temp

    }

    const total = users.length

    users = users.slice(skip, skip + limit)

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: users
    })

  }
  catch (err) {

    console.log("error in get users", err)

    res.status(500).json({
      success: false,
      message: "server error"
    })

  }

}







// GET SINGLE USER
export const getSingleUser = async (req, res) => {

  try {

    const id = req.params.id

    const user = await User.findById(id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found"
      })
    }

    // member restrictions
    if (req.user.role === "member") {

      if (req.user.id != id) {

        return res.status(403).json({
          success: false,
          message: "access denied"
        })

      }

    }

    res.status(200).json({
      success: true,
      data: user
    })

  }
  catch (err) {

    console.log("error in get single user", err)

    res.status(500).json({
      success: false,
      message: "server error"
    })

  }

}








// UPDATE USER
export const updateUser = async (req, res) => {

  try {

    const id = req.params.id

    const user = await User.findById(id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found"
      })
    }

    const body = req.body

    // member only update own profile
    if (req.user.role === "member") {

      if (req.user.id != id) {
        return res.status(403).json({
          success: false,
          message: "access denied"
        })
      }

      if (body.role || body.isActive) {
        return res.status(403).json({
          success: false,
          message: "cannot update role"
        })
      }

    }

    if (body.name) {
      user.name = body.name
    }

    if (body.avatar) {
      user.avatar = body.avatar
    }

    // admin only
    if (req.user.role === "admin") {

      if (body.role) {

        let roles = ["admin", "manager", "member"]

        if (!roles.includes(body.role)) {
          return res.status(400).json({
            success: false,
            message: "invalid role"
          })
        }

        user.role = body.role

        // remove active sessions
        await RefreshToken.deleteMany({
          user: user._id
        })

      }

      if (body.isActive === true || body.isActive === false) {
        user.isActive = body.isActive
      }

    }

    await user.save()

    res.status(200).json({
      success: true,
      message: "user updated",
      data: user
    })

  }
  catch (err) {

    console.log("error in update user", err)

    res.status(500).json({
      success: false,
      message: "server error"
    })

  }

}








// DELETE USER (SOFT DELETE)
export const deleteUser = async (req, res) => {

  try {

    const id = req.params.id

    const user = await User.findById(id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found"
      })
    }

    if (user.role === "admin") {

      const admins = await User.find({
        role: "admin",
        isActive: true
      })

      if (admins.length === 1) {
        return res.status(400).json({
          success: false,
          message: "last admin cannot be removed"
        })
      }

    }

    user.isActive = false

    await user.save()

    await RefreshToken.deleteMany({
      user: user._id
    })

    res.status(200).json({
      success: true,
      message: "user deactivated"
    })

  }
  catch (err) {

    console.log("error in delete user", err)

    res.status(500).json({
      success: false,
      message: "server error"
    })

  }

}








// INVITE USER
export const inviteUser = async (req, res) => {

  try {

    const email = req.body.email
    const role = req.body.role

    if (!email || !role) {

      return res.status(400).json({
        success: false,
        message: "all fields required"
      })

    }

    if (!email.includes("@") || !email.includes(".")) {

      return res.status(400).json({
        success: false,
        message: "invalid email"
      })

    }

    const roles = ["admin", "manager", "member"]

    if (!roles.includes(role)) {

      return res.status(400).json({
        success: false,
        message: "invalid role"
      })

    }

    const oldUser = await User.findOne({ email })

    if (oldUser) {

      return res.status(200).json({
        success: true,
        message: "user already registered, add to team later"
      })

    }

    // generate temporary password
    const genTemp = () => {
      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      let s = ''
      for (let i = 0; i < 10; i++) s += chars[Math.floor(Math.random() * chars.length)]
      return s
    }

    const tempPassword = genTemp()

    // hash before storing
    const hashed = await bcrypt.hash(tempPassword, 12)

    const user = await User.create({
      name: req.body.name || 'New User',
      email,
      password: hashed,
      role,
      isActive: true
    })

    // send email with credentials
    try {
      const subject = 'You have been invited to ProjectHub'
      const message = `You have been invited to the team. Login with:\nEmail: ${email}\nPassword: ${tempPassword}\nPlease change your password after first login.`
      await sendNoticeEmail(user, subject, message)
    } catch (e) {
      console.log('invite email failed', e)
    }

    res.status(201).json({
      success: true,
      message: "invite sent",
      data: { id: user._id, email: user.email, name: user.name }
    })

  }
  catch (err) {

    console.log("error in invite user", err)

    res.status(500).json({
      success: false,
      message: "server error"
    })

  }

}








// ACTIVATE USER
export const activateUser = async (req, res) => {

  try {

    const id = req.params.id

    const user = await User.findById(id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found"
      })
    }

    user.isActive = true

    await user.save()

    res.status(200).json({
      success: true,
      message: "user activated"
    })

  }
  catch (err) {

    console.log("error in activate user", err)

    res.status(500).json({
      success: false,
      message: "server error"
    })

  }

}








// USER ACTIVITY
export const getUserActivity = async (req, res) => {

  try {

    const id = req.params.id

    const user = await User.findById(id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found"
      })
    }

    const tasks = await Task.find({
      assignedTo: id
    })

    const projects = await Project.find({
      members: id
    })

    let completed = 0

    for (let i = 0; i < tasks.length; i++) {

      if (tasks[i].status === "done") {
        completed++
      }

    }

    const data = {
      lastSeen: user.lastSeen,
      totalTasks: tasks.length,
      completedTasks: completed,
      projectsCount: projects.length
    }

    res.status(200).json({
      success: true,
      data
    })

  }
  catch (err) {

    console.log("error in get activity", err)

    res.status(500).json({
      success: false,
      message: "server error"
    })

  }

}