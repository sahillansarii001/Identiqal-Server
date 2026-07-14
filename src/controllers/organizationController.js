import Organization from '../models/Organization.js';
import User from '../models/User.js';
import Theme from '../models/Theme.js';
import mailService from '../services/mailService.js';
import { ROLES } from '../constants/roles.constants.js';

export const createOrganization = async (req, res) => {
  try {
    const { name, logoUrl } = req.body;
    const userId = req.user.id;

    // Check if user already owns or belongs to an organization
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.organizationId) {
      return res.status(400).json({
        success: false,
        message: 'User already belongs to an organization',
      });
    }

    // Create locked default theme for organization
    const orgTheme = await Theme.create({
      ownerId: userId,
      isLockedByOrg: true,
    });

    const org = await Organization.create({
      name,
      logoUrl,
      ownerId: userId,
      members: [{ userId, role: ROLES.OWNER, status: 'active' }],
      lockedThemeId: orgTheme._id,
      subscriptionTier: 'business', // Default for org workspace
      seatLimit: 10,
      seatsUsed: 1,
    });

    // Update user role to owner and attach organizationId
    user.role = ROLES.OWNER;
    user.organizationId = org._id;
    await user.save();

    // Link theme to organization
    orgTheme.organizationId = org._id;
    await orgTheme.save();

    return res.status(201).json({
      success: true,
      message: 'Organization created successfully',
      data: org,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const inviteMember = async (req, res) => {
  try {
    const { orgId } = req.params;
    const { email, role } = req.body;
    const userId = req.user.id; // Requester

    const org = await Organization.findById(orgId);
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    // Enforce owner check
    if (org.ownerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the organization owner can invite members',
      });
    }

    // Check seat limits
    if (org.seatsUsed >= org.seatLimit) {
      return res.status(400).json({
        success: false,
        message: 'Seat limit reached. Please upgrade your subscription tier.',
      });
    }

    // Check if user already exists
    let invitee = await User.findOne({ email });
    if (!invitee) {
      // Create a placeholder user
      invitee = await User.create({
        email,
        name: email.split('@')[0],
        passwordHash: 'invited_placeholder_no_password',
        role: role || ROLES.MEMBER,
        organizationId: org._id,
      });
    } else {
      // Check if user is already in this org or another org
      if (invitee.organizationId) {
        return res.status(400).json({
          success: false,
          message: 'User already belongs to an organization',
        });
      }
      invitee.organizationId = org._id;
      invitee.role = role || ROLES.MEMBER;
      await invitee.save();
    }

    // Add to members array if not already present
    const isMember = org.members.some(
      (m) => m.userId.toString() === invitee._id.toString()
    );

    if (!isMember) {
      org.members.push({
        userId: invitee._id,
        role: role || ROLES.MEMBER,
        status: 'invited',
      });
      org.seatsUsed += 1;
      await org.save();
    }

    // Send mock email
    const mockInviteLink = `http://localhost:5000/api/auth/accept-invite?token=${invitee._id}`;
    await mailService.sendInviteEmail(email, org.name, mockInviteLink);

    return res.status(200).json({
      success: true,
      message: 'Invitation sent successfully',
      data: {
        userId: invitee._id,
        email: invitee.email,
        status: 'invited',
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
