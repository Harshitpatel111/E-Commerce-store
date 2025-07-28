import express from 'express';
import { login, logout, signup, refreshToken, getProfile } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js'; // ✅ Import the middleware

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);

// ✅ Apply protectRoute here:
router.get('/profile', protectRoute, getProfile);

export default router;
