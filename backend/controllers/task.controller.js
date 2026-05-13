// controllers/task.controller.js

import mongoose from "mongoose"
import Task from "../models/Task.model.js"
import Project from "../models/Project.model.js"

export const createTask = async (req, res) => {
  const projectId = req.params.projectId

  try {

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ msg: "invalid project id" })
    }

    const project = await Project.findById(projectId)

    if (!project) {
      return res.status(404).json({ msg: "project not found" })
    }

    const body = req.body

    if (!body.title || body.title.trim() === "") {
      return res.status(400).json({ msg: "title required" })
    }

    if (body.dueDate && project.endDate) {

      const due = new Date(body.dueDate)
      const end = new Date(project.endDate)

      if (due > end) {
        return res.status(400).json({
          msg: "due date greater than project end date"
        })
      }
    }

    const task = new Task({
      title: body.title,
      description: body.description || "",
      project: projectId,
      assignedTo: body.assignedTo || [],
      createdBy: req.user._id,
      status: body.status || "todo",
      priority: body.priority || "medium",
      dueDate: body.dueDate || null,
      estimatedHours: body.estimatedHours || 0,
      labels: body.labels || []
    })

    await task.save()

    res.status(201).json({
      success: true,
      data: task,
      message: "task created"
    })

  } catch (err) {

    console.log("create task err", err)

    res.status(500).json({
      success: false,
      message: "server error"
    })
  }
}

export const getProjectTasks = async (req, res) => {
  const { projectId } = req.params

  let page = parseInt(req.query.page) || 1
  let limit = parseInt(req.query.limit) || 10

  if (limit > 50) {
    limit = 50
  }

  const skip = (page - 1) * limit

  try {

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ msg: "invalid project id" })
    }

    const project = await Project.findById(projectId)

    if (!project) {
      return res.status(404).json({ msg: "project not found" })
    }

    const total = await Task.countDocuments({ project: projectId })

    const tasks = await Task.find({ project: projectId })
      .populate("assignedTo", "name email")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      total,
      page,
      limit,
      data: tasks
    })

  } catch (err) {

    console.log("get tasks error", err)

    res.status(500).json({
      success: false,
      message: "server error"
    })
  }
}

export const getTaskById = async (req, res) => {
  const { id } = req.params

  try {

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "invalid task id" })
    }

    const task = await Task.findById(id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name")

    if (!task) {
      return res.status(404).json({ msg: "task not found" })
    }

    res.status(200).json({
      success: true,
      data: task
    })

  } catch (err) {

    console.log("get task by id error", err)

    res.status(500).json({
      success: false,
      message: "server error"
    })
  }
}

export const updateTask = async (req, res) => {
  const { id } = req.params

  try {

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "invalid task id" })
    }

    const task = await Task.findById(id)

    if (!task) {
      return res.status(404).json({ msg: "task not found" })
    }

    const body = req.body

    if (body.title !== undefined) {

      if (body.title.trim() === "") {
        return res.status(400).json({ msg: "title empty" })
      }

      task.title = body.title
    }

    if (body.description !== undefined) {
      task.description = body.description
    }

    if (body.status) {
      task.status = body.status
    }

    if (body.priority) {
      task.priority = body.priority
    }

    if (body.assignedTo) {
      task.assignedTo = body.assignedTo
    }

    if (body.dueDate) {
      task.dueDate = body.dueDate
    }

    if (body.estimatedHours !== undefined) {
      task.estimatedHours = body.estimatedHours
    }

    if (body.labels) {
      task.labels = body.labels
    }

    await task.save()

    res.status(200).json({
      success: true,
      data: task,
      message: "task updated"
    })

  } catch (err) {

    console.log("update task error", err)

    res.status(500).json({
      success: false,
      message: "server error"
    })
  }
}

export const deleteTask = async (req, res) => {
  const { id } = req.params

  try {

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "invalid task id" })
    }

    const task = await Task.findById(id)

    if (!task) {
      return res.status(404).json({ msg: "task not found" })
    }

    await Task.findByIdAndDelete(id)

    res.status(200).json({
      success: true,
      message: "task deleted"
    })

  } catch (err) {

    console.log("delete task error", err)

    res.status(500).json({
      success: false,
      message: "server error"
    })
  }
}

export const getMyTasks = async (req, res) => {
  let page = parseInt(req.query.page) || 1
  let limit = parseInt(req.query.limit) || 10
  if (limit > 50) limit = 50
  const skip = (page - 1) * limit

  try {
    const total = await Task.countDocuments({ assignedTo: req.user.id })
    const tasks = await Task.find({ assignedTo: req.user.id })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      total,
      page,
      limit,
      data: tasks
    })
  } catch (err) {
    console.log('get my tasks err', err)
    res.status(500).json({ success: false, message: 'server error' })
  }

}