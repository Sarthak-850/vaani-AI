import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/overview', analyticsController.getOverview);
router.get('/visits', analyticsController.getVisitsAnalytics);
router.get('/health', analyticsController.getHealthAnalytics);
router.get('/workers', analyticsController.getWorkerPerformance);

export default router;
