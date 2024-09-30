import { NextFunction, Request, Response } from "express";
import AuthToken from "../utils/AuthToken";
import { IUserModel } from "../database/model/UserModel";
import UserRepository from "../database/repository/UserRepository";
import sendResponse from "../utils/responseHandler";

declare global {
    namespace Express {
        interface Request {
            user?: Partial<IUserModel>;
        }
    }
}

class AuthMiddleware {
    private repository: typeof UserRepository;

    constructor() {
        this.repository = UserRepository;
    };

    validateToken = async (authToken: string): Promise<{ user: Partial<IUserModel> | null, message?: string, statusCode?: number }> => {
        try {
            const token = authToken?.split(' ')[1];

            if (!token) throw { user: null, statusCode: 401, message: "No token Provided." };

            const decoded = AuthToken.verifyAuthToken(token);

            if (!decoded || !decoded.email) throw { user: null, statusCode: 401, message: "Invalid token." };

            const user = await this.repository.fetchByEmail(decoded.email as string);

            if (!user) throw { user: null, statusCode: 404, message: "User not found." };

            if (user.blocked) throw { user: null, statusCode: 403, message: "This account has been blocked by members of the authority." };

            return { user }

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

            const { user, message, statusCode } = await this.validateToken(authToken as string);

            if (!user) {
                throw { statusCode, message }
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