import mongoose, { Schema } from "mongoose";

const SessionModel = new Schema({

    user_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },

    device_id: {
        type: String, // Unique identifier for device
        required: true
    },

    token: {
        type: String, // JWT token for authentication
        required: true
    },

}, { timestamps: true });

const Session = mongoose.model<ISession>('Session', SessionModel);

export default Session;

export interface ISession extends Document {
    user_id: string;
    device_id: string;
    token: string;
    createdAt: Date;
    updatedAt: Date;
}