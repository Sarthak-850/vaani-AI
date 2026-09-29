import { prisma } from '../config/database';
import { Severity, AlertStatus } from '@prisma/client';

export class AnalyticsService {
  public async getOverviewMetrics() {
    const [
      totalVisits,
      totalAlerts,
      openAlerts,
      totalHouseholds,
      totalPatients,
      totalWorkers,
      totalIncentives
    ] = await Promise.all([
      prisma.visit.count(),
      prisma.alert.count(),
      prisma.alert.count({ where: { status: AlertStatus.OPEN } }),
      prisma.household.count(),
      prisma.patient.count(),
      prisma.aSHAWorker.count({ where: { active: true } }),
      prisma.incentive.aggregate({
        _sum: { amount: true, bonus: true }
      })
    ]);

    const totalDisbursed =
      (totalIncentives._sum.amount || 0) + (totalIncentives._sum.bonus || 0);

    // Calculate visits in the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentVisitsCount = await prisma.visit.count({
      where: { visitTime: { gte: sevenDaysAgo } }
    });

    // High risk visits count
    const highRiskVisits = await prisma.visit.count({
      where: {
        severity: { in: [Severity.HIGH, Severity.CRITICAL] }
      }
    });

    return {
      totalVisits,
      recentVisitsCount,
      highRiskVisits,
      totalAlerts,
      openAlerts,
      totalHouseholds,
      totalPatients,
      totalWorkers,
      totalIncentivesDisbursed: totalDisbursed
    };
  }

  public async getVisitsAnalytics() {
    // Severity breakdown
    const severityGroups = await prisma.visit.groupBy({
      by: ['severity'],
      _count: { id: true }
    });

    // Verification status breakdown
    const verificationGroups = await prisma.visit.groupBy({
      by: ['verificationStatus'],
      _count: { id: true }
    });

    // Last 14 days daily visit counts
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const recentVisits = await prisma.visit.findMany({
      where: { visitTime: { gte: fourteenDaysAgo } },
      select: { visitTime: true, severity: true }
    });

    const dailyMap: Record<string, { date: string; total: number; high: number; low: number }> = {};
    for (let i = 0; i < 14; i++) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split('T')[0];
      dailyMap[key] = { date: key, total: 0, high: 0, low: 0 };
    }

    recentVisits.forEach((v) => {
      const key = v.visitTime.toISOString().split('T')[0];
      if (dailyMap[key]) {
        dailyMap[key].total++;
        if (v.severity === Severity.HIGH || v.severity === Severity.CRITICAL) {
          dailyMap[key].high++;
        } else {
          dailyMap[key].low++;
        }
      }
    });

    const dailyTrends = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

    return {
      severityBreakdown: severityGroups.map((g) => ({
        severity: g.severity,
        count: g._count.id
      })),
      verificationBreakdown: verificationGroups.map((g) => ({
        status: g.verificationStatus,
        count: g._count.id
      })),
      dailyTrends
    };
  }

  public async getHealthAnalytics() {
    // Outbreak detection and cluster aggregation
    const highRiskVisits = await prisma.visit.findMany({
      where: {
        severity: { in: [Severity.HIGH, Severity.CRITICAL] }
      },
      include: {
        household: {
          include: { village: true }
        }
      },
      take: 200
    });

    // Group by village to compute disease hotspots
    const villageHotspots: Record<
      string,
      {
        village: string;
        district: string;
        latitude: number;
        longitude: number;
        casesCount: number;
        dominantSymptoms: Record<string, number>;
      }
    > = {};

    highRiskVisits.forEach((v) => {
      const vill = v.household.village;
      if (!villageHotspots[vill.id]) {
        villageHotspots[vill.id] = {
          village: vill.name,
          district: vill.district,
          latitude: vill.latitude,
          longitude: vill.longitude,
          casesCount: 0,
          dominantSymptoms: {}
        };
      }
      villageHotspots[vill.id].casesCount++;

      const sData = v.structuredData as any;
      if (sData?.symptoms && Array.isArray(sData.symptoms)) {
        sData.symptoms.forEach((sym: string) => {
          villageHotspots[vill.id].dominantSymptoms[sym] =
            (villageHotspots[vill.id].dominantSymptoms[sym] || 0) + 1;
        });
      }
    });

    const clusters = Object.values(villageHotspots).map((h) => ({
      village: h.village,
      district: h.district,
      latitude: h.latitude,
      longitude: h.longitude,
      casesCount: h.casesCount,
      status: h.casesCount >= 5 ? 'CRITICAL_CLUSTER' : 'ACTIVE_MONITORING',
      topSymptoms: Object.entries(h.dominantSymptoms)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([s]) => s)
    }));

    // Follow-ups completion rate
    const totalFollowUps = await prisma.followUp.count();
    const completedFollowUps = await prisma.followUp.count({ where: { status: 'completed' } });

    return {
      clusters,
      followUpStats: {
        total: totalFollowUps,
        completed: completedFollowUps,
        pending: totalFollowUps - completedFollowUps,
        completionRatePercent:
          totalFollowUps > 0 ? Math.round((completedFollowUps / totalFollowUps) * 100) : 100
      }
    };
  }

  public async getWorkerPerformance() {
    const workers = await prisma.aSHAWorker.findMany({
      include: {
        user: true,
        village: true,
        _count: {
          select: {
            visits: true,
            incentives: true
          }
        },
        incentives: {
          select: {
            amount: true,
            bonus: true
          }
        }
      }
    });

    return workers.map((w) => {
      const totalEarned = w.incentives.reduce((sum, inc) => sum + inc.amount + inc.bonus, 0);
      return {
        id: w.id,
        userId: w.userId,
        name: w.user.name,
        email: w.user.email,
        phone: w.user.phone,
        village: w.village.name,
        district: w.village.district,
        totalVisits: w._count.visits,
        totalEarned,
        active: w.active
      };
    });
  }
}

export const analyticsService = new AnalyticsService();
