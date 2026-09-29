import { Severity, AlertStatus } from '@prisma/client';
import { StructuredClinicalData } from './gemini.service';

export interface AlertEvaluationParams {
  visitId: string;
  workerName: string;
  householdName: string;
  villageName: string;
  structuredData: StructuredClinicalData;
}

export interface GeneratedAlertData {
  visitId: string;
  severity: Severity;
  title: string;
  description: string;
  recommendedAction: string;
  status: AlertStatus;
}

export class AlertService {
  public evaluateClinicalRisk(params: AlertEvaluationParams): GeneratedAlertData | null {
    const { structuredData, visitId, householdName, villageName } = params;

    const sevUpper = structuredData.severity.toUpperCase() as Severity;

    if (sevUpper !== Severity.HIGH && sevUpper !== Severity.CRITICAL) {
      return null;
    }

    let title = 'Clinical Attention Required';
    let action = 'Qualified medical officer review recommended within 24 hours.';
    let description = `High risk indicators reported for ${structuredData.patientName || householdName} in ${villageName}. Symptoms: ${structuredData.symptoms.join(', ')}.`;

    if (structuredData.visitType === 'antenatal_care') {
      title = 'High-Risk Pregnancy (ANC) Alert';
      action = 'Urgent referral and medical officer examination for pre-eclampsia/obstetric risks. Note: Assistive triage only, requires clinical verification.';
      description = `ANC high-risk markers observed: ${structuredData.symptoms.join(', ')}. BP: ${structuredData.bloodPressure || 'Elevated'}.`;
    } else if (structuredData.visitType === 'malnutrition' || sevUpper === Severity.CRITICAL) {
      title = 'Critical Child Nutrition / Health Alert';
      action = 'Immediate evaluation at Nutrition Rehabilitation Centre (NRC) or Primary Health Centre.';
      description = `Severe clinical presentation recorded for ${structuredData.patientName || 'infant'}: ${structuredData.observations.join(', ')}.`;
    } else if (structuredData.visitType === 'communicable_disease') {
      title = 'Potential Communicable Disease Outbreak Alert';
      action = 'Initiate village water/sanitation inspection, issue prophylaxis, notify District Surveillance Officer.';
      description = `Multiple cases or acute symptoms reported: ${structuredData.symptoms.join(', ')}.`;
    }

    return {
      visitId,
      severity: sevUpper,
      title,
      description,
      recommendedAction: action,
      status: AlertStatus.OPEN
    };
  }
}

export const alertService = new AlertService();
