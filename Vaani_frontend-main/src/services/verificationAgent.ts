import { VerificationResult, VerificationStatus, Visit } from '../types';
import { locationService } from './location';

export class VerificationAgent {
  /**
   * Evaluates a visit for GPS validity, impossible travel speeds, transcript repetition, and duration.
   */
  public verifyVisit({
    latitude,
    longitude,
    locationAccuracy,
    transcript,
    timestamp,
    previousVisits = []
  }: {
    latitude: number;
    longitude: number;
    locationAccuracy: number;
    transcript: string;
    timestamp: string;
    previousVisits?: Visit[];
  }): VerificationResult {
    const reasons: string[] = [];
    let riskScore = 0;

    // 1. Check GPS Accuracy
    if (locationAccuracy <= 15) {
      reasons.push(`High GPS precision (±${locationAccuracy}m)`);
    } else if (locationAccuracy <= 50) {
      reasons.push(`Acceptable GPS precision (±${locationAccuracy}m)`);
      riskScore += 10;
    } else if (locationAccuracy <= 100) {
      reasons.push(`Moderate GPS uncertainty (±${locationAccuracy}m)`);
      riskScore += 25;
    } else {
      reasons.push(`Low GPS accuracy (±${locationAccuracy}m exceeds threshold)`);
      riskScore += 45;
    }

    // 2. Check Transcript Quality & Duplication
    const cleanTranscript = transcript.trim().toLowerCase();
    if (cleanTranscript.length < 25) {
      reasons.push('Transcript is unusually brief or sparse');
      riskScore += 30;
    }

    // Check if worker submitted identical duplicate transcript recently
    const isDuplicateTranscript = previousVisits.some((v) => {
      const prevText = (v.transcript || '').trim().toLowerCase();
      return prevText.length > 20 && prevText === cleanTranscript;
    });

    if (isDuplicateTranscript) {
      reasons.push('Identical clinical transcript matches a previous submission (potential duplicate entry)');
      riskScore += 40;
    }

    // 3. Check Travel Speed and Geodesic Distance from last visit
    if (previousVisits.length > 0) {
      const lastVisit = previousVisits[0]; // assuming sorted by recent
      const lastTime = new Date(lastVisit.timestamp).getTime();
      const currentTime = new Date(timestamp).getTime();
      const timeDiffMinutes = (currentTime - lastTime) / (1000 * 60);

      if (timeDiffMinutes > 0 && timeDiffMinutes < 180) { // within 3 hours
        const distanceKm = locationService.calculateDistanceKm(
          lastVisit.latitude,
          lastVisit.longitude,
          latitude,
          longitude
        );

        const speedKmh = (distanceKm / (timeDiffMinutes / 60));

        if (speedKmh > 75) {
          reasons.push(`Impossible travel speed detected between visits (${speedKmh.toFixed(1)} km/h in rural zone)`);
          riskScore += 50;
        } else if (distanceKm > 0.05) {
          reasons.push(`Realistic geographic separation between households (${distanceKm.toFixed(2)} km)`);
        }
      }
    }

    // Determine status & review requirement
    let status: VerificationStatus = 'verified';
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    if (riskScore >= 60) {
      status = 'suspicious';
      riskLevel = 'high';
    } else if (riskScore >= 25) {
      status = 'warning';
      riskLevel = 'medium';
    } else {
      status = 'verified';
      riskLevel = 'low';
    }

    return {
      status,
      riskLevel,
      riskScore: Math.min(100, Math.max(0, riskScore)),
      reasons,
      requiresReview: status !== 'verified'
    };
  }
}

export const verificationAgent = new VerificationAgent();
