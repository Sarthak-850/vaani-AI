import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class HouseholdsController {
  public async getHouseholds(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { villageId } = req.query as any;

      const households = await prisma.household.findMany({
        where: villageId ? { villageId } : undefined,
        include: {
          village: true,
          patients: true
        },
        orderBy: { familyName: 'asc' }
      });

      const formatted = households.map((h) => ({
        id: h.id,
        name: h.name,
        familyName: h.familyName,
        headOfFamily: h.headOfFamily,
        village: h.village.name,
        villageId: h.villageId,
        district: h.village.district,
        state: h.village.state,
        membersCount: h.membersCount,
        hasPregnantMother: h.hasPregnantMother,
        hasInfantsUnder5: h.hasInfantsUnder5,
        address: h.address,
        latitude: h.latitude,
        longitude: h.longitude,
        lastVisitDate: h.lastVisitDate?.toISOString() || null,
        lastVisitSeverity: h.lastVisitSeverity ? h.lastVisitSeverity.toLowerCase() : 'low',
        notes: h.notes,
        patientsCount: h.patients.length
      }));

      res.status(200).json({ success: true, households: formatted });
    } catch (err) {
      next(err);
    }
  }

  public async getHouseholdById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const household = await prisma.household.findUnique({
        where: { id },
        include: {
          village: true,
          patients: true,
          visits: { orderBy: { visitTime: 'desc' }, take: 10 }
        }
      });

      if (!household) {
        res.status(404).json({ success: false, message: 'Household not found', code: 'HOUSEHOLD_NOT_FOUND' });
        return;
      }

      res.status(200).json({ success: true, household });
    } catch (err) {
      next(err);
    }
  }

  public async createHousehold(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        name,
        familyName,
        headOfFamily,
        villageId,
        membersCount,
        hasPregnantMother,
        hasInfantsUnder5,
        address,
        latitude,
        longitude,
        notes
      } = req.body;

      const household = await prisma.household.create({
        data: {
          name,
          familyName,
          headOfFamily,
          villageId,
          membersCount: membersCount || 4,
          hasPregnantMother: Boolean(hasPregnantMother),
          hasInfantsUnder5: Boolean(hasInfantsUnder5),
          address,
          latitude,
          longitude,
          notes
        },
        include: { village: true }
      });

      res.status(201).json({ success: true, message: 'Household created', household });
    } catch (err) {
      next(err);
    }
  }

  public async updateHousehold(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updated = await prisma.household.update({
        where: { id },
        data: req.body,
        include: { village: true }
      });

      res.status(200).json({ success: true, message: 'Household updated', household: updated });
    } catch (err) {
      next(err);
    }
  }
}

export const householdsController = new HouseholdsController();
