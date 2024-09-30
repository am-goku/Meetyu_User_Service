import { createTransport, SendMailOptions, Transporter } from "nodemailer";
import transportOptions from "../config/Smtp";
import dotenv from "dotenv";

dotenv.config();

class SmtpService {

    private transporter: Transporter;

    constructor() {
        this.transporter = createTransport(transportOptions);
    }

    /**
     * The `sendOTP` function sends an email with a one-time password (OTP) to a specified email
     * address.
     * @param {string} otp - The `otp` parameter is a string that represents the one-time password
     * (OTP) that will be sent to the user's email address for verification or authentication purposes.
     * @param {string} email - The `email` parameter is a string that represents the email address
     * where the OTP (One-Time Password) will be sent.
     * @returns The `sendOTP` function is returning a Promise that resolves to void.
     */
    async sendOTP(otp: string, email: string): Promise<void> {
        const mailOptions: SendMailOptions = {
            from: process.env.SMTP_FROM_EMAIL,
            to: email,
            subject: "One-Time Password (OTP)",
            text: `Your one-time password (OTP) is: ${otp}. Please keep it secret and do not share it with anyone. This otp is only valid for ten minutes.`
        };

        return await this.transporter.sendMail(mailOptions);
    }

}

export default new SmtpService();