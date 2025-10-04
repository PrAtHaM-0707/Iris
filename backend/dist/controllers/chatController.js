"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = exports.deleteChat = exports.getChat = exports.getChats = exports.createChat = void 0;
const typeorm_1 = require("typeorm");
const ChatHistory_1 = require("../models/ChatHistory");
const Message_1 = require("../models/Message");
const User_1 = require("../models/User");
const openai_1 = __importDefault(require("openai"));
const createChat = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('Creating chat for user:', userId);
        const chatRepo = (0, typeorm_1.getRepository)(ChatHistory_1.ChatHistory);
        const userRepo = (0, typeorm_1.getRepository)(User_1.User);
        const user = await userRepo.findOne({ where: { id: userId } });
        if (!user) {
            console.log('User not found:', userId);
            return res.status(404).json({ message: 'User not found' });
        }
        const newChat = chatRepo.create({ title: 'New Chat', createdAt: new Date(), updatedAt: new Date(), user, messages: [] });
        await chatRepo.save(newChat);
        console.log('Chat created successfully:', newChat.id);
        res.json({ ...newChat, messages: [] }); // Explicitly include messages array
    }
    catch (error) {
        console.error('Create chat error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.createChat = createChat;
const getChats = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('Fetching chats for user:', userId);
        const chatRepo = (0, typeorm_1.getRepository)(ChatHistory_1.ChatHistory);
        const chats = await chatRepo.find({ where: { user: { id: userId } }, relations: ['messages'] });
        console.log('Fetched', chats.length, 'chats for user:', userId);
        res.json(chats);
    }
    catch (error) {
        console.error('Get chats error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getChats = getChats;
const getChat = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        console.log('Fetching chat:', id, 'for user:', userId);
        const chatRepo = (0, typeorm_1.getRepository)(ChatHistory_1.ChatHistory);
        const chat = await chatRepo.findOne({ where: { id, user: { id: userId } }, relations: ['messages'] });
        if (!chat) {
            console.log('Chat not found:', id);
            return res.status(404).json({ message: 'Chat not found' });
        }
        console.log('Chat fetched successfully:', id);
        res.json(chat);
    }
    catch (error) {
        console.error('Get chat error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getChat = getChat;
const deleteChat = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        console.log('Deleting chat:', id, 'for user:', userId);
        const chatRepo = (0, typeorm_1.getRepository)(ChatHistory_1.ChatHistory);
        const messageRepo = (0, typeorm_1.getRepository)(Message_1.Message);
        const chat = await chatRepo.findOne({ where: { id, user: { id: userId } }, relations: ['messages'] });
        if (!chat) {
            console.log('Chat not found:', id);
            return res.status(404).json({ message: 'Chat not found' });
        }
        // Explicitly delete related messages
        if (chat.messages && chat.messages.length > 0) {
            await messageRepo.delete({ chat: { id } });
            console.log('Related messages deleted for chat:', id);
        }
        await chatRepo.remove(chat);
        console.log('Chat deleted successfully:', id);
        res.json({ message: 'Chat deleted' });
    }
    catch (error) {
        console.error('Delete chat error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.deleteChat = deleteChat;
const sendMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, images } = req.body;
        const userId = req.user.id;
        console.log('Sending message to chat:', id, 'content:', content, 'images:', images, 'user:', userId);
        const chatRepo = (0, typeorm_1.getRepository)(ChatHistory_1.ChatHistory);
        const messageRepo = (0, typeorm_1.getRepository)(Message_1.Message);
        const chat = await chatRepo.findOne({ where: { id, user: { id: userId } } });
        if (!chat) {
            console.log('Chat not found:', id);
            return res.status(404).json({ message: 'Chat not found' });
        }
        const userMessage = messageRepo.create({ content, role: 'user', timestamp: new Date(), images, chat });
        await messageRepo.save(userMessage);
        console.log('User message saved:', userMessage.id);
        const openai = new openai_1.default({
            apiKey: process.env.GEMINI_API_KEY,
            baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
        });
        console.log('Calling Gemini API for chat:', id);
        const aiResponse = await openai.chat.completions.create({
            model: 'gemini-2.0-flash',
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content },
            ],
        });
        const aiContent = aiResponse.choices[0].message.content || 'No response from AI';
        console.log('AI response received:', aiContent);
        const aiMessage = messageRepo.create({ content: aiContent, role: 'assistant', timestamp: new Date(), chat });
        await messageRepo.save(aiMessage);
        console.log('AI message saved:', aiMessage.id);
        chat.updatedAt = new Date();
        await chatRepo.save(chat);
        console.log('Chat updated:', id);
        res.json({ userMessage, aiMessage });
    }
    catch (error) {
        console.error('Send message error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.sendMessage = sendMessage;
