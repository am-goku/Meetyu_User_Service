import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { IUserModel } from "../database/model/UserModel";
dotenv.config();

class AuthToken {
    private ACCESS_TOKEN_EXPIRATION: string;
    private REFRESH_TOKEN_EXPIRATION: string;
    constructor() {
        this.ACCESS_TOKEN_EXPIRATION = '1d';
        this.REFRESH_TOKEN_EXPIRATION = '7d';
    };

    generateAuthToken(user: Partial<IUserModel>): string {
        try {
            const authToken = jwt.sign(user, process.env.JWT_ACCESS_SECRET as string, { expiresIn: this.ACCESS_TOKEN_EXPIRATION });
            return authToken;
        } catch (error) {
            throw new Error("Internal error: " + JSON.stringify(error));
        }
    }

    generateAuthRefresh(user: Partial<IUserModel>): string {
        try {
            const authRefresh = jwt.sign(user, process.env.JWT_REFRESH_SECRET as string, { expiresIn: this.REFRESH_TOKEN_EXPIRATION });
            return authRefresh;
        } catch (error) {
            throw new Error("Internal error: " + JSON.stringify(error));
        }
    }

    verifyAuthToken(authToken: string): IUserModel | void {
        try {
            const decoded = jwt.verify(authToken, process.env.JWT_ACCESS_SECRET as string);
            return decoded as IUserModel;
        } catch (error: any) {
            throw { message: error.message || "Authentication failed." }
        }
    }

}

export default new AuthToken();