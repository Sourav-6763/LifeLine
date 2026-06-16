import express from 'express';
import { donorRegistration, getProfile, userInfo } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router =express.Router()

router.post('/Registration',authMiddleware, donorRegistration);
router.get('/getuserForLogin',authMiddleware, getProfile);
router.post('/saveUser', userInfo);

export default router;