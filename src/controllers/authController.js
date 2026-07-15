import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateTokens.js';
import env from '../config/env.config.js';

export const signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      email,
      passwordHash,
      name,
      authProvider: 'local',
      role: 'member', // Default to member role
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user._id);

    // Set refresh token in HttpOnly secure cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days matching token default
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token: accessToken,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          subscriptionTier: user.subscriptionTier,
        },
      },
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
