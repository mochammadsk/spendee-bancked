import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import UserOtp from '../models/userOtp';
import { otpForgotPassword, otpVerifyAccount } from '../services/mailService';
import { IUser } from '../types/userTypes';
import escapeRegExp from '../utils/escapeRegExp';
import { cooldownOtp, generateOtp, limitOtp } from '../utils/otp';
dotenv.config();

// Format user
const userData = (u: IUser) => ({
  id: u._id.toString(),
  email: u.email,
  full_name: u.full_name,
  user_name: u.user_name,
  verified: u.verified,
});

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, full_name, user_name, password } = req.body;
    if (!email || !full_name || !user_name || !password) {
      return res.status(400).json({ message: 'Fields are required' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const existingUserName = await User.findOne({ user_name });
    if (existingUserName) {
      return res.status(409).json({ message: 'Username already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      full_name,
      user_name,
      password: hashedPassword,
    });

    const { otp, otpHash, expiresAt } = await generateOtp();

    await UserOtp.deleteMany({ user_id: newUser._id });

    const newRecord = await UserOtp.create({
      user_id: newUser._id,
      otp: otpHash,
      expiresAt,
      purpose: 'Verify Account',
    });

    await otpVerifyAccount(email, otp);

    await newUser.save();

    return res.status(201).json({
      success: true,
      otp_sent: true,
      data: userData(newUser),
      info: {
        resend_count: newRecord.resend_count,
        expiresAt: newRecord.expiresAt,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// ======================= VERIFY OTP =======================

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { user_id, otp } = req.body;
    if (!user_id || !otp) {
      return res.status(400).json({ message: 'Fields are required' });
    }

    const record = await UserOtp.findOne({ user_id }).sort({ created_at: -1 });
    if (!record) return res.status(404).json({ message: 'OTP not found' });

    if (record.expiresAt < new Date()) {
      await UserOtp.deleteMany({ user_id });
      return res.status(400).json({ message: 'OTP has expired' });
    }

    const match = await bcrypt.compare(otp, record.otp);
    if (!match) {
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    await UserOtp.deleteMany({ user_id });
    await User.findByIdAndUpdate(user_id, { verified: true });

    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// ======================= RESEND OTP =======================

export const resendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.verified)
      return res.status(400).json({ message: 'User already verified' });

    const lastRecord = await UserOtp.findOne({ user_id: user._id }).sort({
      created_at: -1,
    });

    const cooldown = cooldownOtp(lastRecord ?? undefined, 60);
    if (cooldown) {
      return res.status(429).json({
        message: `Please wait ${cooldown.wait} seconds before requesting a new OTP`,
      });
    }

    const resendLimit = limitOtp(lastRecord ?? undefined, 3);
    if (resendLimit.limited) {
      return res.status(429).json({
        message: 'Maximum OTP resend attempts reached',
      });
    }

    const prevResendCount = resendLimit.count;

    const { otp, otpHash, expiresAt } = await generateOtp();
    await UserOtp.deleteMany({ user_id: user._id });

    const newRecord = await UserOtp.create({
      user_id: user._id,
      otp: otpHash,
      purpose: 'Verify Account',
      expiresAt,
      resend_count: prevResendCount + 1,
    });

    await otpVerifyAccount(email, otp);

    return res.status(200).json({
      success: true,
      info: {
        resend_count: newRecord.resend_count,
        expiresAt: newRecord.expiresAt,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// ======================= SIGNIN =======================

export const signin = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Fields are required' });
    }

    const safeIdentifier = escapeRegExp(identifier.trim());
    const query = {
      $or: [
        { email: new RegExp(`^${safeIdentifier}$`, 'i') },
        { user_name: new RegExp(`^${safeIdentifier}$`, 'i') },
      ],
    };

    const user: IUser | null = await User.findOne(query);
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.verified)
      return res.status(403).json({ message: 'Account not verified' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const payload = userData(user);

    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: '7d',
    });

    return res.status(200).json({ success: true, token, data: userData(user) });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// ======================= KEEP SIGNED IN =======================

export const keepSignedIn = async (
  req: Request & { user?: any },
  res: Response
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(req.user.id)
      .select('name user_name role email full_name verified')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res
      .status(200)
      .json({ success: true, data: userData(user as IUser) });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// ======================= FORGOT PASSWORD =======================

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({
      email: new RegExp(`^${email.trim()}$`, 'i'),
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const lastRecord = await UserOtp.findOne({
      user_id: user._id,
      purpose: 'Forgot Password',
    }).sort({ created_at: -1 });

    const cooldown = cooldownOtp(lastRecord ?? undefined, 60);
    if (cooldown) {
      return res.status(429).json({
        message: `Please wait ${cooldown.wait} seconds before requesting a new OTP`,
      });
    }

    const resendLimit = limitOtp(lastRecord ?? undefined, 3);
    if (resendLimit.limited) {
      return res.status(429).json({
        message: 'Maximum OTP resend attempts reached',
      });
    }

    const prevResendCount = resendLimit.count;

    const { otp, otpHash, expiresAt } = await generateOtp();

    await UserOtp.deleteMany({
      user_id: user._id,
      purpose: 'Forgot Password',
    });

    const newRecord = await UserOtp.create({
      user_id: user._id,
      otp: otpHash,
      expiresAt,
      resend_count: prevResendCount + 1,
      purpose: 'Forgot Password',
    });

    await otpForgotPassword(user.email, otp);

    return res.status(200).json({
      success: true,
      info: {
        resend_count: newRecord.resend_count,
        expiresAt: newRecord.expiresAt,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// ======================= RESET PASSWORD =======================

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, new_password } = req.body;

    if (!email || !otp || !new_password) {
      return res.status(400).json({ message: 'Fields are required' });
    }

    const user = await User.findOne({
      email: new RegExp(`^${email.trim()}$`, 'i'),
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const record = await UserOtp.findOne({
      user_id: user._id,
      purpose: 'Forgot Password',
    }).sort({ created_at: -1 });

    if (!record) return res.status(404).json({ message: 'OTP not found' });

    if (record.expiresAt < new Date()) {
      await UserOtp.deleteMany({
        user_id: user._id,
        purpose: 'Forgot Password',
      });
      return res.status(400).json({ message: 'OTP has expired' });
    }

    const match = await bcrypt.compare(otp, record.otp);
    if (!match) {
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await User.findByIdAndUpdate(user._id, { password: hashedPassword });

    await UserOtp.deleteMany({
      user_id: user._id,
      purpose: 'Forgot Password',
    });

    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// ======================= SIGNOUT =======================

export const signout = async (_req: Request, res: Response) => {
  try {
    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
