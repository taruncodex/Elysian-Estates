import express from "express";
import { signUpUser, loginUser, forgotPassword, resetPassword, checkForToken } from "../controllers/auth.controller.js";
const authRouter = express.Router();

// http:localhost/signup
authRouter.post("/signup", signUpUser);
authRouter.post("/login", loginUser);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password/:token", checkForToken, resetPassword);
authRouter.post("/", async (req, res) => {
    try {
        return res.json({ msg: "This is homePage." });
    } catch (error) {
        return res.json({ error: error.message });
    }
})
export { authRouter };
