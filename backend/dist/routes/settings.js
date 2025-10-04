"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const settingsController_1 = require("../controllers/settingsController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.patch('/', authMiddleware_1.authMiddleware, settingsController_1.updateSettings);
router.post('/2fa', authMiddleware_1.authMiddleware, settingsController_1.toggle2FA);
exports.default = router;
