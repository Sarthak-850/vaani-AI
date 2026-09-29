import { VerificationStatus } from '@prisma/client';

export interface VerificationCheckParams {
  latitude: number;
  longitude: number;
  locationAccuracy: number;
  transcript: string;
  timestamp: string;
  previousVisits?: Array<{
    latitude: number;
    longitude: number;
    visitTime: Date;
    transcript: string;
  }>;
}

export interface VerificationOutput {
  status: VerificationStatus;
  riskScore: number; // 0 (safest) to 100 (highest anomaly score)
  reasons: string[];
  requiresReview: boolean;
}

export class VerificationService {
  // Haversine distance in kilometers
  private calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  public verifyVisit(params: VerificationCheckParams): VerificationOutput {
    let riskScore = 0;
    const reasons: string[] = [];

    // 1. Accuracy Check
    if (params.locationAccuracy > 100) {
      riskScore += 30;
      reasons.push(`Low GPS accuracy: ±${Math.round(params.locationAccuracy)}m`);
    } else if (params.locationAccuracy > 40) {
      riskScore += 10;
      reasons.push(`Moderate GPS accuracy: ±${Math.round(params.locationAccuracy)}m`);
    }

    // 2. Transcript Quality Check
    if (params.transcript.trim().length < 15) {
      riskScore += 25;
      reasons.push('Transcript is unusually brief (<15 characters)');
    }

    // 3. Historical Anomaly & Speed Verification
    if (params.previousVisits && params.previousVisits.length > 0) {
      const lastVisit = params.previousVisits[0];
      const currentTime = new Date(params.timestamp).getTime();
      const lastTime = new Date(lastVisit.visitTime).getTime();
      const timeDiffHours = (currentTime - lastTime) / (1000 * 60 * 60);

      // Same location / exact identical transcript duplicate
      if (
        params.transcript.toLowerCase().trim() ===
        lastVisit.transcript.toLowerCase().trim()
      ) {
        riskScore += 50;
        reasons.push('Duplicate transcript identical to recent previous visit');
      }

      // Travel Speed Check
      if (timeDiffHours > 0 && timeDiffHours < 2) {
        const distanceKm = this.calculateDistanceKm(
          params.latitude,
          params.longitude,
          lastVisit.latitude,
          lastVisit.longitude
        );
        const speedKmh = distanceKm / timeDiffHours;

        if (speedKmh > 100) {
          riskScore += 50;
          reasons.push(
            `Impossible travel speed between consecutive visits (${Math.round(speedKmh)} km/h)`
          );
        } else if (speedKmh > 60) {
          riskScore += 25;
          reasons.push(
            `High travel speed recorded between visits (${Math.round(speedKmh)} km/h)`
          );
        }
      }
    }

    // 4. Abnormal Working Hours Check (e.g. 11 PM to 4 AM)
    const hour = new Date(params.timestamp).getHours();
    if (hour >= 23 || hour <= 4) {
      riskScore += 15;
      reasons.push('Visit logged during unusual nighttime hours');
    }

    // Triage status determination
    let status: VerificationStatus = VerificationStatus.VERIFIED;
    if (riskScore >= 45) {
      status = VerificationStatus.SUSPICIOUS;
    } else if (riskScore >= 20) {
      status = VerificationStatus.WARNING;
    }

    if (reasons.length === 0) {
      reasons.push('GPS coordinates, travel trajectory, and clinical transcript verified');
    }

    return {
      status,
      riskScore,
      reasons,
      requiresReview: status !== VerificationStatus.VERIFIED
    };
  }
}

export const verificationService = new VerificationService();
