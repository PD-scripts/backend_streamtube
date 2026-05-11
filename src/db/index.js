import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI?.replace(/\/$/, "") || "mongodb://127.0.0.1:27017"
        const connectionInstance = await mongoose.connect(`${uri}/${DB_NAME}`)
        console.log(`\nMongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1)
    }
}

export default connectDB