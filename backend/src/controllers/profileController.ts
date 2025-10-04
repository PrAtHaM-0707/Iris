import { AuthRequest } from '../types/authRequest';
import { Response } from 'express';
import { getRepository } from 'typeorm';
import { User } from '../models/User';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const updates = req.body;
    const userRepo = getRepository(User);
    await userRepo.update(userId, updates);
    const updatedUser = await userRepo.findOne({ where: { id: userId } });
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    res.json(updatedUser);
  } catch (error) {
    console.error('Server: Update profile error:', (error as Error).message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const uploadAvatar = async (req: AuthRequest, res: Response) => {
  try {
    console.log('Server: uploadAvatar - Request received for user ID:', req.user!.id);
    console.log('Server: uploadAvatar - Headers:', req.headers);
    const userId = req.user!.id;
    const userRepo = getRepository(User);
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
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'avatars', public_id: `user_${userId}_${Date.now()}` },
        (error, result) => {
          if (error) {
            console.error('Server: uploadAvatar - Cloudinary upload error:', error.message);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      stream.end(file.buffer);
    });

    const avatarUrl = (result as any).secure_url;
    await userRepo.update(userId, { avatar: avatarUrl });
    console.log('Server: uploadAvatar - Avatar uploaded to Cloudinary:', avatarUrl);

    res.json({ message: 'Avatar uploaded', avatar: avatarUrl });
  } catch (error) {
    console.error('Server: uploadAvatar - Error:', (error as Error).message, (error as Error).stack);
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};