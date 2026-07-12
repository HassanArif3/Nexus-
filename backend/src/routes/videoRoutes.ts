import express from 'express';
import { validateVideoRoomAccess } from '../controllers/videoController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/rooms/:meetingId', protect, validateVideoRoomAccess);

export default router;
