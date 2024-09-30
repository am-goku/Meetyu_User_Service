import { TransportOptions } from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transportOptions = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SSL === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false
    },
}

export default transportOptions as TransportOptions;