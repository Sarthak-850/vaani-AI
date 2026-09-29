import { Router } from 'express';
import { householdsController } from '../controllers/households.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { createHouseholdSchema } from '../utils/validation';

const router = Router();

router.use(authenticate);

router.get('/', householdsController.getHouseholds);
router.post('/', validateBody(createHouseholdSchema), householdsController.createHousehold);
router.get('/:id', householdsController.getHouseholdById);
router.put('/:id', householdsController.updateHousehold);

export default router;
