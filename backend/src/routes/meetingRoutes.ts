import express from 'express';
import { 
  createMeeting, getMeetings, getMeetingCalendar, getMeetingById, 
  acceptMeeting, rejectMeeting, cancelMeeting, completeMeeting 
} from '../controllers/meetingController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createMeeting)
  .get(getMeetings);

router.get('/calendar', getMeetingCalendar);
router.get('/:id', getMeetingById);

router.patch('/:id/accept', acceptMeeting);
router.patch('/:id/reject', rejectMeeting);
router.patch('/:id/cancel', cancelMeeting);
router.patch('/:id/complete', completeMeeting);

export default router;
