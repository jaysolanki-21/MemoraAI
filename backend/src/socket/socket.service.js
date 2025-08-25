const { json, text } = require("express");
const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { generateResponse, generateVector } = require("../services/ai.service");
const { Chat } = require("@google/genai");
const message = require("../models/message.model");
const { queryMemory, createMemory } = require("../services/vector.service");
const uuid = require("uuid");
const { chat } = require("@pinecone-database/pinecone/dist/assistant/data/chat");

function setupSocket(httpServer) {
    const io = new Server(httpServer);

    io.use(async (socket, next) => {
        const cookies = cookie.parse(socket.handshake.headers.cookie || "");

        if (!cookies.token) {
            return next(new Error("Authentication error"));
        }

        try {
            const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            if (!user) {
                return next(new Error("Authentication error"));
            }
            socket.user = user;
            console.log("Authenticated user:", user);
        }
        catch (err) {
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

            const vector = await generateVector(messagePayload.content);

            const memory = await queryMemory(vector, 5, {
                userId: socket.user._id,
            });

            await createMemory({ messageId: uuid.v4(), vector, metadata: { chatId: messagePayload.chat, userId: socket.user._id, text: messagePayload.content } });




            const chatHistory = await message.find({ chatId: messagePayload.chat })
                .sort({ createdAt: -1 })
                .limit(20)
                .lean();

            chatHistory.reverse();

            const stm = chatHistory.map(msg => {
                return { role: msg.role, parts: [{ text: msg.content }] };
            });

            const ltm = [{
                role: "user", parts: [{
                    text: `this are some previous messages from chat ,use them to generate respond
                    ${memory.map(item => item.metadata.text).join("\n")}
                    ` }]
            }];

            console.log(ltm[0]);
            console.log(stm);

            const response = await generateResponse([...ltm, ...stm]);

            const newMessagebyai = new message({
                content: response,
                chatId: messagePayload.chat,
                userId: socket.user._id,
                role: "model"
            });
            await newMessagebyai.save();

            const responseVector = await generateVector(response);

            await createMemory({ messageId: uuid.v4(), vector: responseVector, metadata: { chatId: messagePayload.chat, userId: socket.user._id, text: response } });

            socket.emit('ai-response', {
                content: response,
                chat: messagePayload.chat
            })
        });

    });
}

module.exports = {
    setupSocket
};
