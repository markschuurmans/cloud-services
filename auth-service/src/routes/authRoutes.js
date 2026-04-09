import express from 'express';
import { register, login, profile, validate } from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authMiddleware, profile);

// Internal validation endpoint for peer services
router.get('/validate', authMiddleware, validate);

export default router;
