import { 
  Visit, 
  HealthAlert, 
  Household, 
  EarningRecord, 
  IncentiveRule, 
  OutbreakCluster, 
  NotificationItem, 
  AuditLog, 
  StructuredClinicalData,
  UserProfile,
  Patient
} from '../types';
import { 
  DEMO_VISITS, 
  DEMO_ALERTS, 
  DEMO_HOUSEHOLDS, 
  DEMO_EARNINGS, 
  DEMO_INCENTIVE_RULES, 
  DEMO_OUTBREAK_CLUSTERS, 
  DEMO_NOTIFICATIONS, 
  DEMO_AUDIT_LOGS,
  DEMO_USERS,
  DEMO_PATIENTS
} from '../utils/demoData';
import { aiExtractionService } from './aiExtraction';
import { verificationAgent } from './verificationAgent';
import { alertAgent } from './alertAgent';
import { incentiveAgent } from './incentiveAgent';
import { analyticsAgent } from './analyticsAgent';
import { api } from './api';

class DataStoreService {
  private visits: Visit[] = [];
  private alerts: HealthAlert[] = [];
  private households: Household[] = [];
  private earnings: EarningRecord[] = [];
  private incentiveRules: IncentiveRule[] = [];
  private outbreakClusters: OutbreakCluster[] = [];
  private notifications: NotificationItem[] = [];
  private auditLogs: AuditLog[] = [];
  private users: UserProfile[] = [];
  private patients: Patient[] = [];

  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadInitialData();
    this.fetchRemoteData();
    this.setupSocketListeners();
  }

  private loadInitialData() {
    if (typeof window === 'undefined') return;

    try {
      this.visits = this.loadFromStorage('intelliashe_visits', DEMO_VISITS);
      this.alerts = this.loadFromStorage('intelliashe_alerts', DEMO_ALERTS);
      this.households = this.loadFromStorage('intelliashe_households', DEMO_HOUSEHOLDS);
      this.earnings = this.loadFromStorage('intelliashe_earnings', DEMO_EARNINGS);
      this.incentiveRules = this.loadFromStorage('intelliashe_incentives', DEMO_INCENTIVE_RULES);
      this.outbreakClusters = this.loadFromStorage('intelliashe_clusters', DEMO_OUTBREAK_CLUSTERS);
      this.notifications = this.loadFromStorage('intelliashe_notifications', DEMO_NOTIFICATIONS);
      this.auditLogs = this.loadFromStorage('intelliashe_audit', DEMO_AUDIT_LOGS);
      this.users = this.loadFromStorage('intelliashe_users', DEMO_USERS);
      this.patients = this.loadFromStorage('intelliashe_patients', DEMO_PATIENTS);

      this.recalculateOutbreaks();
    } catch (e) {
      console.error('Failed to initialize local data cache:', e);
      this.resetToDemoData();
    }
  }

  private loadFromStorage<T>(key: string, fallback: T): T {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  private saveToStorage(key: string, data: any) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {
        console.warn(`Storage quota or error saving ${key}`, e);
      }
    }
  }

  // Fetch initial data from PostgreSQL Backend API
  private async fetchRemoteData() {
    try {
      const [visitsRes, alertsRes, householdsRes, incentivesRes, patientsRes] = await Promise.allSettled([
        api.getVisits({ limit: 100 }),
        api.getAlerts(),
        api.getHouseholds(),
        api.getIncentives(),
        api.getPatients()
      ]);

      if (visitsRes.status === 'fulfilled' && visitsRes.value?.visits?.length > 0) {
        this.visits = visitsRes.value.visits;
        this.saveToStorage('intelliashe_visits', this.visits);
        this.recalculateOutbreaks();
      }

      if (alertsRes.status === 'fulfilled' && alertsRes.value?.alerts?.length > 0) {
        this.alerts = alertsRes.value.alerts;
        this.saveToStorage('intelliashe_alerts', this.alerts);
      }

      if (householdsRes.status === 'fulfilled' && householdsRes.value?.households?.length > 0) {
        this.households = householdsRes.value.households;
        this.saveToStorage('intelliashe_households', this.households);
      }

      if (incentivesRes.status === 'fulfilled' && incentivesRes.value?.incentives?.length > 0) {
        this.earnings = incentivesRes.value.incentives;
        this.saveToStorage('intelliashe_earnings', this.earnings);
      }

      if (patientsRes.status === 'fulfilled' && patientsRes.value?.patients?.length > 0) {
        this.patients = patientsRes.value.patients;
        this.saveToStorage('intelliashe_patients', this.patients);
      }

      this.notify();
    } catch (e) {
      console.debug('Using cached/demo data while backend initializes:', e);
    }
  }

  // Real-Time Socket.IO event synchronization from Express + PostgreSQL
  private setupSocketListeners() {
    // New visit created in PostgreSQL
    api.on('visit:created', (newVisit: Visit) => {
      console.log('⚡ Real-time Socket.IO: New visit received', newVisit.id);
      const exists = this.visits.some((v) => v.id === newVisit.id);
      if (!exists) {
        this.visits.unshift(newVisit);
        this.saveToStorage('intelliashe_visits', this.visits);
        this.recalculateOutbreaks();
        this.notify();
      }
    });

    // New alert generated in PostgreSQL
    api.on('alert:created', (newAlert: HealthAlert) => {
      console.log('⚡ Real-time Socket.IO: New alert received', newAlert.id);
      const exists = this.alerts.some((a) => a.id === newAlert.id);
      if (!exists) {
        this.alerts.unshift(newAlert);
        this.saveToStorage('intelliashe_alerts', this.alerts);
        this.notify();
      }
    });

    // Alert status updated
    api.on('alert:updated', (updatedAlert: HealthAlert) => {
      this.alerts = this.alerts.map((a) => (a.id === updatedAlert.id ? updatedAlert : a));
      this.saveToStorage('intelliashe_alerts', this.alerts);
      this.notify();
    });

    // Real-time Notification
    api.on('notification:new', (notif: any) => {
      this.notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: 'all',
        title: notif.title || 'System Notification',
        message: notif.message || '',
        type: 'HIGH_RISK',
        read: false,
        createdAt: new Date().toISOString()
      });
      this.saveToStorage('intelliashe_notifications', this.notifications);
      this.notify();
    });
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // GETTERS
  public getVisits(): Visit[] {
    return [...this.visits].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public getAlerts(): HealthAlert[] {
    return [...this.alerts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getHouseholds(): Household[] {
    return [...this.households];
  }

  public getEarnings(workerId?: string): EarningRecord[] {
    const list = workerId ? this.earnings.filter((e) => e.workerId === workerId) : this.earnings;
    return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getIncentiveRules(): IncentiveRule[] {
    return [...this.incentiveRules];
  }

  public getOutbreakClusters(): OutbreakCluster[] {
    return [...this.outbreakClusters];
  }

  public getNotifications(userId?: string): NotificationItem[] {
    const list = userId ? this.notifications.filter((n) => n.userId === userId || n.userId === 'all') : this.notifications;
    return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getAuditLogs(): AuditLog[] {
    return [...this.auditLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public getUsers(): UserProfile[] {
    return [...this.users];
  }

  public getPatients(): Patient[] {
    return [...this.patients];
  }

  public async createPatient(data: {
    householdId: string;
    name: string;
    age?: number | null;
    gender?: string | null;
    patientCategory?: string | null;
  }): Promise<Patient> {
    try {
      const created = await api.createPatient(data);
      if (created) {
        this.patients.unshift(created);
        this.saveToStorage('intelliashe_patients', this.patients);
        this.notify();
        return created;
      }
    } catch (e) {
      console.warn('Backend patient creation failed, saving to local store:', e);
    }

    const localPatient: Patient = {
      id: `pat-${Date.now()}`,
      householdId: data.householdId,
      name: data.name,
      age: data.age,
      gender: data.gender,
      patientCategory: data.patientCategory,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.patients.unshift(localPatient);
    this.saveToStorage('intelliashe_patients', this.patients);
    this.notify();
    return localPatient;
  }

  // MASTER ACTION: Log a New Visit via PostgreSQL Backend API
  public async logVisit({
    worker,
    transcript,
    latitude,
    longitude,
    locationAccuracy,
    manualStructuredData,
    audioUrl
  }: {
    worker: UserProfile;
    transcript: string;
    latitude: number;
    longitude: number;
    locationAccuracy: number;
    manualStructuredData?: StructuredClinicalData;
    audioUrl?: string;
  }): Promise<{ visit: Visit; alert: HealthAlert | null; earning: EarningRecord | null }> {
    const nowIso = new Date().toISOString();

    // 1. Attempt PostgreSQL Backend API Transaction First
    try {
      const serverRes = await api.logVisit({
        transcript,
        latitude,
        longitude,
        locationAccuracy,
        manualStructuredData,
        audioUrl
      });

      if (serverRes?.visit) {
        const { visit, alert, earning } = serverRes;
        this.visits.unshift(visit);
        if (alert) this.alerts.unshift(alert);
        if (earning) this.earnings.unshift(earning);

        this.saveToStorage('intelliashe_visits', this.visits);
        this.saveToStorage('intelliashe_alerts', this.alerts);
        this.saveToStorage('intelliashe_earnings', this.earnings);
        this.recalculateOutbreaks();
        this.notify();

        return { visit, alert, earning };
      }
    } catch (apiError) {
      console.warn('Backend API submission failed or offline, processing in local fallback store:', apiError);
    }

    // 2. Resilient Offline Local Processing Fallback
    let structuredData: StructuredClinicalData;
    if (manualStructuredData) {
      structuredData = manualStructuredData;
    } else {
      structuredData = await aiExtractionService.extractStructuredVisit(transcript, {
        village: worker.village,
        householdHint: 'Sharma'
      });
    }

    const previousWorkerVisits = this.visits.filter((v) => v.workerId === worker.uid);
    const verification = verificationAgent.verifyVisit({
      latitude,
      longitude,
      locationAccuracy,
      transcript,
      timestamp: nowIso,
      previousVisits: previousWorkerVisits
    });

    const visitId = `visit-${Date.now()}`;
    const householdName = structuredData.householdName || 'Household';

    let household = this.households.find((h) => 
      h.village.toLowerCase() === worker.village.toLowerCase() &&
      h.familyName.toLowerCase().includes(householdName.toLowerCase().replace(' family', ''))
    );

    if (!household) {
      household = {
        id: `hh-${Date.now()}`,
        familyName: householdName,
        headOfFamily: structuredData.patientName || householdName,
        village: worker.village,
        district: worker.district,
        state: worker.state,
        membersCount: 4,
        hasPregnantMother: structuredData.visitType === 'antenatal_care',
        hasInfantsUnder5: structuredData.patientCategory === 'infant' || structuredData.patientCategory === 'child',
        address: `Ward Near Center, ${worker.village}`,
        latitude,
        longitude,
        lastVisitDate: nowIso,
        lastVisitSeverity: structuredData.severity
      };
      this.households.unshift(household);
      this.saveToStorage('intelliashe_households', this.households);
    }

    const newVisit: Visit = {
      id: visitId,
      workerId: worker.uid,
      workerName: worker.name,
      workerVillage: worker.village,
      householdId: household.id,
      householdName: household.familyName,
      village: worker.village,
      transcript,
      structuredData,
      latitude,
      longitude,
      locationAccuracy,
      timestamp: nowIso,
      severity: structuredData.severity,
      status: verification.status === 'suspicious' ? 'flagged' : 'active',
      verificationStatus: verification.status,
      verificationScore: verification.riskScore ? (100 - verification.riskScore) : 95,
      verificationReasons: verification.reasons,
      aiConfidence: structuredData.confidence || 0.92,
      followUpRequired: structuredData.followUpRequired,
      followUpDate: structuredData.followUpDate,
      followUpStatus: structuredData.followUpRequired ? 'pending' : 'none',
      audioUrl,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    this.visits.unshift(newVisit);
    this.saveToStorage('intelliashe_visits', this.visits);

    const newAlert = alertAgent.evaluateClinicalRisk({
      visitId: newVisit.id,
      workerId: worker.uid,
      workerName: worker.name,
      householdId: household.id,
      householdName: household.familyName,
      village: worker.village,
      structuredData
    });

    if (newAlert) {
      this.alerts.unshift(newAlert);
      this.saveToStorage('intelliashe_alerts', this.alerts);
    }

    const newEarning = incentiveAgent.calculateIncentive({
      visit: newVisit,
      rules: this.incentiveRules
    });

    if (newEarning) {
      this.earnings.unshift(newEarning);
      this.saveToStorage('intelliashe_earnings', this.earnings);
    }

    this.auditLogs.unshift({
      id: `log-${Date.now()}`,
      userId: worker.uid,
      userName: `${worker.name} (ASHA)`,
      action: 'LOG_VISIT_LOCAL_REACTIVE',
      resource: visitId,
      details: {
        severity: structuredData.severity,
        verificationStatus: verification.status,
        village: worker.village
      },
      timestamp: nowIso
    });
    this.saveToStorage('intelliashe_audit', this.auditLogs);

    this.recalculateOutbreaks();
    this.notify();

    return { visit: newVisit, alert: newAlert, earning: newEarning };
  }

  public recalculateOutbreaks() {
    const dynamicClusters = analyticsAgent.detectOutbreakClusters(this.visits);
    if (dynamicClusters.length > 0) {
      this.outbreakClusters = dynamicClusters;
    } else {
      this.outbreakClusters = DEMO_OUTBREAK_CLUSTERS;
    }
    this.saveToStorage('intelliashe_clusters', this.outbreakClusters);
  }

  public async updateAlert(alertId: string, updates: Partial<HealthAlert>, supervisorName?: string) {
    this.alerts = this.alerts.map((a) => {
      if (a.id === alertId) {
        return {
          ...a,
          ...updates,
          acknowledgedBy: supervisorName || a.acknowledgedBy,
          updatedAt: new Date().toISOString()
        };
      }
      return a;
    });
    this.saveToStorage('intelliashe_alerts', this.alerts);

    try {
      if (updates.status) {
        await api.updateAlertStatus(alertId, updates.status, updates.supervisorNotes);
      }
    } catch (e) {
      console.debug('Alert status updated locally; remote sync queued.');
    }

    this.notify();
  }

  public markNotificationAsRead(notifId: string) {
    this.notifications = this.notifications.map((n) => n.id === notifId ? { ...n, read: true } : n);
    this.saveToStorage('intelliashe_notifications', this.notifications);
    this.notify();
  }

  public updateIncentiveRules(rules: IncentiveRule[]) {
    this.incentiveRules = rules;
    this.saveToStorage('intelliashe_incentives', rules);
    this.notify();
  }

  public resetToDemoData() {
    this.visits = [...DEMO_VISITS];
    this.alerts = [...DEMO_ALERTS];
    this.households = [...DEMO_HOUSEHOLDS];
    this.earnings = [...DEMO_EARNINGS];
    this.incentiveRules = [...DEMO_INCENTIVE_RULES];
    this.outbreakClusters = [...DEMO_OUTBREAK_CLUSTERS];
    this.notifications = [...DEMO_NOTIFICATIONS];
    this.auditLogs = [...DEMO_AUDIT_LOGS];
    this.users = [...DEMO_USERS];
    this.patients = [...DEMO_PATIENTS];

    this.saveToStorage('intelliashe_visits', this.visits);
    this.saveToStorage('intelliashe_alerts', this.alerts);
    this.saveToStorage('intelliashe_households', this.households);
    this.saveToStorage('intelliashe_earnings', this.earnings);
    this.saveToStorage('intelliashe_incentives', this.incentiveRules);
    this.saveToStorage('intelliashe_clusters', this.outbreakClusters);
    this.saveToStorage('intelliashe_notifications', this.notifications);
    this.saveToStorage('intelliashe_audit', this.auditLogs);
    this.saveToStorage('intelliashe_users', this.users);
    this.saveToStorage('intelliashe_patients', this.patients);

    this.notify();
  }
}

export const dataStore = new DataStoreService();
