import Theme from '../models/Theme.js';
import Organization from '../models/Organization.js';
import User from '../models/User.js';

class ThemeService {
  async createOrUpdateTheme(userId, themeData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user is a member of an organization with a locked theme
    if (user.organizationId && user.role === 'member') {
      const org = await Organization.findById(user.organizationId);
      if (org && org.lockedThemeId) {
        throw new Error('Styling is locked by your organization administrator');
      }
    }

    // Check if user already has an individual theme or we should update/create a new one
    // Each user has their own active theme
    let theme = await Theme.findOne({ ownerId: userId, organizationId: null });

    if (theme) {
      // Update theme
      theme.colors = { ...theme.colors, ...themeData.colors };
      theme.font = { ...theme.font, ...themeData.font };
      if (themeData.layoutStyle) theme.layoutStyle = themeData.layoutStyle;
      if (themeData.buttonStyle) theme.buttonStyle = themeData.buttonStyle;
      if (user.role === 'owner' && themeData.isLockedByOrg !== undefined) {
        theme.isLockedByOrg = themeData.isLockedByOrg;
      }
      await theme.save();
    } else {
      // Create new theme
      theme = await Theme.create({
        ownerId: userId,
        colors: themeData.colors,
        font: themeData.font,
        layoutStyle: themeData.layoutStyle,
        buttonStyle: themeData.buttonStyle,
        isLockedByOrg: user.role === 'owner' ? themeData.isLockedByOrg || false : false,
      });
    }

    return theme;
  }

  async getThemeById(themeId) {
    return await Theme.findById(themeId);
  }

  async getUserTheme(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // If member, check if organization locked theme exists and return it
    if (user.organizationId && user.role === 'member') {
      const org = await Organization.findById(user.organizationId).populate('lockedThemeId');
      if (org && org.lockedThemeId) {
        return org.lockedThemeId;
      }
    }

    // Find or create default individual theme
    let theme = await Theme.findOne({ ownerId: userId });
    if (!theme) {
      theme = await Theme.create({
        ownerId: userId,
        organizationId: user.organizationId || null,
      });
    }
    return theme;
  }
}

export default new ThemeService();
