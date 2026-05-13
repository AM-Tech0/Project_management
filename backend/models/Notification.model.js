import mongoose from "mongoose";
const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['task_assigned', 'task_updated', 'comment_added', 'project_update', 'invite', 'email_sent'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    link: {
        type: String
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps:true});
const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;