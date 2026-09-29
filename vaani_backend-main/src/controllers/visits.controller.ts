import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { visitService } from '../services/visit.service';
import { geminiService } from '../services/gemini.service';
import { emitEvent } from '../services/socket.service';
import { Role, Severity, VerificationStatus } from '@prisma/client';

export class VisitsController {
  public async logVisit(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { transcript, latitude, longitude, locationAccuracy, timestamp, audioUrl, manualStructuredData } = req.body;

      const result = await visitService.logVisitTransaction({
        userId: req.user!.userId,
        workerId: req.user!.workerId,
        transcript,
        latitude,
        longitude,
        locationAccuracy,
        timestamp,
        audioUrl,
        manualStructuredData
      });

      // Emit real-time Socket.IO events for DHO Dashboard and mobile listeners
      emitEvent('visit:created', result.visit);
      if (result.alert) {
        emitEvent('alert:created', result.alert);
      }
      emitEvent('notification:new', {
        title: `New Visit Logged: ${result.visit.workerName}`,
        message: `${result.visit.village} - ${result.visit.householdName}`
      });

      res.status(201).json({
        success: true,
        message: 'Visit logged and verified successfully with full transactional integrity',
        visit: result.visit,
        alert: result.alert,
        earning: result.incentive,
        followUp: result.followUp
      });
    } catch (err) {
      next(err);
    }
  }

  public async extractPreview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { transcript, village } = req.body;
      if (!transcript || transcript.trim().length === 0) {
        res.status(400).json({ success: false, message: 'Transcript required for extraction', code: 'EMPTY_TRANSCRIPT' });
        return;
      }

      const structured = await geminiService.extractStructuredVisit(transcript, {
        village: village || req.user?.villageId || 'Rural Centre',
        workerName: req.user?.name
      });

      res.status(200).json({
        success: true,
        structuredData: structured
      });
    } catch (err) {
      next(err);
    }
  }

  public async getVisits(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { severity, verificationStatus, village, workerId, limit = 100, page = 1 } = req.query as any;

      const whereClause: any = {};

      // If ASHA worker, limit to own visits unless query specifically permitted
      if (req.user?.role === Role.ASHA && req.user.workerId) {
        whereClause.ashaWorkerId = req.user.workerId;
      } else if (workerId) {
        whereClause.ashaWorkerId = workerId;
      }

      if (severity) {
        whereClause.severity = (severity as string).toUpperCase() as Severity;
      }
      if (verificationStatus) {
        whereClause.verificationStatus = (verificationStatus as string).toUpperCase() as VerificationStatus;
      }
      if (village) {
        whereClause.household = { village: { name: { contains: village as string, mode: 'insensitive' } } };
      }

      const take = Math.min(parseInt(limit, 10) || 100, 500);
      const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * take;

      const [visits, total] = await Promise.all([
        prisma.visit.findMany({
          where: whereClause,
          include: {
            ashaWorker: { include: { user: true, village: true } },
            household: { include: { village: true } }
          },
          orderBy: { visitTime: 'desc' },
          take,
          skip
        }),
        prisma.visit.count({ where: whereClause })
      ]);

      const formatted = visits.map((v) => ({
        id: v.id,
        workerId: v.ashaWorker.user.id,
        workerName: v.ashaWorker.user.name,
        workerVillage: v.ashaWorker.village.name,
        householdId: v.householdId,
        householdName: v.household.familyName,
        village: v.household.village.name,
        transcript: v.transcript,
        structuredData: v.structuredData,
        latitude: v.latitude,
        longitude: v.longitude,
        locationAccuracy: v.locationAccuracy,
        timestamp: v.visitTime.toISOString(),
        severity: v.severity.toLowerCase(),
        status: v.status,
        verificationStatus: v.verificationStatus.toLowerCase(),
        verificationScore: v.verificationScore,
        verificationReasons: v.verificationReasons,
        aiConfidence: v.aiConfidence,
        followUpRequired: v.followUpRequired,
        followUpDate: v.followUpDate?.toISOString() || null,
        followUpStatus: v.followUpStatus,
        audioUrl: v.audioUrl,
        createdAt: v.createdAt.toISOString(),
        updatedAt: v.updatedAt.toISOString()
      }));

      res.status(200).json({
        success: true,
        visits: formatted,
        pagination: {
          total,
          page: parseInt(page, 10) || 1,
          limit: take,
          totalPages: Math.ceil(total / take)
        }
      });
    } catch (err) {
      next(err);
    }
  }

  public async getVisitById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const visit = await prisma.visit.findUnique({
        where: { id },
        include: {
          ashaWorker: { include: { user: true, village: true } },
          household: { include: { village: true } },
          healthRecords: true,
          alerts: true,
          incentives: true,
          followUps: true
        }
      });

      if (!visit) {
        res.status(404).json({ success: false, message: 'Visit not found', code: 'VISIT_NOT_FOUND' });
        return;
      }

      res.status(200).json({ success: true, visit });
    } catch (err) {
      next(err);
    }
  }

  public async getBhopalVisitLocations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const bhopalVisits = await prisma.visit.findMany({
        where: {
          household: {
            village: {
              district: { equals: 'Bhopal' }
            }
          }
        },
        select: {
          latitude: true,
          longitude: true,
          severity: true,
          visitTime: true,
          household: {
            select: {
              village: {
                select: { name: true, district: true }
              }
            }
          }
        }
      });

      const formatted = bhopalVisits.map(v => ({
        latitude: v.latitude,
        longitude: v.longitude,
        severity: v.severity,
        visitTime: v.visitTime.toISOString(),
        village: v.household?.village?.name,
        district: v.household?.village?.district
      }));

      res.status(200).json({ success: true, visits: formatted });
    } catch (err) {
      next(err);
    }
  }

  public async updateVisit(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status, followUpStatus } = req.body;

      const updated = await prisma.visit.update({
        where: { id },
        data: {
          status,
          followUpStatus
        }
      });

      emitEvent('visit:updated', updated);

      res.status(200).json({ success: true, message: 'Visit updated', visit: updated });
    } catch (err) {
      next(err);
    }
  }

  public async deleteVisit(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.visit.delete({ where: { id } });
      res.status(200).json({ success: true, message: 'Visit deleted' });
    } catch (err) {
      next(err);
    }
  }
}

export const visitsController = new VisitsController();
