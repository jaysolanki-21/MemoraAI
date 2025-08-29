const express = require('express');
const router = express.Router();
const { createChat, getChats,  getMessages  } = require('../controllers/chat.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.post('/', authenticate, createChat);
router.get('/', authenticate, getChats);
router.get('/messages/:id', authenticate, getMessages);


module.exports = router;
