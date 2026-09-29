import { Router } from 'express';
import { incentivesController } from '../controllers/incentives.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', incentivesController.getIncentives);
router.get('/workers/:id/incentives', incentivesController.getWorkerIncentives);

export default router;
