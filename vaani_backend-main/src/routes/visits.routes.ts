import { Router } from 'express';
import { visitsController } from '../controllers/visits.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { logVisitSchema } from '../utils/validation';
import { authorizeRoles } from '../middleware/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.post('/', validateBody(logVisitSchema), visitsController.logVisit);
router.post('/extract-preview', visitsController.extractPreview);
router.get('/', visitsController.getVisits);
router.get('/:id', visitsController.getVisitById);
router.put('/:id', visitsController.updateVisit);
router.delete('/:id', authorizeRoles(Role.ADMIN), visitsController.deleteVisit);

router.get('/bhopal-visits', visitsController.getBhopalVisitLocations);
export default router;
