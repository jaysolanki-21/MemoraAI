const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  lastActivity: { type: Date, default: Date.now }
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
