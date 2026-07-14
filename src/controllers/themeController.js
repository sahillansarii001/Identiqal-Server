import themeService from '../services/themeService.js';

export const createOrUpdateTheme = async (req, res) => {
  try {
    const theme = await themeService.createOrUpdateTheme(req.user.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Theme saved successfully',
      data: theme,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getUserTheme = async (req, res) => {
  try {
    const theme = await themeService.getUserTheme(req.user.id);
    return res.status(200).json({
      success: true,
      message: 'Theme retrieved successfully',
      data: theme,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
