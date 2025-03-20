import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

router.get("/home", async (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
});

export { router };
