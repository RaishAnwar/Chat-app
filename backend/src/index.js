

import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import fileUpload from "express-fileupload"; // ✅ Import express-fileupload
import messageRoutes from "./routes/message.route.js"
import { app, server } from "./lib/socket.js";
dotenv.config();


const PORT = process.env.PORT;
const _dirname = path.resolve();

app.use(express.json({ limit: "10mb" })); // Handles JSON payloads
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // Handles form-data payloads
app.use(cookieParser());
app.use(cors(
    {
        origin: "http://localhost:5173",
        credentials: true
    }
));

//  Enable file uploads 
app.use(fileUpload({ useTempFiles: true, tempFileDir: "/tmp/" }));

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if(process.env.NODE_ENV==="production"){
    app.use(express.static(path.join(__dirname,"../frontend/dist")));


app.get("*", (req,res) => {
    res.sendFile(path.join(__dirname,"../frontend","dist","index.html"));
})
}
server.listen(PORT, () => {
    console.log("Server is running on PORT: " + PORT);
    connectDB();
});
