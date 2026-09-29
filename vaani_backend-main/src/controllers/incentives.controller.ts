import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

export class IncentivesController {
  public async getIncentives(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { workerId, status } = req.query as any;

      const whereClause: any = {};
      if (req.user?.role === Role.ASHA && req.user.workerId) {
        whereClause.ashaWorkerId = req.user.workerId;
      } else if (workerId) {
        whereClause.ashaWorkerId = workerId;
      }

      if (status) whereClause.status = status;

      const incentives = await prisma.incentive.findMany({
        where: whereClause,
        include: {
          ashaWorker: { include: { user: true, village: true } },
          visit: true
        },
        orderBy: { createdAt: 'desc' }
      });

      const formatted = incentives.map((inc) => ({
        id: inc.id,
        workerId: inc.ashaWorker.user.id,
        workerName: inc.ashaWorker.user.name,
        visitId: inc.visitId,
        taskType: inc.taskType,
        amount: inc.amount,
        bonus: inc.bonus,
        status: inc.status,
        description: inc.reason,
        date: inc.createdAt.toISOString().split('T')[0],
        createdAt: inc.createdAt.toISOString()
      }));

      const totalEarned = formatted.reduce((sum, item) => sum + item.amount + item.bonus, 0);

      res.status(200).json({ success: true, incentives: formatted, totalEarned });
    } catch (err) {
      next(err);
    }
  }

  public async getWorkerIncentives(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const incentives = await prisma.incentive.findMany({
        where: {
          OR: [{ ashaWorkerId: id }, { ashaWorker: { userId: id } }]
        },
        include: { ashaWorker: { include: { user: true, village: true } } },
        orderBy: { createdAt: 'desc' }
      });

      const formatted = incentives.map((inc) => ({
        id: inc.id,
        workerId: inc.ashaWorker.user.id,
        workerName: inc.ashaWorker.user.name,
        visitId: inc.visitId,
        taskType: inc.taskType,
        amount: inc.amount,
        bonus: inc.bonus,
        status: inc.status,
        description: inc.reason,
        date: inc.createdAt.toISOString().split('T')[0],
        createdAt: inc.createdAt.toISOString()
      }));

      const totalEarned = formatted.reduce((sum, item) => sum + item.amount + item.bonus, 0);

      res.status(200).json({ success: true, incentives: formatted, totalEarned });
    } catch (err) {
      next(err);
    }
  }
}

export const incentivesController = new IncentivesController();
