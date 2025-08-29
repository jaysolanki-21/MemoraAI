const chatModel = require('../models/chat.model');
const messageModel = require('../models/message.model');

exports.createChat = async (req, res) => {
  try {
    const newChat = new chatModel({
      userId: req.user._id,
      title: req.body.title
    });
    const savedChat = await newChat.save();
    res.status(201).json(savedChat);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create chat' });
  }
};

exports.getChats = async (req, res) => {
    const user = req.user;

    const chats = await chatModel.find({ user: user._id });

    res.status(200).json({
        message: "Chats retrieved successfully",
        chats: chats.map(chat => ({
            _id: chat._id,
            title: chat.title,
            lastActivity: chat.lastActivity,
            user: chat.user
        }))
    });
}

exports.getMessages = async (req, res) => {

    const chatId = req.params.id;

    const messages = await messageModel.find({ chat: chatId }).sort({ createdAt: 1 });

    res.status(200).json({
        message: "Messages retrieved successfully",
        messages: messages
    })

}
