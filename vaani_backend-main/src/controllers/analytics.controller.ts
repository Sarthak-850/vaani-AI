import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { analyticsService } from '../services/analytics.service';

export class AnalyticsController {
  public async getOverview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const overview = await analyticsService.getOverviewMetrics();
      res.status(200).json({ success: true, ...overview });
    } catch (err) {
      next(err);
    }
  }

  public async getVisitsAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getVisitsAnalytics();
      res.status(200).json({ success: true, ...data });
    } catch (err) {
      next(err);
    }
  }

  public async getHealthAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getHealthAnalytics();
      res.status(200).json({ success: true, ...data });
    } catch (err) {
      next(err);
    }
  }

  public async getWorkerPerformance(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workers = await analyticsService.getWorkerPerformance();
      res.status(200).json({ success: true, workers });
    } catch (err) {
      next(err);
    }
  }
}

export const analyticsController = new AnalyticsController();
