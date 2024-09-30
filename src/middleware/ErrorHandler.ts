import { NextFunction, Request, Response } from "express";

// Custom error class for handling errors
class AppError extends Error {
    public statusCode: number;
    public isOperational: boolean;

    constructor(message: string, statusCode: number, isOperational: boolean = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        // Maintaining proper stack trace
        Error.captureStackTrace(this, this.constructor);
    }
}

// Error handling middleware
const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction): void => {
    // Set default values
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    // Log the error details for debugging (you might want to use a logging library)
    console.error("Error details:", err);

    // Send response to client
    res.status(err.statusCode).json({
        status: err.isOperational ? "error" : "fail",
        message: err.message,
    });
};


// Middleware to handle 404 Not Found errors
const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
    res.status(404).json({
        status: "fail",
        message: "Route not found",
    });
};

export { errorHandler, notFoundHandler };