import dotenv from "dotenv"
import connectDB from "./db/index.js";
import {app} from './app.js'

dotenv.config()

const defaultPort = Number(process.env.PORT) || 8000

const startServer = (portToUse) => {
    const server = app.listen(portToUse, () => {
        console.log(`Server is running at port: ${portToUse}`)
    })

    server.on("error", (err) => {
        if (err.code === "EADDRINUSE") {
            const nextPort = portToUse + 1
            console.warn(`Port ${portToUse} is in use. Trying port ${nextPort}...`)
            startServer(nextPort)
            return
        }
        throw err
    })
}

connectDB()
.then(() => {
    startServer(defaultPort)
})
.catch((err) => {
    console.log("MongoDB connection failed:", err)
})
