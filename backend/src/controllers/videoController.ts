import { Request, Response } from 'express';
import { Meeting } from '../models/Meeting';

export const validateVideoRoomAccess = async (req: Request, res: Response): Promise<void> => {
  try {
    const { meetingId } = req.params;
    const meeting = await Meeting.findById(meetingId);

    if (!meeting) {
      res.status(404).json({ success: false, message: 'Meeting not found' });
      return;
    }

    if (meeting.status !== 'accepted') {
      res.status(403).json({ success: false, message: 'Meeting is not accepted' });
      return;
    }

    if (!meeting.participants.includes(req.user?._id)) {
      res.status(403).json({ success: false, message: 'Not authorized to join this meeting room' });
      return;
    }

    res.json({
      success: true,
      message: 'Video room access granted',
      data: {
        roomId: meetingId,
        meeting
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
