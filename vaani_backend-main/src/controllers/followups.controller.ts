import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

export class FollowUpsController {
  public async getFollowUps(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, workerId } = req.query as any;

      const whereClause: any = {};
      if (req.user?.role === Role.ASHA && req.user.workerId) {
        whereClause.assignedToId = req.user.workerId;
      } else if (workerId) {
        whereClause.assignedToId = workerId;
      }

      if (status) whereClause.status = status;

      const followUps = await prisma.followUp.findMany({
        where: whereClause,
        include: {
          assignedTo: { include: { user: true, village: true } },
          visit: {
            include: {
              household: { include: { village: true } }
            }
          },
          healthRecord: true
        },
        orderBy: { dueDate: 'asc' }
      });

      res.status(200).json({ success: true, followUps });
    } catch (err) {
      next(err);
    }
  }

  public async createFollowUp(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { visitId, healthRecordId, assignedToId, dueDate, instructions } = req.body;

      const followUp = await prisma.followUp.create({
        data: {
          visitId,
          healthRecordId,
          assignedToId: assignedToId || req.user?.workerId,
          dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 48 * 3600 * 1000),
          instructions,
          status: 'pending'
        }
      });

      res.status(201).json({ success: true, message: 'Follow-up created', followUp });
    } catch (err) {
      next(err);
    }
  }

  public async updateFollowUp(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status, instructions, completedAt } = req.body;

      const updated = await prisma.followUp.update({
        where: { id },
        data: {
          status,
          instructions,
          completedAt: status === 'completed' ? (completedAt ? new Date(completedAt) : new Date()) : null
        }
      });

      res.status(200).json({ success: true, message: 'Follow-up updated', followUp: updated });
    } catch (err) {
      next(err);
    }
  }
}

export const followUpsController = new FollowUpsController();
