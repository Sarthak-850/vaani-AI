import { prisma } from '../config/database';
import { Severity, VerificationStatus } from '@prisma/client';
import { geminiService, StructuredClinicalData } from './gemini.service';
import { verificationService } from './verification.service';
import { alertService } from './alert.service';
import { incentiveService } from './incentive.service';

export interface CreateVisitInput {
  userId: string;
  workerId?: string;
  transcript: string;
  latitude: number;
  longitude: number;
  locationAccuracy?: number;
  timestamp?: string;
  audioUrl?: string;
  manualStructuredData?: Partial<StructuredClinicalData>;
}

export class VisitService {
  public async logVisitTransaction(input: CreateVisitInput) {
    const {
      userId,
      transcript,
      latitude,
      longitude,
      locationAccuracy = 10,
      timestamp = new Date().toISOString(),
      audioUrl,
      manualStructuredData
    } = input;

    // 1. Fetch ASHA worker profile & village
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { ashaWorker: { include: { village: true } } }
    });

    if (!user) {
      throw new Error('Authenticated user record not found');
    }

    let worker = user.ashaWorker;
    if (!worker) {
      // If user is Admin/Supervisor logging a demo visit, find or assign default worker
      worker = await prisma.aSHAWorker.findFirst({
        include: { village: true }
      });
      if (!worker) {
        throw new Error('No active ASHA worker profile found for visit assignment');
      }
    }

    const workerVillage = worker.village;

    // 2. AI Structured Extraction
    let structuredData: StructuredClinicalData;
    if (manualStructuredData && manualStructuredData.visitType && manualStructuredData.severity) {
      structuredData = manualStructuredData as StructuredClinicalData;
    } else {
      structuredData = await geminiService.extractStructuredVisit(transcript, {
        village: workerVillage.name,
        workerName: user.name
      });
    }

    // 3. Multi-Agent Verification (GPS, duplicate, travel speed)
    const recentVisits = await prisma.visit.findMany({
      where: { ashaWorkerId: worker.id },
      orderBy: { visitTime: 'desc' },
      take: 5,
      select: {
        latitude: true,
        longitude: true,
        visitTime: true,
        transcript: true
      }
    });

    const verification = verificationService.verifyVisit({
      latitude,
      longitude,
      locationAccuracy,
      transcript,
      timestamp,
      previousVisits: recentVisits
    });

    // 4. Find or Create Household
    const householdFamilyName = structuredData.householdName || `${workerVillage.name} Family`;
    let household = await prisma.household.findFirst({
      where: {
        villageId: workerVillage.id,
        familyName: { contains: householdFamilyName.replace(' Family', '').trim(), mode: 'insensitive' }
      }
    });

    const now = new Date(timestamp);
    const severityEnum = structuredData.severity.toUpperCase() as Severity;

    if (!household) {
      household = await prisma.household.create({
        data: {
          name: `${householdFamilyName} Residence`,
          familyName: householdFamilyName,
          headOfFamily: structuredData.patientName || householdFamilyName,
          villageId: workerVillage.id,
          membersCount: 4,
          hasPregnantMother: structuredData.visitType === 'antenatal_care',
          hasInfantsUnder5:
            structuredData.patientCategory === 'infant' ||
            structuredData.patientCategory === 'child',
          address: `Ward Near Sub-Center, ${workerVillage.name}`,
          latitude,
          longitude,
          lastVisitDate: now,
          lastVisitSeverity: severityEnum,
          notes: 'Auto-registered during voice visit logging'
        }
      });
    } else {
      await prisma.household.update({
        where: { id: household.id },
        data: {
          lastVisitDate: now,
          lastVisitSeverity: severityEnum
        }
      });
    }

    // Find or create Patient
    let patient = null;
    if (structuredData.patientName) {
      patient = await prisma.patient.findFirst({
        where: {
          householdId: household.id,
          name: { contains: structuredData.patientName, mode: 'insensitive' }
        }
      });

      if (!patient) {
        patient = await prisma.patient.create({
          data: {
            householdId: household.id,
            name: structuredData.patientName,
            age: structuredData.age || 25,
            gender: structuredData.gender || 'female',
            patientCategory: structuredData.patientCategory || 'adult'
          }
        });
      }
    }

    // 5. Run Atomic Database Transaction (Visit + HealthRecord + Alert + Incentive + AuditLog + Notification)
    return await prisma.$transaction(async (tx) => {
      // 5a. Create Visit
      const visit = await tx.visit.create({
        data: {
          ashaWorkerId: worker!.id,
          householdId: household!.id,
          transcript,
          structuredData: structuredData as any,
          visitTime: now,
          latitude,
          longitude,
          locationAccuracy,
          severity: severityEnum,
          status: verification.status === VerificationStatus.SUSPICIOUS ? 'flagged' : 'active',
          verificationStatus: verification.status,
          verificationScore: 100 - verification.riskScore,
          verificationReasons: verification.reasons,
          aiConfidence: structuredData.confidence || 0.92,
          followUpRequired: structuredData.followUpRequired,
          followUpDate: structuredData.followUpDate ? new Date(structuredData.followUpDate) : null,
          followUpStatus: structuredData.followUpRequired ? 'pending' : 'none',
          audioUrl,
          createdAt: now,
          updatedAt: now
        }
      });

      // 5b. Create HealthRecord
      const healthRecord = await tx.healthRecord.create({
        data: {
          visitId: visit.id,
          patientId: patient?.id || null,
          weight: structuredData.weightKg || null,
          temperature: structuredData.temperatureC || null,
          bloodPressure: structuredData.bloodPressure || null,
          symptoms: structuredData.symptoms,
          observations: structuredData.observations,
          medications: structuredData.medicationsMentioned,
          riskLevel: severityEnum,
          followUpRequired: structuredData.followUpRequired,
          createdAt: now,
          updatedAt: now
        }
      });

      // 5c. Create Alert if High/Critical
      let alert = null;
      const alertData = alertService.evaluateClinicalRisk({
        visitId: visit.id,
        workerName: user.name,
        householdName: household!.familyName,
        villageName: workerVillage.name,
        structuredData
      });

      if (alertData) {
        alert = await tx.alert.create({
          data: {
            visitId: visit.id,
            severity: alertData.severity,
            title: alertData.title,
            description: alertData.description,
            recommendedAction: alertData.recommendedAction,
            status: alertData.status,
            createdAt: now,
            updatedAt: now
          }
        });

        // Create alert notification for supervisors
        await tx.notification.create({
          data: {
            userId: 'supervisor',
            title: `${alertData.severity} Alert: ${alertData.title}`,
            message: alertData.description,
            type: 'HIGH_RISK',
            link: '/alerts'
          }
        });
      }

      // 5d. Calculate & Create Incentive
      const calculatedIncentive = incentiveService.calculateIncentive({
        visitType: structuredData.visitType,
        severity: structuredData.severity,
        followUpRequired: structuredData.followUpRequired,
        workerId: worker!.id,
        visitId: visit.id
      });

      const incentive = await tx.incentive.create({
        data: {
          ashaWorkerId: worker!.id,
          visitId: visit.id,
          taskType: calculatedIncentive.taskType,
          amount: calculatedIncentive.amount,
          bonus: calculatedIncentive.bonus,
          status: calculatedIncentive.status,
          reason: calculatedIncentive.reason,
          createdAt: now,
          updatedAt: now
        }
      });

      // 5e. Create Worker Notification
      await tx.notification.create({
        data: {
          userId: user.id,
          title: `Incentive Credited: ₹${incentive.amount + incentive.bonus}`,
          message: incentive.reason,
          type: 'EARNING_CREDITED',
          link: '/earnings'
        }
      });

      // 5f. Create Follow-up if required
      let followUp = null;
      if (structuredData.followUpRequired) {
        followUp = await tx.followUp.create({
          data: {
            healthRecordId: healthRecord.id,
            visitId: visit.id,
            assignedToId: worker!.id,
            dueDate: structuredData.followUpDate
              ? new Date(structuredData.followUpDate)
              : new Date(now.getTime() + 48 * 3600 * 1000),
            status: 'pending',
            instructions: structuredData.followUpInstructions || 'Follow-up clinical assessment',
            createdAt: now,
            updatedAt: now
          }
        });
      }

      // 5g. Create Audit Log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          userName: `${user.name} (${user.role})`,
          action: 'LOG_VISIT_TRANSACTION',
          entity: 'Visit',
          entityId: visit.id,
          metadata: {
            severity: structuredData.severity,
            verificationStatus: verification.status,
            village: workerVillage.name,
            alertGenerated: Boolean(alert),
            incentiveEarned: incentive.amount + incentive.bonus
          }
        }
      });

      return {
        visit: {
          ...visit,
          workerName: user.name,
          workerVillage: workerVillage.name,
          householdName: household!.familyName,
          village: workerVillage.name
        },
        healthRecord,
        alert,
        incentive,
        followUp
      };
    });
  }
}

export const visitService = new VisitService();
