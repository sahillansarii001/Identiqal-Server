import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import Card from '../models/Card.js';
import Lead from '../models/Lead.js';
import Theme from '../models/Theme.js';
import Transaction from '../models/Transaction.js';
import PlatformSettings from '../models/PlatformSettings.js';
import Announcement from '../models/Announcement.js';
import CardTemplate from '../models/CardTemplate.js';

/**
 * @desc    Get platform-wide statistics for the admin dashboard
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrganizations = await Organization.countDocuments();
    const totalCards = await Card.countDocuments();
    const totalLeads = await Lead.countDocuments();

    // Get a simple growth chart data (mocked slightly for demo, showing users created per month for last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const usersGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const formattedGrowth = usersGrowth.map(item => ({
      name: `${item._id.month}/${item._id.year}`,
      users: item.count,
    }));

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalOrganizations,
        totalCards,
        totalLeads,
        usersGrowth: formattedGrowth,
      },
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Get all users (paginated)
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({})
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments();

    return res.status(200).json({
      success: true,
      data: {
        users,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error in getUsers:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Get all organizations (paginated)
 * @route   GET /api/admin/organizations
 * @access  Private/Admin
 */
export const getOrganizations = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const organizations = await Organization.find({})
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Organization.countDocuments();

    return res.status(200).json({
      success: true,
      data: {
        organizations,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error in getOrganizations:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Get all themes
 * @route   GET /api/admin/themes
 * @access  Private/Admin
 */
export const getThemes = async (req, res) => {
  try {
    const themes = await Theme.find({}).sort({ createdAt: -1 }).lean();
    return res.status(200).json({
      success: true,
      data: themes,
    });
  } catch (error) {
    console.error('Error in getThemes:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Create a new global theme
 * @route   POST /api/admin/themes
 * @access  Private/Admin
 */
export const createTheme = async (req, res) => {
  try {
    const { name, status, colors, font, layoutStyle, buttonStyle, isPremium } = req.body;
    
    const newTheme = new Theme({
      ownerId: req.user.id,
      name: name || 'Untitled Theme',
      status: status || 'draft',
      colors: colors || undefined,
      font: font || undefined,
      layoutStyle: layoutStyle || 'minimal',
      buttonStyle: buttonStyle || 'rounded',
      isLockedByOrg: false,
      isPremium: isPremium || false,
    });

    await newTheme.save();
    return res.status(201).json({ success: true, data: newTheme });
  } catch (error) {
    console.error('Error in createTheme:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Update a theme
 * @route   PUT /api/admin/themes/:id
 * @access  Private/Admin
 */
export const updateTheme = async (req, res) => {
  try {
    const { name, status, colors, font, layoutStyle, buttonStyle, isLockedByOrg, isPremium } = req.body;
    
    const theme = await Theme.findById(req.params.id);
    if (!theme) {
      return res.status(404).json({ success: false, message: 'Theme not found' });
    }

    if (name !== undefined) theme.name = name;
    if (status !== undefined) theme.status = status;
    if (colors !== undefined) theme.colors = { ...theme.colors, ...colors };
    if (font !== undefined) theme.font = { ...theme.font, ...font };
    if (layoutStyle !== undefined) theme.layoutStyle = layoutStyle;
    if (buttonStyle !== undefined) theme.buttonStyle = buttonStyle;
    if (isLockedByOrg !== undefined) theme.isLockedByOrg = isLockedByOrg;
    if (isPremium !== undefined) theme.isPremium = isPremium;

    await theme.save();
    return res.status(200).json({ success: true, data: theme });
  } catch (error) {
    console.error('Error in updateTheme:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Delete a theme
 * @route   DELETE /api/admin/themes/:id
 * @access  Private/Admin
 */
export const deleteTheme = async (req, res) => {
  try {
    const theme = await Theme.findByIdAndDelete(req.params.id);
    if (!theme) {
      return res.status(404).json({ success: false, message: 'Theme not found' });
    }
    return res.status(200).json({ success: true, message: 'Theme deleted' });
  } catch (error) {
    console.error('Error in deleteTheme:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Update a user's role or status
 * @route   PUT /api/admin/users/:id
 * @access  Private/Admin
 */
export const updateUserStatus = async (req, res) => {
  try {
    const { name, email, role, isVerified, subscriptionTier } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (typeof isVerified === 'boolean') user.isVerified = isVerified;
    if (subscriptionTier) user.subscriptionTier = subscriptionTier;

    await user.save();
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Error in updateUserStatus:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Delete a user completely
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Delete associated cards and leads
    const userCards = await Card.find({ userId: user._id });
    const cardIds = userCards.map(c => c._id);
    await Lead.deleteMany({ cardId: { $in: cardIds } });
    await Card.deleteMany({ userId: user._id });
    
    await User.findByIdAndDelete(req.params.id);

    return res.status(200).json({ success: true, message: 'User and all associated data deleted' });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Get advanced timeseries analytics
 * @route   GET /api/admin/analytics/timeseries
 * @access  Private/Admin
 */
export const getAdvancedAnalytics = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const usersGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    const cardsGrowth = await Card.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        usersGrowth,
        cardsGrowth
      },
    });
  } catch (error) {
    console.error('Error in getAdvancedAnalytics:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Get all transactions (mocked for now, assumes Transaction model exists and is populated via webhooks)
 * @route   GET /api/admin/transactions
 * @access  Private/Admin
 */
export const getTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({})
      .populate('userId', 'name email')
      .populate('organizationId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Transaction.countDocuments();

    return res.status(200).json({
      success: true,
      data: {
        transactions,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error in getTransactions:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Get Platform Settings
 * @route   GET /api/admin/settings
 * @access  Private/Admin
 */
export const getSettings = async (req, res) => {
  try {
    let settings = await PlatformSettings.findOne();
    if (!settings) {
      settings = await PlatformSettings.create({});
    }
    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error('Error in getSettings:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Update Platform Settings
 * @route   PUT /api/admin/settings
 * @access  Private/Admin
 */
export const updateSettings = async (req, res) => {
  try {
    let settings = await PlatformSettings.findOne();
    if (!settings) {
      settings = new PlatformSettings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error('Error in updateSettings:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Get all announcements
 * @route   GET /api/admin/announcements
 * @access  Private/Admin
 */
export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({}).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, data: announcements });
  } catch (error) {
    console.error('Error in getAnnouncements:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Create an announcement
 * @route   POST /api/admin/announcements
 * @access  Private/Admin
 */
export const createAnnouncement = async (req, res) => {
  try {
    const newAnnouncement = new Announcement(req.body);
    await newAnnouncement.save();
    return res.status(201).json({ success: true, data: newAnnouncement });
  } catch (error) {
    console.error('Error in createAnnouncement:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Get all card templates
 * @route   GET /api/admin/card-templates
 * @access  Private/Admin
 */
export const getCardTemplates = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const templates = await CardTemplate.find(filter)
      .populate('displayPresetId', 'name headerStyle headerHeight headerColor headerColorEnd gradient')
      .populate('colorThemeId', 'name primary secondary accent background text')
      .populate('footerPresetId', 'name style background ctaEnabled')
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ success: true, data: templates });
  } catch (error) {
    console.error('Error in getCardTemplates:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Create a card template
 * @route   POST /api/admin/card-templates
 * @access  Private/Admin
 */
export const createCardTemplate = async (req, res) => {
  try {
    const {
      name, category, description, badge, isPremium, status,
      displayPresetId, colorThemeId, footerPresetId,
      typography, profileSettings, spacing, animationStyle, sections,
    } = req.body;
    const template = new CardTemplate({
      name: name || 'Untitled Template',
      category: category || 'General',
      description: description || '',
      badge: badge || '',
      isPremium: isPremium || false,
      status: status || 'draft',
      displayPresetId: displayPresetId || null,
      colorThemeId: colorThemeId || null,
      footerPresetId: footerPresetId || null,
      typography: typography || undefined,
      profileSettings: profileSettings || undefined,
      spacing: spacing || undefined,
      animationStyle: animationStyle || 'Fade',
      sections: sections || [],
      createdBy: req.user.id,
    });
    await template.save();
    return res.status(201).json({ success: true, data: template });
  } catch (error) {
    console.error('Error in createCardTemplate:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Update a card template
 * @route   PUT /api/admin/card-templates/:id
 * @access  Private/Admin
 */
export const updateCardTemplate = async (req, res) => {
  try {
    const template = await CardTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    const allowed = [
      'name', 'category', 'description', 'badge', 'isPremium', 'status',
      'displayPresetId', 'colorThemeId', 'footerPresetId',
      'typography', 'profileSettings', 'spacing', 'animationStyle', 'sections',
    ];
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) template[key] = req.body[key];
    });
    await template.save();
    return res.status(200).json({ success: true, data: template });
  } catch (error) {
    console.error('Error in updateCardTemplate:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Delete a card template
 * @route   DELETE /api/admin/card-templates/:id
 * @access  Private/Admin
 */
export const deleteCardTemplate = async (req, res) => {
  try {
    const template = await CardTemplate.findByIdAndDelete(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    return res.status(200).json({ success: true, message: 'Template deleted' });
  } catch (error) {
    console.error('Error in deleteCardTemplate:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const duplicateCardTemplate = async (req, res) => {
  try {
    const original = await CardTemplate.findById(req.params.id).lean();
    if (!original) return res.status(404).json({ success: false, message: 'Template not found' });
    const { _id, createdAt, updatedAt, __v, usageCount, ...rest } = original;
    const copy = new CardTemplate({ ...rest, name: `${rest.name} (Copy)`, status: 'draft', createdBy: req.user.id });
    await copy.save();
    return res.status(201).json({ success: true, data: copy });
  } catch (error) {
    console.error('Error in duplicateCardTemplate:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Change a user's password as admin
 * @route   PUT /api/admin/users/:id/password
 * @access  Private/Admin
 */
export const changeUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error in changeUserPassword:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Create a new user directly as an admin
 * @route   POST /api/admin/users
 * @access  Private/Admin
 */
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      passwordHash,
      role: role || 'member',
      isVerified: true, // Created by admin, auto-verify
    });

    await newUser.save();

    const userData = newUser.toObject();
    delete userData.passwordHash;

    return res.status(201).json({ success: true, data: userData, message: 'User created successfully' });
  } catch (error) {
    console.error('Error in createUser:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Seed demo card templates for demonstration
 * @route   POST /api/admin/templates/seed
 * @access  Private/Admin
 */
export const seedDemoTemplates = async (req, res) => {
  try {
    const demoTemplates = [
      {
        name: 'Agate',
        category: 'Creative',
        description: 'Vibrant green wave design.',
        badge: '',
        isPremium: true,
        status: 'published',
        colors: { primary: '#000000', secondary: '#93FF00', background: '#0F2916', text: '#FFFFFF', accent: '#93FF00' },
        font: { family: 'Lora', heading: 'Lora', body: 'Inter' },
        buttonStyle: 'rounded',
      },
      {
        name: 'Air',
        category: 'Minimal',
        description: 'Clean, airy, white background.',
        badge: '',
        isPremium: false,
        status: 'published',
        colors: { primary: '#EAEAEA', secondary: '#FFFFFF', background: '#F5F5F5', text: '#111111', accent: '#FFFFFF' },
        font: { family: 'Inter', heading: 'Inter', body: 'Inter' },
        buttonStyle: 'rounded',
      },
      {
        name: 'Astrid',
        category: 'Developer',
        description: 'Dark, starry galaxy background.',
        badge: '',
        isPremium: true,
        status: 'published',
        colors: { primary: '#181518', secondary: '#333333', background: '#0F0F0F', text: '#FFFFFF', accent: '#FFFFFF' },
        font: { family: 'Outfit', heading: 'Outfit', body: 'Inter' },
        buttonStyle: 'rounded',
      },
      {
        name: 'Aura',
        category: 'Creative',
        description: 'Soft beige, natural vibe.',
        badge: '',
        isPremium: true,
        status: 'published',
        colors: { primary: '#DCD4CB', secondary: '#DCD4CB', background: '#EAE2D9', text: '#333333', accent: '#DCD4CB' },
        font: { family: 'Playfair Display', heading: 'Playfair Display', body: 'Inter' },
        buttonStyle: 'rounded',
      },
      {
        name: 'Bliss',
        category: 'Photography',
        description: 'Classic monochrome photography style.',
        badge: '',
        isPremium: true,
        status: 'published',
        colors: { primary: '#000000', secondary: '#EAEAEA', background: '#D9D9D9', text: '#111111', accent: '#EAEAEA' },
        font: { family: 'Lora', heading: 'Lora', body: 'Inter' },
        buttonStyle: 'rounded',
      },
      {
        name: 'Blocks',
        category: 'Developer',
        description: 'Vibrant purple and pink retro blocks.',
        badge: '',
        isPremium: true,
        status: 'published',
        colors: { primary: '#8B3DFF', secondary: '#FF57E9', background: '#8B3DFF', text: '#FFFFFF', accent: '#FF57E9' },
        font: { family: 'Space Mono', heading: 'Space Mono', body: 'Space Mono' },
        buttonStyle: 'square',
      },
      {
        name: 'Bloom',
        category: 'Creative',
        description: 'Warm gradient sunrise.',
        badge: '',
        isPremium: true,
        status: 'published',
        colors: { primary: '#C84C55', secondary: '#453580', background: '#9D3F65', text: '#FFFFFF', accent: '#C84C55' },
        font: { family: 'Inter', heading: 'Inter', body: 'Inter' },
        buttonStyle: 'outline',
      },
    ];

    // Optional: clear existing templates if desired, but we will just insert new ones here.
    const inserted = await CardTemplate.insertMany(demoTemplates);

    return res.status(201).json({ success: true, data: inserted, message: 'Demo templates seeded successfully' });
  } catch (error) {
    console.error('Error in seedDemoTemplates:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Seed demo themes for demonstration
 * @route   POST /api/admin/themes/seed
 * @access  Private/Admin
 */
export const seedDemoThemes = async (req, res) => {
  try {
    const demoThemes = [
      {
        ownerId: req.user.id,
        name: 'Agate',
        isPremium: true,
        status: 'published',
        colors: { primary: '#000000', secondary: '#93FF00', background: '#0F2916', text: '#FFFFFF', accent: '#93FF00' },
        font: { family: 'Lora', heading: 'Lora', body: 'Inter' },
        layoutStyle: 'creative',
        buttonStyle: 'rounded',
      },
      {
        ownerId: req.user.id,
        name: 'Air',
        isPremium: false,
        status: 'published',
        colors: { primary: '#EAEAEA', secondary: '#FFFFFF', background: '#F5F5F5', text: '#111111', accent: '#FFFFFF' },
        font: { family: 'Inter', heading: 'Inter', body: 'Inter' },
        layoutStyle: 'minimal',
        buttonStyle: 'rounded',
      },
      {
        ownerId: req.user.id,
        name: 'Astrid',
        isPremium: true,
        status: 'published',
        colors: { primary: '#181518', secondary: '#333333', background: '#0F0F0F', text: '#FFFFFF', accent: '#FFFFFF' },
        font: { family: 'Outfit', heading: 'Outfit', body: 'Inter' },
        layoutStyle: 'bold',
        buttonStyle: 'rounded',
      },
      {
        ownerId: req.user.id,
        name: 'Aura',
        isPremium: true,
        status: 'published',
        colors: { primary: '#DCD4CB', secondary: '#DCD4CB', background: '#EAE2D9', text: '#333333', accent: '#DCD4CB' },
        font: { family: 'Playfair Display', heading: 'Playfair Display', body: 'Inter' },
        layoutStyle: 'creative',
        buttonStyle: 'rounded',
      },
      {
        ownerId: req.user.id,
        name: 'Bliss',
        isPremium: true,
        status: 'published',
        colors: { primary: '#000000', secondary: '#EAEAEA', background: '#D9D9D9', text: '#111111', accent: '#EAEAEA' },
        font: { family: 'Lora', heading: 'Lora', body: 'Inter' },
        layoutStyle: 'minimal',
        buttonStyle: 'rounded',
      },
      {
        ownerId: req.user.id,
        name: 'Blocks',
        isPremium: true,
        status: 'published',
        colors: { primary: '#8B3DFF', secondary: '#FF57E9', background: '#8B3DFF', text: '#FFFFFF', accent: '#FF57E9' },
        font: { family: 'Space Mono', heading: 'Space Mono', body: 'Space Mono' },
        layoutStyle: 'bold',
        buttonStyle: 'square',
      },
      {
        ownerId: req.user.id,
        name: 'Bloom',
        isPremium: true,
        status: 'published',
        colors: { primary: '#C84C55', secondary: '#453580', background: '#9D3F65', text: '#FFFFFF', accent: '#C84C55' },
        font: { family: 'Inter', heading: 'Inter', body: 'Inter' },
        layoutStyle: 'creative',
        buttonStyle: 'outline',
      },
    ];

    const inserted = await Theme.insertMany(demoThemes);
    return res.status(201).json({ success: true, data: inserted, message: 'Demo themes seeded successfully' });
  } catch (error) {
    console.error('Error in seedDemoThemes:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};
