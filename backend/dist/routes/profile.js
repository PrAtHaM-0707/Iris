"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const profileController_1 = require("../controllers/profileController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        console.log('Server: Multer fileFilter - File:', {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
        });
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype) {
            cb(null, true);
        }
        else {
            // Cast to any to satisfy TypeScript
            cb(new multer_1.default.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname), false);
        }
    },
});
const multerErrorHandler = (err, req, res, next) => {
    if (err instanceof multer_1.default.MulterError) {
        console.log('Server: Multer error:', err.message, err.code);
        return res.status(400).json({ message: `Multer error: ${err.message}` });
    }
    else if (err) {
        console.log('Server: File filter error:', err.message);
        return res.status(400).json({ message: err.message });
    }
    next();
};
router.patch('/', authMiddleware_1.authMiddleware, profileController_1.updateProfile);
router.post('/avatar', authMiddleware_1.authMiddleware, upload.single('avatar'), multerErrorHandler, profileController_1.uploadAvatar);
exports.default = router;
