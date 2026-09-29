import { HealthAlert, StructuredClinicalData, AlertSeverity } from '../types';

export class AlertAgent {
  /**
   * Evaluates structured visit data and creates an assistive health alert if high risk.
   */
  public evaluateClinicalRisk({
    visitId,
    workerId,
    workerName,
    householdId,
    householdName,
    village,
    structuredData
  }: {
    visitId: string;
    workerId: string;
    workerName: string;
    householdId: string;
    householdName: string;
    village: string;
    structuredData: StructuredClinicalData;
  }): HealthAlert | null {
    const { severity, visitType, symptoms, patientName, patientCategory, pregnancyDetails, referralFacility } = structuredData;

    if (severity === 'low') {
      return null;
    }

    let alertSeverity: AlertSeverity = 'MEDIUM';
    let title = `Health Attention Required: ${householdName}`;
    let description = `Symptoms reported: ${symptoms.join(', ')}.`;
    let recommendedAction = 'Follow up with patient and verify standard community treatment.';

    if (severity === 'critical') {
      alertSeverity = 'CRITICAL';
      if (visitType === 'malnutrition' || symptoms.includes('extreme weakness')) {
        title = `CRITICAL: Severe Acute Malnutrition / Wasting (${patientName || 'Child'})`;
        description = `${patientName || 'Child'} in ${village} presents with severe acute malnutrition indicators. High risk of decompensation.`;
        recommendedAction = `Immediate ambulance dispatch / emergency NRC referral to ${referralFacility || 'District Hospital NRC'}.`;
      } else {
        title = `CRITICAL: Emergency Condition Detected in ${village}`;
        description = `Patient ${patientName || ''} exhibits critical symptoms requiring urgent medical intervention.`;
        recommendedAction = `Emergency escort to nearest Secondary/Tertiary hospital immediately.`;
      }
    } else if (severity === 'high') {
      alertSeverity = 'HIGH';
      if (visitType === 'antenatal_care' || pregnancyDetails?.highRiskFlags?.length) {
        title = `HIGH RISK: Maternal Red Flags (${patientName || 'Mother'})`;
        description = `Pregnant mother presenting with ${symptoms.join(', ')} / elevated BP (${pregnancyDetails?.bloodPressure || 'high'}). Pre-eclampsia or obstetric risk suspected.`;
        recommendedAction = `Escort to CHC/PHC for Obstetric evaluation within 24 hours.`;
      } else if (visitType === 'child_health' && symptoms.includes('fever')) {
        title = `HIGH RISK: Severe Pediatric Illness (${patientName || 'Child'})`;
        description = `Child with high fever and danger signs (${symptoms.join(', ')}).`;
        recommendedAction = `Arrange transport to Primary Health Centre (PHC) for medical officer examination.`;
      } else {
        title = `HIGH RISK: Serious Symptoms in ${householdName}`;
        description = `Observed high severity condition with symptoms: ${symptoms.join(', ')}.`;
        recommendedAction = `Referral and physical medical review required at nearest health facility.`;
      }
    } else {
      // Medium severity
      alertSeverity = 'MEDIUM';
      title = `Moderate Risk: ${patientCategory || 'Patient'} in ${village}`;
      description = `Patient reported ${symptoms.join(', ')}. Monitoring advised.`;
      recommendedAction = `Scheduled home re-visit within 48 to 72 hours to verify resolution.`;
    }

    return {
      id: `alert-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      visitId,
      workerId,
      workerName,
      householdId,
      householdName,
      village,
      severity: alertSeverity,
      title,
      description,
      recommendedAction,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}

export const alertAgent = new AlertAgent();
