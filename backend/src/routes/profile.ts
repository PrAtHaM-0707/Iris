import express from 'express';
import { updateProfile, uploadAvatar } from '../controllers/profileController';
import { authMiddleware } from '../middlewares/authMiddleware';
import multer from 'multer';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
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
    } else {
      // Cast to any to satisfy TypeScript
      cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname) as any, false);
    }
  },
});

const multerErrorHandler = (
  err: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (err instanceof multer.MulterError) {
    console.log('Server: Multer error:', err.message, err.code);
    return res.status(400).json({ message: `Multer error: ${err.message}` });
  } else if (err) {
    console.log('Server: File filter error:', err.message);
    return res.status(400).json({ message: err.message });
  }
  next();
};

router.patch('/', authMiddleware, updateProfile);
router.post(
  '/avatar',
  authMiddleware,
  upload.single('avatar'),
  multerErrorHandler,
  uploadAvatar
);

export default router;
