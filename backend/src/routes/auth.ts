import express from 'express';
import { register, login, logout, forgotPassword, getCurrentUser, googleAuth } from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/register', (req, res) => {
  console.log('Routing POST /auth/register');
  register(req, res);
});
router.post('/login', (req, res) => {
  console.log('Routing POST /auth/login');
  login(req, res);
});
router.post('/google', (req, res) => {
  console.log('Routing POST /auth/google');
  googleAuth(req, res);
});
router.post('/logout', authMiddleware, (req, res) => {
  console.log('Routing POST /auth/logout');
  logout(req, res);
});
router.post('/forgot-password', (req, res) => {
  console.log('Routing POST /auth/forgot-password');
  forgotPassword(req, res);
});
router.get('/me', authMiddleware, (req, res) => {
  console.log('Routing GET /auth/me');
  getCurrentUser(req, res);
});

export default router;