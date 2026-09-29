import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { AlertStatus, Severity } from '@prisma/client';
import { emitEvent } from '../services/socket.service';

export class AlertsController {
  public async getAlerts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, severity, village } = req.query as any;

      const whereClause: any = {};
      if (status) whereClause.status = status as AlertStatus;
      if (severity) whereClause.severity = severity as Severity;
      if (village) {
        whereClause.visit = {
          household: { village: { name: { contains: village as string, mode: 'insensitive' } } }
        };
      }

      const alerts = await prisma.alert.findMany({
        where: whereClause,
        include: {
          visit: {
            include: {
              ashaWorker: { include: { user: true, village: true } },
              household: { include: { village: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      const formatted = alerts.map((a) => ({
        id: a.id,
        visitId: a.visitId,
        workerId: a.visit.ashaWorker.user.id,
        workerName: a.visit.ashaWorker.user.name,
        householdId: a.visit.householdId,
        householdName: a.visit.household.familyName,
        village: a.visit.household.village.name,
        severity: a.severity,
        title: a.title,
        description: a.description,
        recommendedAction: a.recommendedAction,
        status: a.status,
        acknowledgedBy: a.acknowledgedBy,
        supervisorNotes: a.supervisorNotes,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString()
      }));

      res.status(200).json({ success: true, alerts: formatted });
    } catch (err) {
      next(err);
    }
  }

  public async getAlertById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const alert = await prisma.alert.findUnique({
        where: { id },
        include: {
          visit: {
            include: {
              ashaWorker: { include: { user: true, village: true } },
              household: { include: { village: true } },
              healthRecords: true
            }
          }
        }
      });

      if (!alert) {
        res.status(404).json({ success: false, message: 'Alert not found', code: 'ALERT_NOT_FOUND' });
        return;
      }

      res.status(200).json({ success: true, alert });
    } catch (err) {
      next(err);
    }
  }

  public async updateAlertStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status, supervisorNotes } = req.body;

      const updated = await prisma.alert.update({
        where: { id },
        data: {
          status: status as AlertStatus,
          supervisorNotes: supervisorNotes || undefined,
          acknowledgedBy: req.user?.name || undefined
        },
        include: {
          visit: {
            include: {
              ashaWorker: { include: { user: true } },
              household: { include: { village: true } }
            }
          }
        }
      });

      const formatted = {
        id: updated.id,
        visitId: updated.visitId,
        workerId: updated.visit.ashaWorker.user.id,
        workerName: updated.visit.ashaWorker.user.name,
        householdId: updated.visit.householdId,
        householdName: updated.visit.household.familyName,
        village: updated.visit.household.village.name,
        severity: updated.severity,
        title: updated.title,
        description: updated.description,
        recommendedAction: updated.recommendedAction,
        status: updated.status,
        acknowledgedBy: updated.acknowledgedBy,
        supervisorNotes: updated.supervisorNotes,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString()
      };

      emitEvent('alert:updated', formatted);

      res.status(200).json({ success: true, message: 'Alert status updated', alert: formatted });
    } catch (err) {
      next(err);
    }
  }
}

export const alertsController = new AlertsController();
