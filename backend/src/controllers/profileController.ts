import { Request, Response } from 'express';
import { Profile } from '../models/Profile';
import { User } from '../models/User';

export const getMyProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const profile = await Profile.findOne({ userId: req.user?._id });

    if (!profile) {
      res.status(404).json({ success: false, message: 'Profile not found' });
      return;
    }

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const updateMyProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    let profile = await Profile.findOne({ userId: req.user?._id });

    if (!profile) {
      res.status(404).json({ success: false, message: 'Profile not found' });
      return;
    }

    const {
      bio,
      location,
      phone,
      website,
      linkedin,
      skills,
      ...roleSpecificData
    } = req.body;

    // Update basic fields if provided
    if (bio !== undefined) profile.bio = bio;
    if (location !== undefined) profile.location = location;
    if (phone !== undefined) profile.phone = phone;
    if (website !== undefined) profile.website = website;
    if (linkedin !== undefined) profile.linkedin = linkedin;
    if (skills !== undefined) profile.skills = skills;

    // Update roleSpecificData
    if (Object.keys(roleSpecificData).length > 0) {
      profile.roleSpecificData = {
        ...profile.roleSpecificData,
        ...roleSpecificData,
      };
      
      // Mongoose requires marking mixed type as modified
      profile.markModified('roleSpecificData');
    }

    await profile.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: profile,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const getPublicUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash -isEmailVerified -isActive -createdAt -updatedAt');
    
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const profile = await Profile.findOne({ userId: user._id });

    res.json({
      success: true,
      data: {
        user,
        profile,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
