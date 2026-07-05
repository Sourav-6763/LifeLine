import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { bloodSearchFunc, donorRequestForBloodController } from '../controllers/bloodSearchController.js';
import {bloodRequestPost, SeeAllbloodRequestPost} from '../controllers/bloodRequestPost.js'

const router =express.Router()

router.post('/AllGroupBlood', bloodSearchFunc);
router.post('/bloodRequestPost',authMiddleware,bloodRequestPost);
router.get('/SeeAllbloodRequestPost',authMiddleware,SeeAllbloodRequestPost);
router.post('/donorRequestForBlood',authMiddleware,donorRequestForBloodController);

export default router;
