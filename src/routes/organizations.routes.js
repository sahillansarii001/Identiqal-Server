import express from 'express';
import { createOrganization, inviteMember } from '../controllers/organizationController.js';
import { createOrganizationSchema, inviteMemberSchema } from '../validators/organization.validator.js';
import validate from '../middleware/validate.middleware.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/', validate(createOrganizationSchema), createOrganization);
router.post('/:orgId/invite', validate(inviteMemberSchema), inviteMember);

export default router;
