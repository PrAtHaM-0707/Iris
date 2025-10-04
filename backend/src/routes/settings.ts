import express from 'express';
import { updateSettings, toggle2FA } from '../controllers/settingsController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router.patch('/', authMiddleware, updateSettings);
router.post('/2fa', authMiddleware, toggle2FA);

export default router;