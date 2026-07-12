import { Request, Response } from 'express';
import { Meeting } from '../models/Meeting';

export const createMeeting = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, entrepreneurId, investorId, startTime, endTime, timezone } = req.body;

    if (!title || !entrepreneurId || !investorId || !startTime || !endTime) {
      res.status(400).json({ success: false, message: 'Please provide all required fields' });
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      res.status(400).json({ success: false, message: 'endTime must be after startTime' });
      return;
    }

    if (req.user?._id.toString() !== entrepreneurId && req.user?._id.toString() !== investorId) {
      res.status(403).json({ success: false, message: 'You must be a participant' });
      return;
    }

    if (entrepreneurId === investorId) {
      res.status(400).json({ success: false, message: 'User cannot schedule meeting with themselves' });
      return;
    }

    // Conflict detection
    const existingMeeting = await Meeting.findOne({
      participants: { $in: [entrepreneurId, investorId] },
      status: { $in: ['pending', 'accepted'] },
      startTime: { $lt: end },
      endTime: { $gt: start }
    });

    if (existingMeeting) {
      res.status(409).json({ success: false, message: 'Time conflict exists with an existing meeting' });
      return;
    }

    const meeting = await Meeting.create({
      title,
      description,
      entrepreneurId,
      investorId,
      requestedBy: req.user?._id,
      participants: [entrepreneurId, investorId],
      startTime: start,
      endTime: end,
      timezone: timezone || 'UTC',
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Meeting request created successfully',
      data: { meeting }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMeetings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, from, to } = req.query;

    const query: any = {
      participants: req.user?._id
    };

    if (status) query.status = status;
    
    if (from || to) {
      query.startTime = {};
      if (from) query.startTime.$gte = new Date(from as string);
      if (to) query.startTime.$lte = new Date(to as string);
    }

    const meetings = await Meeting.find(query).sort({ startTime: 1 });

    res.json({
      success: true,
      message: 'Meetings fetched successfully',
      data: { meetings }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMeetingCalendar = async (req: Request, res: Response): Promise<void> => {
  try {
    const meetings = await Meeting.find({ participants: req.user?._id });

    const events = meetings.map((m) => ({
      id: m._id,
      title: m.title,
      start: m.startTime,
      end: m.endTime,
      status: m.status,
      extendedProps: {
        entrepreneurId: m.entrepreneurId,
        investorId: m.investorId,
        requestedBy: m.requestedBy,
        description: m.description,
        meetingLink: m.meetingLink
      }
    }));

    res.json({
      success: true,
      data: { events }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMeetingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      res.status(404).json({ success: false, message: 'Meeting not found' });
      return;
    }

    if (!meeting.participants.includes(req.user?._id)) {
      res.status(403).json({ success: false, message: 'Not authorized to view this meeting' });
      return;
    }

    res.json({
      success: true,
      data: { meeting }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const acceptMeeting = async (req: Request, res: Response): Promise<void> => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      res.status(404).json({ success: false, message: 'Meeting not found' });
      return;
    }

    if (meeting.requestedBy.toString() === req.user?._id.toString()) {
      res.status(403).json({ success: false, message: 'You cannot accept your own request' });
      return;
    }

    if (!meeting.participants.includes(req.user?._id)) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    if (meeting.status !== 'pending') {
      res.status(400).json({ success: false, message: `Meeting is already ${meeting.status}` });
      return;
    }

    // Conflict detection
    const existingMeeting = await Meeting.findOne({
      _id: { $ne: meeting._id },
      participants: { $in: meeting.participants },
      status: { $in: ['pending', 'accepted'] },
      startTime: { $lt: meeting.endTime },
      endTime: { $gt: meeting.startTime }
    });

    if (existingMeeting) {
      res.status(409).json({ success: false, message: 'Time conflict exists with an existing meeting' });
      return;
    }

    meeting.status = 'accepted';
    await meeting.save();

    res.json({
      success: true,
      message: 'Meeting accepted successfully',
      data: { meeting }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectMeeting = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reason } = req.body;
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      res.status(404).json({ success: false, message: 'Meeting not found' });
      return;
    }

    if (!meeting.participants.includes(req.user?._id)) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    meeting.status = 'rejected';
    if (reason) meeting.rejectionReason = reason;
    await meeting.save();

    res.json({
      success: true,
      message: 'Meeting rejected successfully',
      data: { meeting }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelMeeting = async (req: Request, res: Response): Promise<void> => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      res.status(404).json({ success: false, message: 'Meeting not found' });
      return;
    }

    if (!meeting.participants.includes(req.user?._id)) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    meeting.status = 'cancelled';
    await meeting.save();

    res.json({
      success: true,
      message: 'Meeting cancelled successfully',
      data: { meeting }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const completeMeeting = async (req: Request, res: Response): Promise<void> => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      res.status(404).json({ success: false, message: 'Meeting not found' });
      return;
    }

    if (!meeting.participants.includes(req.user?._id)) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    meeting.status = 'completed';
    await meeting.save();

    res.json({
      success: true,
      message: 'Meeting marked as completed',
      data: { meeting }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
