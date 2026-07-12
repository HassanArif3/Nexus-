import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Profile } from '../models/Profile';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password || !role) {
      res.status(400).json({ success: false, message: 'Please provide all required fields' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
      return;
    }

    if (role !== 'entrepreneur' && role !== 'investor') {
      res.status(400).json({ success: false, message: 'Invalid role' });
      return;
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(409).json({ success: false, message: 'User already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName,
      email,
      passwordHash,
      role,
    });

    // Create an empty profile for the user
    await Profile.create({
      userId: user._id,
      roleSpecificData: {},
    });

    const token = generateToken(user._id as string);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      const token = generateToken(user._id as string);
      
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
          },
          token,
        },
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id).select('-passwordHash');
    const profile = await Profile.findOne({ userId: req.user?._id });

    if (user) {
      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
          },
          profile,
        },
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
