const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  role: { type: String, enum: ['user', 'model','system'], default: 'user' }
},{ timestamps: true });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
