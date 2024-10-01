import { Request, Response } from "express";
import { validationResult } from "express-validator";
import UserRepository from "../database/repository/UserRepository";
import SessionRepository from "../database/repository/SessionRepository";
import sendResponse from "../utils/responseHandler";
import BcryptService from "../utils/BcryptService";
import OtpService from "../utils/OtpService";
import SmtpService from "../utils/SmtpService";
import AuthToken from "../utils/AuthToken";
import { IUserModel } from "../database/model/UserModel";
import { v4 as uuidv4 } from "uuid";


class AuthController {
    private getResponseUser: (user: IUserModel) => Partial<IUserModel>;

    constructor() {
        this.getResponseUser = (user: IUserModel): Partial<IUserModel> => {
            return {
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                verified: user.verified,
                blocked: user.blocked,
                deleted: user.deleted,
                createdAt: user.createdAt,
            }
        };
    }

    register = async (req: Request, res: Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendResponse(res, 422, { message: errors.array() });
        }

        try {
            const { username, password, email } = req.body;

            const emailExist = await UserRepository.fetchByEmail(email);
            if (emailExist) {
                throw { statusCode: 409, message: "Email already exists" };
            }

            const usernameExists = await UserRepository.fetchByUsername(username);
            if (usernameExists) {
                throw { statusCode: 409, message: "Username already exists" };
            }

            const hashedPassword = await BcryptService.hashPassword(password);
            const otpData = await OtpService.generateOtp();

            await SmtpService.sendOTP(otpData.otp, email);

            const user = await UserRepository.create({
                email,
                username,
                password: hashedPassword,
                otp: otpData.hashedOtp,
                otpExpiresAt: otpData.expDate,
            });

            return sendResponse(res, 201, { message: "User registered successfully", user });

        } catch (error: any) {
            console.log(error)
            const errorData: { statusCode: number, message: string } = error instanceof Error ?
                { statusCode: 500, message: "Internal server error" } : error;

            return sendResponse(res, errorData.statusCode, { message: errorData.message });
        }
    }

    login = async (req: Request, res: Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendResponse(res, 422, { message: errors.array() });
        }

        try {
            const { email, password } = req.body;

            const user = await UserRepository.fetchByEmail(email);
            if (!user) {
                throw { statusCode: 404, message: "Account not found" };
            }

            const isValidPassword = await BcryptService.comparePasswords(password, user.password);
            if (!isValidPassword) {
                throw { statusCode: 401, message: "Invalid credentials" };
            }

            if (user.blocked) {
                throw { statusCode: 403, message: "This account has been blocked by members of the authority." };
            }

            if (!user.verified) {
                throw { statusCode: 403, message: "This account has not been verified yet." };
            }

            if (user.deleted) {
                throw { statusCode: 423, message: "Account is temporarily unavailable but not permanently removed." };
            }

            const responseUser: Partial<IUserModel> = this.getResponseUser(user);
            const accessToken: string = AuthToken.generateAuthToken(responseUser);

            const device_id = uuidv4().toString();
            const { session } = await SessionRepository.createSession(user._id, device_id, accessToken);

            return sendResponse(res, 200, { accessToken, user: responseUser, deviceId: session?.device_id });

        } catch (error: any) {
            console.log(error)
            const errorData: { statusCode: number, message: string } = error instanceof Error ?
                { statusCode: 500, message: "Internal server error" } : error;

            return sendResponse(res, errorData.statusCode, { message: errorData.message });
        }
    }

    verifyOtp = async (req: Request, res: Response): Promise<void> => {
        try {
            const { otp, email } = req.body;

            const user = await UserRepository.fetchByEmail(email);

            if (!user) {
                throw { statusCode: 404, message: "Account not found" };
            }

            if (user.blocked) {
                throw { statusCode: 403, message: "This account has been blocked by members of the authority." };
            }

            if (user.deleted) {
                throw { statusCode: 423, message: "Account is temporarily unavailable but not permanently removed." };
            }

            if (!user.otp || !user.otpExpiresAt) {
                throw { statusCode: 400, message: "No OTP has been sent for this account." };
            }

            const isValidOtp = await OtpService.validateOtp(otp, user.otp, user.otpExpiresAt);

            if (!isValidOtp.status) {
                throw { statusCode: 401, message: isValidOtp.message };
            }

            const updatedUser = await UserRepository.update(user._id, {
                verified: true,
                otp: undefined,
                otpExpiresAt: undefined,
            })

            if (!updatedUser) throw { statusCode: 400, message: "Verification failed." };

            const responseUser: Partial<IUserModel> = this.getResponseUser(updatedUser);
            const accessToken: string = AuthToken.generateAuthToken(responseUser);

            return sendResponse(res, 200, { accessToken, user: responseUser });

        } catch (error: any) {
            const errorData: { statusCode: number, message: string } = error instanceof Error ?
                { statusCode: 500, message: "Internal server error" } : error;

            return sendResponse(res, errorData.statusCode, { message: errorData.message });
        }
    }

    sendOtp = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email } = req.body;

            const user = await UserRepository.fetchByEmail(email);

            if (!user) throw { statusCode: 400, message: "Invalid email account." };

            const otpData = await OtpService.generateOtp();

            const updatedUser = await UserRepository.update(user._id, {
                otp: otpData.hashedOtp,
                otpExpiresAt: otpData.expDate,
            });

            if (!updatedUser) throw { statusCode: 400, message: "Failed to send OTP." };

            await SmtpService.sendOTP(otpData.otp, email);

            return sendResponse(res, 200, { message: "OTP sent successfully." });

        } catch (error: any) {
            const errorData: { statusCode: number, message: string } = error instanceof Error ?
                { statusCode: 500, message: "Internal server error" } : error;

            return sendResponse(res, errorData.statusCode, { message: errorData.message });
        }
    }

    resetPassword = async (req: Request, res: Response): Promise<void> => {
        try {
            const { otp, email, password } = req.body;

            const user = await UserRepository.fetchByEmail(email);

            if (!user) {
                throw { statusCode: 404, message: "Account not found" };
            }

            if (user.blocked) {
                throw { statusCode: 403, message: "This account has been blocked by members of the authority." };
            }

            if (!user.verified) {
                throw { statusCode: 403, message: "This account has not been verified yet." };
            }

            if (user.deleted) {
                throw { statusCode: 423, message: "Account is temporarily unavailable but not permanently removed." };
            }

            if (!user.otp || !user.otpExpiresAt) {
                throw { statusCode: 400, message: "No OTP has been sent for this account." };
            }

            const isValidOtp = await OtpService.validateOtp(otp, user.otp, user.otpExpiresAt);

            if (!isValidOtp.status) {
                throw { statusCode: 401, message: isValidOtp.message };
            }

            const hashedPassword = await BcryptService.hashPassword(password);

            const updatedUser = await UserRepository.update(user._id, {
                verified: true,
                otp: undefined,
                otpExpiresAt: undefined,
                password: hashedPassword
            })

            if (!updatedUser) throw { statusCode: 400, message: "Verification failed." };

            const responseUser: Partial<IUserModel> = this.getResponseUser(updatedUser);
            const accessToken: string = AuthToken.generateAuthToken(responseUser);

            return sendResponse(res, 200, { accessToken, user: responseUser });

        } catch (error: any) {
            const errorData: { statusCode: number, message: string } = error instanceof Error ?
                { statusCode: 500, message: "Internal server error" } : error;

            return sendResponse(res, errorData.statusCode, { message: errorData.message });
        }
    }

    logout = async (req: Request, res: Response): Promise<void> => {
        try {
            const deviceId = req.headers['X-Device-ID'];

            await SessionRepository.deleteSession(req.user?._id as string, deviceId as string);

            return sendResponse(res, 200, { message: "User logged out." })

        } catch (error: any) {
            console.log(error)
            const errorData: { statusCode: number, message: string } = error instanceof Error ?
                { statusCode: 500, message: "Internal server error" } : error;

            return sendResponse(res, errorData.statusCode, { message: errorData.message });
        }
    }

}

export default new AuthController();