import express from 'express';
import { getPlan, subscribePlan, updateCredits } from '../controllers/plansController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/', authMiddleware, getPlan);
router.post('/subscribe', authMiddleware, subscribePlan);
router.post('/update-credits', authMiddleware, updateCredits);

export default router;