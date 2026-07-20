import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import * as presetController from '../controllers/presetController.js';

const router = express.Router();

// --- Display Presets ---
router.get('/display', presetController.getDisplayPresets);
router.get('/display/:id', presetController.getDisplayPresetById);

// Admin-only routes for Display Presets
router.post('/display', protect, authorize('admin'), presetController.createDisplayPreset);
router.put('/display/:id', protect, authorize('admin'), presetController.updateDisplayPreset);
router.delete('/display/:id', protect, authorize('admin'), presetController.deleteDisplayPreset);

// --- Color Themes ---
router.get('/colors', presetController.getColorThemes);
router.get('/colors/:id', presetController.getColorThemeById);

// Admin-only routes for Color Themes
router.post('/colors', protect, authorize('admin'), presetController.createColorTheme);
router.put('/colors/:id', protect, authorize('admin'), presetController.updateColorTheme);
router.delete('/colors/:id', protect, authorize('admin'), presetController.deleteColorTheme);

// --- Footer Presets ---
router.get('/footers', presetController.getFooterPresets);
router.get('/footers/:id', presetController.getFooterPresetById);

// Admin-only routes for Footer Presets
router.post('/footers', protect, authorize('admin'), presetController.createFooterPreset);
router.put('/footers/:id', protect, authorize('admin'), presetController.updateFooterPreset);
router.delete('/footers/:id', protect, authorize('admin'), presetController.deleteFooterPreset);

export default router;
