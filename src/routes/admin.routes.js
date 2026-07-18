import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import {
  getDashboardStats,
  getUsers,
  getOrganizations,
  getThemes,
  createTheme,
  updateTheme,
  deleteTheme,
  updateUserStatus,
  deleteUser,
  getAdvancedAnalytics,
  getTransactions,
  getSettings,
  updateSettings,
  getAnnouncements,
  createAnnouncement,
  getCardTemplates,
  createCardTemplate,
  updateCardTemplate,
  deleteCardTemplate,
} from '../controllers/adminController.js';

const router = express.Router();

// All admin routes are protected and restricted to 'admin' and 'owner'
// Wait, typically an owner might be a platform owner or organization owner.
// Let's assume 'owner' in the global context is platform owner, or maybe 'admin' is the super role.
// The constants/roles.constants.js has OWNER, ADMIN, MEMBER.
router.use(protect);
router.use(authorize('admin', 'owner'));

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id', updateUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/organizations', getOrganizations);
router.get('/themes', getThemes);
router.post('/themes', createTheme);
router.put('/themes/:id', updateTheme);
router.delete('/themes/:id', deleteTheme);
router.get('/analytics/timeseries', getAdvancedAnalytics);
router.get('/transactions', getTransactions);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.get('/announcements', getAnnouncements);
router.post('/announcements', createAnnouncement);

// Card Templates
router.get('/card-templates', getCardTemplates);
router.post('/card-templates', createCardTemplate);
router.put('/card-templates/:id', updateCardTemplate);
router.delete('/card-templates/:id', deleteCardTemplate);

export default router;
