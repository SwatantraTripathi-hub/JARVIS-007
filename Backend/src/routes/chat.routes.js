const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const chatController = require('../controllers/chat.controller');
const upload = require('../middleware/upload.middleware');
router.post('/', authMiddleware, chatController.createChat);
router.get('/', authMiddleware, chatController.getUserChats);
router.get('/:chatId/messages', authMiddleware, chatController.getChatMessages);
router.patch('/:chatId/title', authMiddleware, chatController.updateChatTitle);
router.post('/upload-context', authMiddleware, upload.array('files', 5), chatController.uploadContextFiles);


module.exports = router;