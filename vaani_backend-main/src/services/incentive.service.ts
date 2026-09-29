import { StructuredClinicalData } from './gemini.service';

export interface IncentiveCalculationParams {
  visitType: StructuredClinicalData['visitType'];
  severity: StructuredClinicalData['severity'];
  followUpRequired: boolean;
  workerId: string;
  visitId: string;
}

export interface CalculatedIncentive {
  ashaWorkerId: string;
  visitId: string;
  taskType: string;
  amount: number;
  bonus: number;
  status: string;
  reason: string;
}

export class IncentiveService {
  public calculateIncentive(params: IncentiveCalculationParams): CalculatedIncentive {
    const { visitType, severity, followUpRequired, workerId, visitId } = params;

    let taskType = 'ROUTINE_VISIT';
    let baseAmount = 50;
    let bonus = 0;
    let reason = 'Routine household health survey and vital monitoring';

    switch (visitType) {
      case 'antenatal_care':
      case 'postnatal_care':
        taskType = 'ANC_PNC';
        baseAmount = 150;
        bonus = severity === 'high' || severity === 'critical' ? 50 : 0;
        reason = 'Maternal health (ANC/PNC) monitoring & referral facilitation';
        break;

      case 'immunization':
        taskType = 'IMMUNIZATION';
        baseAmount = 100;
        bonus = 0;
        reason = 'Child immunization tracking, counseling, and session mobilization';
        break;

      case 'malnutrition':
        taskType = 'HIGH_RISK_FOLLOWUP';
        baseAmount = 100;
        bonus = 75;
        reason = 'Severe malnutrition screening, NRC referral, and dietary follow-up';
        break;

      case 'communicable_disease':
        taskType = 'OUTBREAK_REPORT';
        baseAmount = 150;
        bonus = 50;
        reason = 'Early epidemic signal reporting and community ORS/water disinfection';
        break;

      case 'child_health':
        taskType = 'CHILD_HEALTH';
        baseAmount = 75;
        bonus = followUpRequired ? 25 : 0;
        reason = 'Under-5 child illness assessment, ORS/Zinc provisioning';
        break;

      default:
        taskType = 'ROUTINE_VISIT';
        baseAmount = 50;
        bonus = 0;
        reason = 'Routine field health visit completed';
        break;
    }

    return {
      ashaWorkerId: workerId,
      visitId,
      taskType,
      amount: baseAmount,
      bonus,
      status: 'CREDITED',
      reason
    };
  }
}

export const incentiveService = new IncentiveService();
