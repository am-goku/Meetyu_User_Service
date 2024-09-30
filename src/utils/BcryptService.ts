import bcrypt from 'bcrypt';

class BcryptService {

    private saltRounds: number;
    
    constructor() {
        this.saltRounds = 10; // Define the number of salt rounds for hashing
    };

    /**
     * Hash a plain password.
     * @param password - The plain text password to hash.
     * @returns The hashed password.
     */
    hashPassword = async (password: string): Promise<string> => {
        const hashedPassword = await bcrypt.hash(password, this.saltRounds);
        return hashedPassword;
    };

    /**
     * Compare a plain password with a hashed password.
     * @param password - The plain text password to compare.
     * @param hashedPassword - The hashed password to compare against.
     * @returns A boolean indicating whether the passwords match.
     */
    comparePasswords = async (password: string, hashedPassword: string): Promise<boolean> => {
        const match = await bcrypt.compare(password, hashedPassword);
        return match;
    };
}

export default new BcryptService();
