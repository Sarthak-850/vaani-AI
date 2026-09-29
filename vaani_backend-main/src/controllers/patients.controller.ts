import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class PatientsController {
  public async getPatients(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { householdId } = req.query as any;

      const patients = await prisma.patient.findMany({
        where: householdId ? { householdId } : undefined,
        include: {
          household: { include: { village: true } }
        },
        orderBy: { name: 'asc' }
      });

      res.status(200).json({ success: true, patients });
    } catch (err) {
      next(err);
    }
  }

  public async getPatientById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const patient = await prisma.patient.findUnique({
        where: { id },
        include: {
          household: { include: { village: true } },
          healthRecords: { orderBy: { createdAt: 'desc' }, include: { visit: true } }
        }
      });

      if (!patient) {
        res.status(404).json({ success: false, message: 'Patient not found', code: 'PATIENT_NOT_FOUND' });
        return;
      }

      res.status(200).json({ success: true, patient });
    } catch (err) {
      next(err);
    }
  }

  public async createPatient(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { householdId, name, age, gender, patientCategory } = req.body;

      const patient = await prisma.patient.create({
        data: {
          householdId,
          name,
          age: age ? parseFloat(age) : null,
          gender,
          patientCategory
        },
        include: { household: true }
      });

      res.status(201).json({ success: true, message: 'Patient created', patient });
    } catch (err) {
      next(err);
    }
  }

  public async updatePatient(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updated = await prisma.patient.update({
        where: { id },
        data: req.body
      });

      res.status(200).json({ success: true, message: 'Patient updated', patient: updated });
    } catch (err) {
      next(err);
    }
  }
}

export const patientsController = new PatientsController();
