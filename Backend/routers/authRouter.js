import express from "express";
import { signUpUser, loginUser, forgotPassword, resetPassword, checkForToken } from "../controllers/auth.controller.js";
import path from "path";
import { fileURLToPath } from "url";

const authRouter = express.Router();

// http:localhost/signup

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);


authRouter.post("/signup", signUpUser);
authRouter.post("/login", loginUser);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password/:token", checkForToken, resetPassword);


export { authRouter };
