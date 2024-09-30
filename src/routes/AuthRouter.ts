import express from "express";
import { body } from "express-validator";
import AuthController from "../controllers/AuthController";
import AuthMiddleware from "../middleware/AuthMiddleware";

class AuthRouter {
    private router: express.Router;

    constructor() {
        this.router = express.Router();

        // Define routes inside the constructor
        this.router.post("/register", [
            body('username').notEmpty().withMessage('Username is required'),
            body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
            body('email').isEmail().withMessage('Invalid email')
        ], AuthController.register);

        this.router.post("/login",[
            body('password').notEmpty().withMessage('Password is required'),
            body('email').isEmail().withMessage('Invalid email')
        ], AuthController.login);

        this.router.post("/otp", AuthController.sendOtp);

        this.router.post("/verify", AuthController.verifyOtp);

        this.router.patch("/reset-password",[
            body('password').notEmpty().withMessage('Password is required'),
            body('otp').notEmpty().withMessage('Otp is required'),
            body('email').isEmail().withMessage('Invalid email')
        ], AuthController.resetPassword);

        this.router.post("/logout", AuthMiddleware.protect, AuthController.logout);
    }

    // Expose the router to be used in other parts of the application
    public getRouter(): express.Router {
        return this.router;
    }
}

// Export the router instance
export default new AuthRouter().getRouter();
