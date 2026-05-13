import mongoose from "mongoose";
const teamSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    description:{
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members:[{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role:{
            type: String,
            enum: ['admin', 'manager', 'member'],
            required: true
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }]

},{timestamps:true})
const Team = mongoose.model('Team', teamSchema)
export default Team;