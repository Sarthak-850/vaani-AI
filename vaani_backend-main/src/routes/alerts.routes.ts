import { Router } from 'express';
import { alertsController } from '../controllers/alerts.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { updateAlertStatusSchema } from '../utils/validation';

const router = Router();

router.use(authenticate);

router.get('/', alertsController.getAlerts);
router.get('/:id', alertsController.getAlertById);
router.put('/:id/status', validateBody(updateAlertStatusSchema), alertsController.updateAlertStatus);

export default router;
