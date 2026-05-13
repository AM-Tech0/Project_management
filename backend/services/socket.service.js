export const emitNotification=(io,userId,data)=>{
    io.to(userId).emit(
        "new_notification",
        data
    )
}
export const emitTaskCreated=(io,projectId,task)=>{
    io.to(projectId).emit(
        "task_created",
        task
    )
}
export const emitTaskDeleted=(io,projectId,taskId)=>{
    io.to(projectId).emit(
        "task_deleted",
        {
            taskId
        }
    )
}
export const emitCanvasUpdate=(io,projectId,data)=>{
    io.to(projectId).emit(
        "canvas_updated",
        data
    )
}