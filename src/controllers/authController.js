import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateTokens.js';
import env from '../config/env.config.js';
import { sendOtpEmail } from '../services/emailService.js';
import PendingUser from '../models/PendingUser.js';

export const signup = async (req, res) => {
  try {
    const { email, password, name, username } = req.body;

    const emailLower = email.toLowerCase();
    const usernameLower = username ? username.toLowerCase() : undefined;

    let user = await User.findOne({ email: emailLower });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists',
      });
    }

    if (usernameLower) {
      const existingUser = await User.findOne({ username: usernameLower });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'This username is already taken',
        });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Generate 6-digit OTP
    const plainOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(plainOtp, salt);
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await PendingUser.findOneAndDelete({ email: emailLower });

    await PendingUser.create({
      email: emailLower,
      username: usernameLower,
      passwordHash,
      name: name || 'User',
      otp: otpHash,
      otpExpiresAt
    });

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
          username: user.username,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId,
          subscriptionTier: user.subscriptionTier,
          onboardingCompleted: user.onboardingCompleted,
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
          username: user.username,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId,
          subscriptionTier: user.subscriptionTier,
          onboardingCompleted: user.onboardingCompleted,
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

    const emailLower = email.toLowerCase();

    // First check if user is in PendingUser
    let pendingUser = await PendingUser.findOne({ email: emailLower });
    if (pendingUser) {
      if (pendingUser.otpExpiresAt < new Date()) {
        return res.status(400).json({ success: false, message: 'OTP expired' });
      }

      const isMatch = await bcrypt.compare(otp.toString(), pendingUser.otp);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid OTP' });
      }

      // Check username again to ensure it wasn't taken while pending
      if (pendingUser.username) {
         const existingUser = await User.findOne({ username: pendingUser.username });
         if (existingUser) {
            return res.status(400).json({ success: false, message: 'Username was taken by another user. Please sign up again.' });
         }
      }

      const newUser = await User.create({
        email: pendingUser.email,
        username: pendingUser.username,
        passwordHash: pendingUser.passwordHash,
        name: pendingUser.name,
        authProvider: 'local',
        role: 'member',
        isVerified: true,
      });

      await PendingUser.deleteOne({ _id: pendingUser._id });

      const accessToken = generateAccessToken(newUser);
      const refreshToken = await generateRefreshToken(newUser._id);

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
            id: newUser._id,
            email: newUser.email,
            username: newUser.username,
            name: newUser.name,
            role: newUser.role,
            organizationId: newUser.organizationId,
            subscriptionTier: newUser.subscriptionTier,
            onboardingCompleted: newUser.onboardingCompleted,
          },
        },
      });
    }

    // Fallback for older users stuck in unverified state in User collection
    const user = await User.findOne({ email: emailLower });
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
          username: user.username,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId,
          subscriptionTier: user.subscriptionTier,
          onboardingCompleted: user.onboardingCompleted,
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
