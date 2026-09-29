// Location Verification & Geolocation Service

export interface GeoLocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number; // in meters
  altitude?: number | null;
  speed?: number | null;
  timestamp: number;
}

export class LocationService {
  /**
   * Captures the current GPS position with high accuracy
   */
  public async getCurrentPosition(): Promise<GeoLocationCoordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your device/browser.'));
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: Math.round(position.coords.accuracy),
            altitude: position.coords.altitude,
            speed: position.coords.speed,
            timestamp: position.timestamp
          });
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(new Error('Location access denied. Please allow GPS permissions to verify field visits.'));
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new Error('GPS location is currently unavailable. Please verify GPS is enabled.'));
              break;
            case error.TIMEOUT:
              reject(new Error('Location request timed out. Please try again with clear sky view.'));
              break;
            default:
              reject(new Error('Unable to retrieve location: ' + error.message));
          }
        },
        options
      );
    });
  }

  /**
   * Computes Haversine distance between two coordinates in kilometers
   */
  public calculateDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Evaluates location accuracy category
   */
  public getAccuracyQuality(accuracyMeters: number): {
    quality: 'excellent' | 'good' | 'fair' | 'poor';
    label: string;
    color: string;
  } {
    if (accuracyMeters <= 10) {
      return { quality: 'excellent', label: `Excellent (±${accuracyMeters}m)`, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    }
    if (accuracyMeters <= 25) {
      return { quality: 'good', label: `Good (±${accuracyMeters}m)`, color: 'text-teal-600 bg-teal-50 border-teal-200' };
    }
    if (accuracyMeters <= 50) {
      return { quality: 'fair', label: `Fair (±${accuracyMeters}m)`, color: 'text-amber-600 bg-amber-50 border-amber-200' };
    }
    return { quality: 'poor', label: `Low Accuracy (±${accuracyMeters}m)`, color: 'text-rose-600 bg-rose-50 border-rose-200' };
  }
}

export const locationService = new LocationService();
