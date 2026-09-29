import { EarningRecord, IncentiveRule, Visit } from '../types';
import { DEMO_INCENTIVE_RULES } from '../utils/demoData';

export class IncentiveAgent {
  /**
   * Calculates the earned incentive based on visit type, verification score, and escalation speed.
   */
  public calculateIncentive({
    visit,
    rules = DEMO_INCENTIVE_RULES
  }: {
    visit: Visit;
    rules?: IncentiveRule[];
  }): EarningRecord | null {
    if (visit.verificationStatus === 'suspicious') {
      // Hold incentive pending verification
      return null;
    }

    let taskType: EarningRecord['taskType'] = 'ROUTINE_VISIT';
    const category = visit.structuredData.visitType;

    if (category === 'antenatal_care' || category === 'postnatal_care') {
      taskType = 'ANC_PNC';
    } else if (category === 'immunization') {
      taskType = 'IMMUNIZATION';
    } else if (visit.structuredData.severity === 'high' || visit.structuredData.severity === 'critical') {
      taskType = 'HIGH_RISK_FOLLOWUP';
    }

    const matchedRule = rules.find((r) => r.taskType === taskType && r.active) || rules[0];

    const baseAmount = matchedRule ? matchedRule.baseAmount : 50;
    // Add bonus if GPS verification score is above 90%
    const bonus = (visit.verificationScore >= 90 && matchedRule) ? matchedRule.bonusAmount : 0;

    return {
      id: `earn-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      workerId: visit.workerId,
      visitId: visit.id,
      taskType,
      amount: baseAmount,
      bonus,
      status: 'CREDITED',
      description: `${matchedRule.title} for ${visit.householdName} (${visit.village}) - GPS Verified`,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };
  }
}

export const incentiveAgent = new IncentiveAgent();
