import mongoose from "mongoose";

import dotenv from "dotenv";

dotenv.config();

async function createDatabaseConnection(): Promise<void> {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log("Connected to MongoDB successfully");
    } catch (error: any) {
        console.error("Database Connection Error: ", error);
    }
}

export default createDatabaseConnection;