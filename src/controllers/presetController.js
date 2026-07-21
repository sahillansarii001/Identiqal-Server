import DisplayPreset from '../models/DisplayPreset.js';
import ColorTheme from '../models/ColorTheme.js';
import FooterPreset from '../models/FooterPreset.js';

// --- Display Presets ---
export const getDisplayPresets = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const presets = await DisplayPreset.find(filter).sort({ createdAt: -1 });
    res.json(presets);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch display presets', error: error.message });
  }
};

export const getDisplayPresetById = async (req, res) => {
  try {
    const preset = await DisplayPreset.findById(req.params.id);
    if (!preset) return res.status(404).json({ message: 'Preset not found' });
    res.json(preset);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch preset', error: error.message });
  }
};

export const createDisplayPreset = async (req, res) => {
  try {
    const newPreset = new DisplayPreset({
      ...req.body,
      createdBy: req.user._id,
    });
    const saved = await newPreset.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create preset', error: error.message });
  }
};

export const updateDisplayPreset = async (req, res) => {
  try {
    const updated = await DisplayPreset.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'Preset not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update preset', error: error.message });
  }
};

export const deleteDisplayPreset = async (req, res) => {
  try {
    const deleted = await DisplayPreset.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Preset not found' });
    res.json({ message: 'Preset deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete preset', error: error.message });
  }
};

// --- Color Themes ---
export const getColorThemes = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const themes = await ColorTheme.find(filter).sort({ createdAt: -1 });
    res.json(themes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch color themes', error: error.message });
  }
};

export const getColorThemeById = async (req, res) => {
  try {
    const theme = await ColorTheme.findById(req.params.id);
    if (!theme) return res.status(404).json({ message: 'Theme not found' });
    res.json(theme);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch theme', error: error.message });
  }
};

export const createColorTheme = async (req, res) => {
  try {
    const newTheme = new ColorTheme({
      ...req.body,
      createdBy: req.user._id,
    });
    const saved = await newTheme.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create theme', error: error.message });
  }
};

export const updateColorTheme = async (req, res) => {
  try {
    const updated = await ColorTheme.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'Theme not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update theme', error: error.message });
  }
};

export const deleteColorTheme = async (req, res) => {
  try {
    const deleted = await ColorTheme.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Theme not found' });
    res.json({ message: 'Theme deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete theme', error: error.message });
  }
};

// --- Footer Presets ---
export const getFooterPresets = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const presets = await FooterPreset.find(filter).sort({ createdAt: -1 });
    res.json(presets);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch footer presets', error: error.message });
  }
};

export const getFooterPresetById = async (req, res) => {
  try {
    const preset = await FooterPreset.findById(req.params.id);
    if (!preset) return res.status(404).json({ message: 'Footer preset not found' });
    res.json(preset);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch footer preset', error: error.message });
  }
};

export const createFooterPreset = async (req, res) => {
  try {
    const newPreset = new FooterPreset({
      ...req.body,
      createdBy: req.user._id,
    });
    const saved = await newPreset.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create footer preset', error: error.message });
  }
};

export const updateFooterPreset = async (req, res) => {
  try {
    const updated = await FooterPreset.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'Footer preset not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update footer preset', error: error.message });
  }
};

export const deleteFooterPreset = async (req, res) => {
  try {
    const deleted = await FooterPreset.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Footer preset not found' });
    res.json({ message: 'Footer preset deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete footer preset', error: error.message });
  }
};

// --- Duplicate Handlers ---

export const duplicateDisplayPreset = async (req, res) => {
  try {
    const original = await DisplayPreset.findById(req.params.id).lean();
    if (!original) return res.status(404).json({ message: 'Preset not found' });
    const { _id, createdAt, updatedAt, __v, ...rest } = original;
    const copy = new DisplayPreset({ ...rest, name: `${rest.name} (Copy)`, status: 'draft', createdBy: req.user._id });
    const saved = await copy.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Failed to duplicate preset', error: error.message });
  }
};

export const duplicateColorTheme = async (req, res) => {
  try {
    const original = await ColorTheme.findById(req.params.id).lean();
    if (!original) return res.status(404).json({ message: 'Theme not found' });
    const { _id, createdAt, updatedAt, __v, ...rest } = original;
    const copy = new ColorTheme({ ...rest, name: `${rest.name} (Copy)`, status: 'draft', createdBy: req.user._id });
    const saved = await copy.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Failed to duplicate theme', error: error.message });
  }
};

export const duplicateFooterPreset = async (req, res) => {
  try {
    const original = await FooterPreset.findById(req.params.id).lean();
    if (!original) return res.status(404).json({ message: 'Footer preset not found' });
    const { _id, createdAt, updatedAt, __v, ...rest } = original;
    const copy = new FooterPreset({ ...rest, name: `${rest.name} (Copy)`, status: 'draft', createdBy: req.user._id });
    const saved = await copy.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Failed to duplicate footer preset', error: error.message });
  }
};

