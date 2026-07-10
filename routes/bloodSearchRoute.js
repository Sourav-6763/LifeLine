import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { bloodSearchFunc, donorRequestForBloodController, getNearbyDonors } from '../controllers/bloodSearchController.js';
import {bloodRequestPost, donorAcceptRequest, getDonorRequestDataController, getReciverRequestDataController, SeeAllbloodRequestPost} from '../controllers/bloodRequestPost.js'

const router =express.Router()

router.post('/AllGroupBlood', bloodSearchFunc);
router.post('/bloodRequestPost',authMiddleware,bloodRequestPost);
router.get('/SeeAllbloodRequestPost',authMiddleware,SeeAllbloodRequestPost);
router.post('/donorRequestForBlood',authMiddleware,donorRequestForBloodController);
router.get('/getDonorRequestData',authMiddleware,getDonorRequestDataController);
router.post('/DonorAcceptRequest', authMiddleware, donorAcceptRequest);
router.get('/getReciverRequestData', authMiddleware, getReciverRequestDataController);
router.get('/nearby', getNearbyDonors);

export default router;
