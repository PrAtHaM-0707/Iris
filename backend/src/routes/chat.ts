import express from 'express';
import { createChat, getChats, getChat, deleteChat, sendMessage } from '../controllers/chatController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, createChat);
router.get('/', authMiddleware, getChats);
router.get('/:id', authMiddleware, getChat);
router.delete('/:id', authMiddleware, deleteChat);
router.post('/:id/messages', authMiddleware, sendMessage);

export default router;