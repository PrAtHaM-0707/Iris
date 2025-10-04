"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.post('/register', (req, res) => {
    console.log('Routing POST /auth/register');
    (0, authController_1.register)(req, res);
});
router.post('/login', (req, res) => {
    console.log('Routing POST /auth/login');
    (0, authController_1.login)(req, res);
});
router.post('/google', (req, res) => {
    console.log('Routing POST /auth/google');
    (0, authController_1.googleAuth)(req, res);
});
router.post('/logout', authMiddleware_1.authMiddleware, (req, res) => {
    console.log('Routing POST /auth/logout');
    (0, authController_1.logout)(req, res);
});
router.post('/forgot-password', (req, res) => {
    console.log('Routing POST /auth/forgot-password');
    (0, authController_1.forgotPassword)(req, res);
});
router.get('/me', authMiddleware_1.authMiddleware, (req, res) => {
    console.log('Routing GET /auth/me');
    (0, authController_1.getCurrentUser)(req, res);
});
exports.default = router;
