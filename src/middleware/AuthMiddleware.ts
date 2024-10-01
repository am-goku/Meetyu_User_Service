import { NextFunction, Request, Response } from "express";
import AuthToken from "../utils/AuthToken";
import { IUserModel } from "../database/model/UserModel";
import UserRepository from "../database/repository/UserRepository";
import sendResponse from "../utils/responseHandler";
import SessionRepository from "../database/repository/SessionRepository";
import { ISession } from "../database/model/SessionModel";

declare global {
    namespace Express {
        interface Request {
            user?: Partial<IUserModel>;
            session?: Partial<ISession>;
        }
    }
}

class AuthMiddleware {
    private repository: typeof UserRepository;

    constructor() {
        this.repository = UserRepository;
    };

    validateToken = async (authToken: string, device_id: string): Promise<{ user: Partial<IUserModel> | null, session?: Partial<ISession>, message?: string, statusCode?: number }> => {
        try {

            // Validating Auth Token
            const token = authToken?.split(' ')[1];

            if (!token) throw { user: null, statusCode: 401, message: "No token Provided." };

            const decoded = AuthToken.verifyAuthToken(token);

            if (!decoded || !decoded.email) throw { user: null, statusCode: 401, message: "Invalid token." };

            const user = await this.repository.fetchByEmail(decoded.email as string);

            if (!user) throw { user: null, statusCode: 404, message: "User not found." };

            if (user.blocked) throw { user: null, statusCode: 403, message: "This account has been blocked by members of the authority." };

            // Validating Device Session
            const session = await SessionRepository.fetchSession(user._id, device_id);

            if(!session || !session.length) {
                throw { user: null, statusCode: 403, message: "Invalid or Expired Session" };
            }

            return { user, session: session[0] };

        } catch (error: any) {
            console.log(error)
            const errorData: { user: Partial<IUserModel>, message: string } = error instanceof Error ?
                { user: null, message: "Authentication Error." } : error;

            return errorData;
        }
    }


    protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authToken = req.headers.authorization;
            const device_id = req.headers['X-Device-ID'];

            const { user, session, message, statusCode } = await this.validateToken(authToken as string, device_id as string);

            if (!user) {
                throw { statusCode, message }
            }

            if(session) {
                req.session = session;
            }

            req.user = user;

            next();
        } catch (error: any) {
            const errorData: { statusCode: number, message: string } = error instanceof Error ?
                { statusCode: 500, message: "Internal server error" } : error;

            return sendResponse(res, errorData.statusCode, { message: errorData.message });
        }

    }


}


export default new AuthMiddleware();