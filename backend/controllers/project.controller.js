// controllers/project.controller.js

import Project from "../models/Project.model.js"
import User from "../models/User.model.js"
import Task from "../models/Task.model.js"

export const createProject = async (req, res) => {

  try {

    const body = req.body

    // accept either `name` or legacy `title`
    const name = body.name || body.title

    if (!name || !body.startDate || !body.endDate) {
      return res.status(400).json({
        success: false,
        message: "required fields missing: name, startDate, endDate"
      })
    }

    // coerce dates
    const start = new Date(body.startDate)
    const end = new Date(body.endDate)

    if (end < start) {

      return res.status(400).json({
        success: false,
        message: "end date cannot be before start date"
      })

    }

    let members = []

    if (body.members && body.members.length > 0) {

      for (let i = 0; i < body.members.length; i++) {

        let item = await User.findById(body.members[i])

        if (item) {
          members.push(item._id)
        }

      }

    }

    const project = await Project.create({
      name: name,
      description: body.description || "",
      startDate: start,
      endDate: end,
      status: body.status || "planning",
      priority: body.priority || "medium",
      members,
      createdBy: req.user.id
    })

    res.status(201).json({
      success: true,
      message: "project created",
      data: project
    })

  }
  catch (err) {

    console.log("error in create project", err)

    res.status(500).json({
      success: false,
      message: "server error"
    })

  }

}


export const getProjects = async (req, res) => {

  try {

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10

    const skip = (page - 1) * limit

    let projects = []

    // admin gets all
    if (req.user.role === "admin") {

      projects = await Project.find()
        .populate("members", "name email")
        .populate("createdBy", "name")

    }

    // manager/member gets assigned projects
    else {

      projects = await Project.find({
        members: req.user.id
      })
        .populate("members", "name email")
        .populate("createdBy", "name")

    }

    const total = projects.length

    projects = projects.slice(skip, skip + limit)

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: projects
    })

  }
  catch (err) {

    console.log("error in get projects", err)

    res.status(500).json({
      success: false,
      message: "server error"
    })

  }

}
export const getSingleProject = async (req, res) => {

  try {

    const id = req.params.id

    const project = await Project.findById(id)
      .populate("members", "name email role")
      .populate("createdBy", "name")

    if (!project) {

      return res.status(404).json({
        success: false,
        message: "project not found"
      })

    }

    // member access check
    if (req.user.role !== "admin") {

      let allowed = false

      for (let i = 0; i < project.members.length; i++) {

        if (project.members[i]._id == req.user.id) {
          allowed = true
        }

      }

      if (!allowed) {

        return res.status(403).json({
          success: false,
          message: "access denied"
        })

      }

    }

    res.status(200).json({
      success: true,
      data: project
    })

  }
  catch (err) {

    console.log("error in get single project", err)

    res.status(500).json({
      success: false,
      message: "server error"
    })

  }
}
export const updateProject = async (req, res) => {

  try {

    const id = req.params.id

    const project = await Project.findById(id)

    if (!project) {

      return res.status(404).json({
        success: false,
        message: "project not found"
      })

    }

    const body = req.body

    if (body.startDate && body.endDate) {

      const start = new Date(body.startDate)
      const end = new Date(body.endDate)

      if (end < start) {

        return res.status(400).json({
          success: false,
          message: "invalid project dates"
        })

      }

    }

    if (body.title || body.name) {
      project.name = body.name || body.title
    }

    if (body.description) {
      project.description = body.description
    }

    if (body.status) {
      project.status = body.status
    }

    if (body.priority) {
      project.priority = body.priority
    }

    if (body.startDate) {
      project.startDate = new Date(body.startDate)
    }

    if (body.endDate) {
      project.endDate = new Date(body.endDate)
    }

    if (body.members) {

      let arr = []

      for (let i = 0; i < body.members.length; i++) {

        let user = await User.findById(body.members[i])

        if (user) {
          arr.push(user._id)
        }

      }

      project.members = arr

    }

    await project.save()

    res.status(200).json({
      success: true,
      message: "project updated",
      data: project
    })

  }
  catch (err) {

    console.log("error in update project", err)

    res.status(500).json({
      success: false,
      message: "server error"
    })

  }
}
export const deleteProject = async (req, res) => {

  try {

    const id = req.params.id

    const project = await Project.findById(id)

    if (!project) {

      return res.status(404).json({
        success: false,
        message: "project not found"
      })

    }

    const tasks = await Task.find({
      project: id
    })

    if (tasks.length > 0) {

      await Task.deleteMany({
        project: id
      })

    }

    await Project.findByIdAndDelete(id)

    res.status(200).json({
      success: true,
      message: "project deleted"
    })

  }
  catch (err) {

    console.log("error in delete project", err)

    res.status(500).json({
      success: false,
      message: "server error"
    })

  }

}