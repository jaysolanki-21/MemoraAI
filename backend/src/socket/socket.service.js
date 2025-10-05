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
  const io = new Server(httpServer, {
    cors: {
      origin: true,
      methods: ["GET", "POST"],
      credentials: true
    }
  });


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

      const [newMessage, vector] = await Promise.all([
        message.create({
          content: messagePayload.content,
          chatId: messagePayload.chat,
          userId: socket.user._id,
          role: "user"
        }),
        generateVector(messagePayload.content)
      ]);

      await createMemory({
        messageId: uuid.v4(),
        vector,
        metadata: {
          chatId: messagePayload.chat,
          userId: socket.user._id,
          text: messagePayload.content
        }
      });

      const [chatHistory, memory] = await Promise.all([
        message.find({ chatId: messagePayload.chat })
          .sort({ createdAt: -1 })
          .limit(20)
          .lean(),
        queryMemory({
          queryVector: vector,
          limit: 5,
          metadata: { userId: socket.user._id }
        })
      ]);

      chatHistory.reverse();

      const stm = chatHistory.map(item => ({
        role: item.role,
        parts: [{ text: item.content }]
      }));

      const ltm = [{
        role: "user",
        parts: [{
          text: `Here are some relevant past messages, use them for context:\n${memory.map(item => item.metadata.text).join("\n")}`
        }]
      }];

      // Generate AI response
      const response = await generateResponse([...ltm, ...stm]);

      const [newMessagebyai, responseVector] = await Promise.all([
        message.create({
          content: response,
          chatId: messagePayload.chat,
          userId: socket.user._id,
          role: "model"
        }),
        generateVector(response)
      ]);

      await createMemory({
        messageId: uuid.v4(),
        vector: responseVector,
        metadata: {
          chatId: messagePayload.chat,
          userId: socket.user._id,
          text: response
        }
      });

      socket.emit("ai-response", {
        content: response,
        chat: messagePayload.chat
      });
    });
  });
}

module.exports = {
  setupSocket
};
