import express, { Router } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import "dotenv/config";
import { dbConnection } from "./config/dbConnection.js";
import { authRouter } from "./routers/authRouter.js";
import path from "path";
import { fileURLToPath } from "url";
import { router } from "./routers/router.js";


const app = express();
app.use(cookieParser());
app.use(express.json());
const frontendUrl = ["http://127.0.0.1:3000", "http://localhost:3000"];
const corsOptions = {
    origin: frontendUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};
app.use(cors(corsOptions));

// Get __dirname equivalent in ES6
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));
app.use(morgan("dev"));
app.use(authRouter);
app.use("/user", router)
// Connecting the mongoDB and listen at port 
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    await dbConnection();
    console.log(`Server started at http://localhost:${PORT}`);
});
