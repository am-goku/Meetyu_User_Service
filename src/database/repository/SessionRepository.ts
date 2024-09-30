import { DeleteManyModel, DeleteOneModel } from "mongoose";
import Session, { ISession } from "../model/SessionModel";

interface SessionResponse { session: ISession | null, message?: string };

class SessionRepository {
    constructor() { };

    async createSession(user_id: string, device_id: string, token: string): Promise<SessionResponse> {
        try {
            const session = new Session({ user_id, device_id, token });

            await session.save();

            return { session };

        } catch (error: any) {
            return { session: null, message: "Error creating session: " + error.message }
        }
    }

    async updateSession(user_id: string, device_id: string, token: string): Promise<SessionResponse> {
        try {
            const session = await Session.findOneAndUpdate(
                { user_id, device_id },
                { $set: { token } },
                { new: true }
            )

            return { session }

        } catch (error: any) {
            return { session: null, message: 'Error updating session.' + error.message }
        }
    }

    async deleteSession(user_id: string, device_id?: string | null, avoid_device?: string | null): Promise<DeleteOneModel<any> | DeleteManyModel<any> | null> {
        try {
            if (device_id) {
                return await Session.findOneAndDelete({ user_id, device_id });
            }

            if (avoid_device) {
                return await Session.findOneAndDelete({ user_id, device_id: { $ne: avoid_device } });
            }

            return await Session.findOneAndDelete({ user_id });

        } catch (error) {
            throw { message: "Error deleting session." }
        }
    }

}

export default new SessionRepository();