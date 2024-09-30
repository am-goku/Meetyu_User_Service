import app from "./app";
import cors from "cors";
import logger from "morgan";
import createDatabaseConnection from "./config/database";
import AuthRouter from "./routes/AuthRouter";
import UserRouter from "./routes/UserRouter";
import { errorHandler, notFoundHandler } from "./middleware/ErrorHandler";

createDatabaseConnection();

app.use(cors({
    credentials: true,
    origin: process.env.CORS_ORIGIN || "*"
}));


app.use(logger("dev"));

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// Router middlewares
app.use('/', UserRouter)
app.use('/auth', AuthRouter)


// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);


const PORT = process.env.PORT || 8001;

const server = app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    server.close(() => {
        console.log('Server closed. Exiting process...');
        process.exit(0);
    });
});