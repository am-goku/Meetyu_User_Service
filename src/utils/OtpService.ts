import crypto from "crypto";
import bcrypt from "bcrypt";

class OtpService {

    private OTP_BYTE_LENGTH: number;
    private HASH_SALT: number;

    constructor() {
        this.OTP_BYTE_LENGTH = 3; // Byte size of OTP ( 3byte = 6char )
        this.HASH_SALT = 10; // Salt for bcrypt hashing
    };

    /**
     * Generates a one-time password (OTP) and returns it along with its hashed version and expiration date.
     *
     * @returns A Promise that resolves to an object containing the OTP, its hashed version, and expiration date.
     *
     * @remarks
     * - The OTP is generated as a random hexadecimal string with a length defined by `OTP_BYTE_LENGTH`.
     * - The generated OTP is then hashed using bcrypt with a salt defined by `HASH_SALT`.
     * - The expiration date of the OTP is determined by the `OTP_EXPIRATION` function.
     */
    generateOtp = async (): Promise<{ otp: string; hashedOtp: string; expDate: Date | number }> => {

        const otp = crypto.randomBytes(this.OTP_BYTE_LENGTH).toString('hex').toUpperCase();

        const hashedOtp = await bcrypt.hash(otp, this.HASH_SALT);

        const expDate = Date.now() + 10 * 60 * 1000;

        return {
            otp,
            hashedOtp,
            expDate,
        };
    }

    /**
     * Validates a one-time password (OTP) against its hashed version and expiration date.
     *
     * @param inputOtp - The input OTP to be validated.
     * @param hashedOtp - The hashed version of the OTP to be compared.
     * @param expDate - The expiration date of the OTP.
     *
     * @returns A Promise that resolves to an object containing the validation status and message.
     *
     * @remarks
     * - The function checks if the current date is greater than the expiration date. If so, it returns a status of `false` and a message indicating that the OTP has expired.
     * - If the current date is not greater than the expiration date, the function compares the input OTP with the hashed OTP using bcrypt's compare function.
     * - If the input OTP matches the hashed OTP, the function returns a status of `true` and a message indicating that the OTP is valid.
     * - If the input OTP does not match the hashed OTP, the function returns a status of `false` and a message indicating that the OTP is invalid.
     */
    validateOtp = async (inputOtp: string, hashedOtp: string, expDate: Date | number): Promise<{ status: boolean; message: string }> => {

        console.log("validateOtp",new Date() > new Date(expDate))
        if (new Date() > new Date(expDate)) {
            return { status: false, message: "OTP has been expired" }; // OTP is expired
        }

        const isValid = await bcrypt.compare(inputOtp, hashedOtp);

        console.log(inputOtp, hashedOtp, expDate, isValid);

        if (!isValid) {
            return { status: false, message: "Invalid OTP" }; // OTP is invalid
        }

        return { status: true, message: "OTP is valid" }; // OTP is valid and valid date
    }

}

export default new OtpService();