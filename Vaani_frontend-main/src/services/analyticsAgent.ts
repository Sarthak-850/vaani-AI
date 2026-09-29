import { OutbreakCluster, Visit } from '../types';

export class AnalyticsAgent {
  /**
   * Scans a set of visits across villages to detect syndromic disease clusters and spikes.
   */
  public detectOutbreakClusters(visits: Visit[]): OutbreakCluster[] {
    const clusters: OutbreakCluster[] = [];
    const villageSymptomMap: Record<string, Record<string, { count: number; visits: Visit[] }>> = {};

    // Group visits by village and symptom clusters
    visits.forEach((v) => {
      const village = v.village || 'Unknown Village';
      if (!villageSymptomMap[village]) {
        villageSymptomMap[village] = {};
      }

      const symptoms = v.structuredData.symptoms || [];
      symptoms.forEach((sym) => {
        let category = 'Other Symptoms';
        const s = sym.toLowerCase();
        if (s.includes('fever') || s.includes('temperature') || s.includes('pyrexia')) {
          category = 'Acute Febrile Illness / Fever Spike';
        } else if (s.includes('diarrhea') || s.includes('vomit') || s.includes('loose stool')) {
          category = 'Acute Gastrointestinal / Diarrheal Cluster';
        } else if (s.includes('cough') || s.includes('breath') || s.includes('cold')) {
          category = 'Acute Respiratory Syndrome';
        } else if (s.includes('rash') || s.includes('measles')) {
          category = 'Febrile Rash / Exanthem Cluster';
        }

        if (!villageSymptomMap[village][category]) {
          villageSymptomMap[village][category] = { count: 0, visits: [] };
        }
        villageSymptomMap[village][category].count += 1;
        villageSymptomMap[village][category].visits.push(v);
      });
    });

    // Detect clusters that exceed normal threshold
    Object.entries(villageSymptomMap).forEach(([village, catMap]) => {
      Object.entries(catMap).forEach(([category, data]) => {
        const baseline = 3.0; // standard weekly baseline per village
        if (data.count >= 4) {
          const ratio = data.count / baseline;
          const riskLevel = ratio > 3 ? 'HIGH' : ratio > 2 ? 'MEDIUM' : 'LOW';

          let recommendedAction = 'Routine epidemiological monitoring.';
          if (category.includes('Fever')) {
            recommendedAction = `Deploy anti-larval spray & fogging team to ${village}. Verify active dengue/malaria testing at local PHC.`;
          } else if (category.includes('Gastrointestinal') || category.includes('Diarrheal')) {
            recommendedAction = `Emergency chlorination of drinking water sources in ${village}. Distribute ORS/Zinc packets door-to-door.`;
          } else if (category.includes('Respiratory')) {
            recommendedAction = `Advise mask adherence, isolate symptomatic cases, and monitor pediatric oxygen saturation.`;
          }

          clusters.push({
            id: `cluster-${village.toLowerCase().replace(/\s+/g, '-')}-${category.toLowerCase().replace(/[^a-z]/g, '')}`,
            village,
            symptomCategory: category,
            currentCases: data.count,
            historicalBaseline: baseline,
            riskLevel,
            trend: data.count > 6 ? 'UPWARD' : 'STABLE',
            detectedAt: new Date().toISOString(),
            recommendedAction,
            affectedVisitsCount: data.count,
            status: 'ACTIVE_INVESTIGATION'
          });
        }
      });
    });

    return clusters;
  }
}

export const analyticsAgent = new AnalyticsAgent();
