const chatModel = require('../models/chat.model');

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
