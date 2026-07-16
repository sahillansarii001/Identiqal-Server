import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateTokens.js';
import env from '../config/env.config.js';
import { sendOtpEmail } from '../services/emailService.js';

export const signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      if (user.isVerified) {
        return res.status(400).json({
          success: false,
          message: 'A user with this email address already exists',
        });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Generate 6-digit OTP
    const plainOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(plainOtp, salt);
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    if (user && !user.isVerified) {
      user.passwordHash = passwordHash;
      user.name = name;
      user.otp = otpHash;
      user.otpExpiresAt = otpExpiresAt;
      await user.save();
    } else {
      user = await User.create({
        email,
        passwordHash,
        name,
        authProvider: 'local',
        role: 'member',
        isVerified: false,
        otp: otpHash,
        otpExpiresAt
      });
    }

    // Send OTP email
    await sendOtpEmail(email, plainOtp);

    return res.status(201).json({
      success: true,
      message: 'OTP sent to email. Please verify to complete registration.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in.',
        requiresVerification: true,
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user._id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token: accessToken,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId,
          subscriptionTier: user.subscriptionTier,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token missing',
      });
    }

    // Verify token exists in database
    const tokenDoc = await RefreshToken.findOne({ token });
    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
      if (tokenDoc) {
        await RefreshToken.deleteOne({ _id: tokenDoc._id });
      }
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired or invalid',
      });
    }

    // Decode and verify
    let decoded;
    try {
      decoded = jwt.verify(token, env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token invalid',
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User associated with refresh token not found',
      });
    }

    const newAccessToken = generateAccessToken(user);

    return res.status(200).json({
      success: true,
      message: 'Access token refreshed successfully',
      data: {
        token: newAccessToken,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId,
          subscriptionTier: user.subscriptionTier,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      await RefreshToken.deleteOne({ token });
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'User is already verified' });
    }

    if (!user.otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP expired or invalid' });
    }

    const isMatch = await bcrypt.compare(otp.toString(), user.otp);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user._id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: {
        token: accessToken,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId,
          subscriptionTier: user.subscriptionTier,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return res.status(200).json({ success: true, message: 'If an account exists, an OTP has been sent.' });
    }

    const plainOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(plainOtp, salt);
    
    user.otp = otpHash;
    user.otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    await sendOtpEmail(email, plainOtp);

    return res.status(200).json({ success: true, message: 'If an account exists, an OTP has been sent.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid request' });
    }

    if (!user.otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP expired or invalid' });
    }

    const isMatch = await bcrypt.compare(otp.toString(), user.otp);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.otp = null;
    user.otpExpiresAt = null;
    // ensure user is verified since they successfully used an OTP for reset
    user.isVerified = true; 
    await user.save();

    return res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
