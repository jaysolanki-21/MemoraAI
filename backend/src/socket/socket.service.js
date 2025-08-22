const { json } = require("express");
const {Server} = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const generateResponse = require("../services/ai.service")

function setupSocket(httpServer) {
    const io = new Server(httpServer);

    io.use(async (socket, next) => {
        const cookies = cookie.parse(socket.handshake.headers.cookie || "");

        if(!cookies.token) {
            return next(new Error("Authentication error"));
        }

        try{
            const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            if(!user) {
                return next(new Error("Authentication error"));
            }
            socket.user = user;
            console.log("Authenticated user:", user);
        }
        catch(err){
            return next(new Error("Authentication error"));
        }

        next();
    });

    io.on("connection", (socket) => {
        console.log("New socket connection:", socket.id);

        socket.on("ai-message", async (messagePayload) => {
            console.log("Received AI message:", messagePayload);

            const response = await generateResponse(messagePayload.content);
            socket.emit("ai-response", response);
        });

    });
}

module.exports = {
    setupSocket
};
