import mongoose from "mongoose";
const canvasSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        unique: true
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    lastEditedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    version: {  
        type: Number,
        default: 1
    }
}, { timestamps:true});
const Canvas=mongoose.model('Canvas', canvasSchema);
export default Canvas;