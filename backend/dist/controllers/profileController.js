"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAvatar = exports.updateProfile = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("../models/User");
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const updates = req.body;
        const userRepo = (0, typeorm_1.getRepository)(User_1.User);
        await userRepo.update(userId, updates);
        const updatedUser = await userRepo.findOne({ where: { id: userId } });
        if (!updatedUser)
            return res.status(404).json({ message: 'User not found' });
        res.json(updatedUser);
    }
    catch (error) {
        console.error('Server: Update profile error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateProfile = updateProfile;
const uploadAvatar = async (req, res) => {
    try {
        console.log('Server: uploadAvatar - Request received for user ID:', req.user.id);
        console.log('Server: uploadAvatar - Headers:', req.headers);
        const userId = req.user.id;
        const userRepo = (0, typeorm_1.getRepository)(User_1.User);
        const user = await userRepo.findOne({ where: { id: userId } });
        if (!user) {
            console.log('Server: uploadAvatar - User not found for ID:', userId);
            return res.status(404).json({ message: 'User not found' });
        }
        if (!req.file) {
            console.log('Server: uploadAvatar - No file in req.file after Multer middleware');
            return res.status(400).json({ message: 'No file uploaded' });
        }
        console.log('Server: uploadAvatar - File received from Multer:', {
            originalname: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
        });
        // Verify Cloudinary configuration
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            console.error('Server: uploadAvatar - Missing Cloudinary credentials');
            return res.status(500).json({ message: 'Cloudinary configuration error' });
        }
        // Upload to Cloudinary
        const file = req.file;
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary_1.v2.uploader.upload_stream({ folder: 'avatars', public_id: `user_${userId}_${Date.now()}` }, (error, result) => {
                if (error) {
                    console.error('Server: uploadAvatar - Cloudinary upload error:', error.message);
                    reject(error);
                }
                else {
                    resolve(result);
                }
            });
            stream.end(file.buffer);
        });
        const avatarUrl = result.secure_url;
        await userRepo.update(userId, { avatar: avatarUrl });
        console.log('Server: uploadAvatar - Avatar uploaded to Cloudinary:', avatarUrl);
        res.json({ message: 'Avatar uploaded', avatar: avatarUrl });
    }
    catch (error) {
        console.error('Server: uploadAvatar - Error:', error.message, error.stack);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.uploadAvatar = uploadAvatar;
