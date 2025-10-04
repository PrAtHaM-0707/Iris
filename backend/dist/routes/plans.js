"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const plansController_1 = require("../controllers/plansController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.get('/', authMiddleware_1.authMiddleware, plansController_1.getPlan);
router.post('/subscribe', authMiddleware_1.authMiddleware, plansController_1.subscribePlan);
router.post('/update-credits', authMiddleware_1.authMiddleware, plansController_1.updateCredits);
exports.default = router;
