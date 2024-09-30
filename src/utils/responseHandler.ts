import { Response } from "express";

/**
 * A function to send a response with the appropriate status code and data.
 * If the status code is 400 or greater, an error message is generated based on the status code and data.
 *
 * @param res - The Express response object.
 * @param statusCode - The HTTP status code to send in the response.
 * @param data - The data to send in the response.
 *
 * @returns - The Express response object with the status code and data.
 *
 * @throws - If an error occurs while processing the request, a 500 status code with an error message is returned.
 */
function sendResponse(res: Response, statusCode: number, data: any): any {
    try {
        if (statusCode >= 400) {
            let errorMessage;

            if (data?.message) {
                errorMessage = data.message;
            } else {
                switch (statusCode) {
                    case 400:
                        errorMessage = "Bad Request: The server could not understand the request.";
                        break;
                    case 401:
                        errorMessage = "Unauthorized: Access is denied due to invalid credentials.";
                        break;
                    case 403:
                        errorMessage = "Forbidden: You do not have permission to access this resource.";
                        break;
                    case 404:
                        errorMessage = "Not Found: The requested resource could not be found.";
                        break;
                    case 409:
                        errorMessage = "Conflict: There was a conflict with the current state of the resource.";
                        break;
                    case 422:
                        errorMessage = "Unprocessable Entity: The request was well-formed but was unable to be followed due to semantic errors.";
                        break;
                    case 500:
                        errorMessage = "Internal Server Error: An unexpected error occurred.";
                        break;
                    default:
                        errorMessage = "An error occurred.";
                        break;
                }
            }

            return res.status(statusCode).json({ ...data, message: errorMessage });
        }

        return res.status(statusCode).json(data);

    } catch (error: any) {
        return res.status(500).json({ message: error?.message || "Internal Server Error" });
    }
}

export default sendResponse;
