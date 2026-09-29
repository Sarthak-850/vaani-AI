import { Router } from 'express';
import { followUpsController } from '../controllers/followups.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { createFollowUpSchema } from '../utils/validation';

const router = Router();

router.use(authenticate);

router.get('/', followUpsController.getFollowUps);
router.post('/', validateBody(createFollowUpSchema), followUpsController.createFollowUp);
router.put('/:id', followUpsController.updateFollowUp);

export default router;
