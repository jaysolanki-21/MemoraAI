const express = require('express');
const router = express.Router();
const { createChat } = require('../controllers/chat.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.post('/', authenticate, createChat);

module.exports = router;
