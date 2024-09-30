import { Request, Response } from "express";
import UserRepository from "../database/repository/UserRepository";
import sendResponse from "../utils/responseHandler";


class UserController {

    constructor() { };

    async getAllUsers(req: Request, res: Response): Promise<void> {
        try {

            const page = req.query.page || 1;
            const limit = req.query.limit || 10;

            const users = await UserRepository.fetchAll(+page, +limit);

            return sendResponse(res, 200, users);

        } catch (error: any) {
            const errorData: { statusCode: number, message: string } = error instanceof Error ?
                { statusCode: 500, message: "Internal server error" } : error;

            return sendResponse(res, errorData.statusCode, { message: errorData.message });
        }
    }

    async searchUser(req: Request, res: Response): Promise<void> {
        try {

            const searchKey = req.params.searchKey;

            const users = await UserRepository.fetchByName(searchKey);

            sendResponse(res, 200, users);

        } catch (error: any) {
            const errorData: { statusCode: number, message: string } = error instanceof Error ?
                { statusCode: 500, message: "Internal server error" } : error;

            return sendResponse(res, errorData.statusCode, { message: errorData.message });
        }
    }

    async updateUser(req: Request, res: Response): Promise<void> {
        try {
            const id = req.user?._id;
            const updatedUser = req.body;

            const user = await UserRepository.update(id as string, updatedUser);

            if (!user) throw { statusCode: 404, message: "User not found." };

            sendResponse(res, 200, user);

        } catch (error: any) {
            const errorData: { statusCode: number, message: string } = error instanceof Error ?
                { statusCode: 500, message: "Internal server error" } : error;

            return sendResponse(res, errorData.statusCode, { message: errorData.message });
        }
    }

    async toggleBlock(req: Request, res: Response): Promise<void> {
        try {
            const { userId, block } = req.body;

            if (block) {
                const user = await UserRepository.block(userId as string);
                if (!user) throw { statusCode: 404, message: "User not found." };
                return sendResponse(res, 200, user);
            }

            const user = await UserRepository.unblock(userId as string);
            if (!user) throw { statusCode: 404, message: "User not found." };
            return sendResponse(res, 200, user);

        } catch (error: any) {
            const errorData: { statusCode: number, message: string } = error instanceof Error ?
                { statusCode: 500, message: "Internal server error" } : error;

            return sendResponse(res, errorData.statusCode, { message: errorData.message });
        }
    }

    async temporaryDelete(req: Request, res: Response): Promise<void> {
        try {
            const id = req.body.userId || req.user?._id;

            const user = await UserRepository.softDelete(id);

            if (!user) throw { statusCode: 404, message: "User not found." };

            return sendResponse(res, 200, { message: "User has been deleted temporarily." })

        } catch (error: any) {
            const errorData: { statusCode: number, message: string } = error instanceof Error ?
                { statusCode: 500, message: "Internal server error" } : error;

            return sendResponse(res, errorData.statusCode, { message: errorData.message });
        }
    }

    async deleteAccount(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.userId;

            const user = await UserRepository.delete(id);

            if (!user) throw { statusCode: 404, message: "User not found." };

            return sendResponse(res, 200, { message: "User has been deleted permanently." })

        } catch (error: any) {
            const errorData: { statusCode: number, message: string } = error instanceof Error ?
                { statusCode: 500, message: "Internal server error" } : error;

            return sendResponse(res, errorData.statusCode, { message: errorData.message });
        }
    }

}

export default new UserController();