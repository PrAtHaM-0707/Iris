"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    var _a;
    console.log("Server: Auth middleware loaded for URL:", req.url); // Log middleware entry
    console.log("Server: Auth middleware - Incoming headers:", req.headers); // Log all headers to verify Authorization
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token) {
        console.log("Server: Auth middleware - No token provided");
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        console.log("Server: Auth middleware - req.user set:", req.user);
        next();
    }
    catch (error) {
        console.log("Server: Auth middleware - JWT verification failed:", error.message);
        res.status(401).json({ message: 'Invalid token' });
    }
};
exports.authMiddleware = authMiddleware;
