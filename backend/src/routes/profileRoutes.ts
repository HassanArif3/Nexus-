import express from 'express';
import { getMyProfile, updateMyProfile, getPublicUserProfile } from '../controllers/profileController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/me')
  .get(protect, getMyProfile)
  .put(protect, updateMyProfile);

router.get('/users/:id', getPublicUserProfile);

export default router;
