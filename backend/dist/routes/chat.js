"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chatController_1 = require("../controllers/chatController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.post('/', authMiddleware_1.authMiddleware, chatController_1.createChat);
router.get('/', authMiddleware_1.authMiddleware, chatController_1.getChats);
router.get('/:id', authMiddleware_1.authMiddleware, chatController_1.getChat);
router.delete('/:id', authMiddleware_1.authMiddleware, chatController_1.deleteChat);
router.post('/:id/messages', authMiddleware_1.authMiddleware, chatController_1.sendMessage);
exports.default = router;
