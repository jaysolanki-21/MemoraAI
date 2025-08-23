const { json } = require("express");
const {Server} = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const {generateResponse} = require("../services/ai.service");
const { Chat } = require("@google/genai");
const message = require("../models/message.model");

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

            const newMessage = new message({
                content: messagePayload.content,
                chatId: messagePayload.chat,
                userId: socket.user._id,
                role: "user"
            });
            await newMessage.save();

            const chatHistory = await message.find({ chatId: messagePayload.chat }).sort({ createdAt: 1 });
            const formattedHistory = chatHistory.map(msg =>{
                return { role: msg.role, parts: [{ text: msg.content }] };
            } );

            const response = await generateResponse(formattedHistory);

            const newMessagebyai = new message({
                content: response,
                chatId: messagePayload.chat,
                userId: socket.user._id,
                role: "model"
            });
            await newMessagebyai.save();

            socket.emit('ai-response', {
                content : response,
                chat : messagePayload.chat
            })
        });

    });
}

module.exports = {
    setupSocket
};
