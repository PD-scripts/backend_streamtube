// require('dotenv').config({path: './env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import {app} from './app.js'
dotenv.config({
    path: './.env'
})



const port = process.env.PORT || 8000

connectDB()
.then(() => {
    const server = app.listen(port, () => {
        console.log(`⚙️ Server is running at port : ${port}`);
    })

    server.on("error", (err) => {
        if (err.code === "EADDRINUSE") {
            console.error(`Port ${port} is already in use. Close any other process using this port or change PORT in .env.`)
            process.exit(1)
        }
        throw err
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})
 









/*
import express from "express"
const app = express()
( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("errror", (error) => {
            console.log("ERRR: ", error);
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        })

    } catch (error) {
        console.error("ERROR: ", error)
        throw err
    }
})()

*/