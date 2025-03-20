
import { connect } from "mongoose";
import "dotenv/config";

const DB_URL = process.env.DB_URL;

// Connecting db 
async function dbConnection() {
    try {
        await connect(DB_URL || "mongodb://127.0.0.1:27017/myapp");
        console.log("Database connected successfully");
    } catch (error) {
        console.log(error.message);
    }
}

export { dbConnection } ;