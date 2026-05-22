import { Router } from 'express';
import * as companyController from '../../controllers/company.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/rbac.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { singleUpload } from '../../middlewares/upload.middleware.js';
import {
  registerCompanySchema,
  updateCompanySchema,
} from '../../validators/company.validator.js';

const router = Router();

/**
 * Company Routes (all require authentication + employer role)
 *
 * POST /         — Register a new company
 * GET  /         — Get companies owned by current user
 * GET  /:id      — Get company by ID
 * PUT  /:id      — Update company details (with optional logo upload)
 */
router.post(
  '/',
  authenticate,
  authorize('employer'),
  validate(registerCompanySchema),
  companyController.registerCompany,
);

router.get(
  '/',
  authenticate,
  authorize('employer'),
  companyController.getCompany,
);

router.get(
  '/:id',
  authenticate,
  companyController.getCompanyById,
);

router.put(
  '/:id',
  authenticate,
  authorize('employer'),
  singleUpload,
  validate(updateCompanySchema),
  companyController.updateCompany,
);

export default router;
