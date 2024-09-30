import express from "express";
import AuthMiddleware from "../middleware/AuthMiddleware";
import UserController from "../controllers/UserController";

class UserRouter {
    private router: express.Router;

    constructor() {
        this.router = express.Router();

        this.router.get("/", UserController.getAllUsers);

        this.router.get("/search/:searchKey", AuthMiddleware.protect, UserController.searchUser);

        this.router.put("/", AuthMiddleware.protect, UserController.updateUser);

        this.router.patch("/toggle-block", AuthMiddleware.protect, UserController.toggleBlock);

        this.router.patch("/soft-delete", AuthMiddleware.protect, UserController.temporaryDelete);

        this.router.delete("/:userId", AuthMiddleware.protect, UserController.deleteAccount);
    }

    public getRouter(): express.Router {
        return this.router;
    }
}

export default new UserRouter().getRouter();