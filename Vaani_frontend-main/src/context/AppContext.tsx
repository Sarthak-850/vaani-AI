import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  UserProfile, 
  UserRole, 
  Visit, 
  HealthAlert, 
  Household, 
  EarningRecord, 
  IncentiveRule, 
  OutbreakCluster, 
  NotificationItem, 
  AuditLog, 
  StructuredClinicalData,
  Patient 
} from '../types';
import { authService } from '../services/auth';
import { dataStore } from '../services/firestore';
import { offlineSyncService } from '../services/offlineSync';
import { api } from '../services/api';

export interface SystemHealthStatus {
  healthy: boolean;
  service: string;
  database: string;
  realtime: string;
  timestamp?: string;
}

interface AppContextType {
  currentUser: UserProfile;
  switchRole: (role: UserRole) => void;
  switchUser: (uid: string) => void;
  users: UserProfile[];
  
  visits: Visit[];
  alerts: HealthAlert[];
  households: Household[];
  patients: Patient[];
  earnings: EarningRecord[];
  incentiveRules: IncentiveRule[];
  outbreakClusters: OutbreakCluster[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];

  // Actions
  logVisit: (data: {
    transcript: string;
    latitude: number;
    longitude: number;
    locationAccuracy: number;
    manualStructuredData?: StructuredClinicalData;
    audioUrl?: string;
  }) => Promise<{ visit: Visit; alert: HealthAlert | null; earning: EarningRecord | null }>;
  
  createPatient: (data: {
    householdId: string;
    name: string;
    age?: number | null;
    gender?: string | null;
    patientCategory?: string | null;
  }) => Promise<Patient>;

  updateAlert: (alertId: string, updates: Partial<HealthAlert>) => void;
  markNotificationAsRead: (notifId: string) => void;
  updateIncentiveRules: (rules: IncentiveRule[]) => void;
  resetDatabase: () => void;

  // Offline / Network
  isOnline: boolean;
  pendingOfflineDrafts: number;
  syncState: 'idle' | 'syncing' | 'synced' | 'failed';
  triggerManualSync: () => Promise<void>;
  systemHealth: SystemHealthStatus;
  checkBackendHealth: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(authService.getCurrentUser());
  const [visits, setVisits] = useState<Visit[]>(dataStore.getVisits());
  const [alerts, setAlerts] = useState<HealthAlert[]>(dataStore.getAlerts());
  const [households, setHouseholds] = useState<Household[]>(dataStore.getHouseholds());
  const [patients, setPatients] = useState<Patient[]>(dataStore.getPatients());
  const [earnings, setEarnings] = useState<EarningRecord[]>(dataStore.getEarnings());
  const [incentiveRules, setIncentiveRules] = useState<IncentiveRule[]>(dataStore.getIncentiveRules());
  const [outbreakClusters, setOutbreakClusters] = useState<OutbreakCluster[]>(dataStore.getOutbreakClusters());
  const [notifications, setNotifications] = useState<NotificationItem[]>(dataStore.getNotifications());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(dataStore.getAuditLogs());
  const [users, setUsers] = useState<UserProfile[]>(dataStore.getUsers());

  // System Health state from backend
  const [systemHealth, setSystemHealth] = useState<SystemHealthStatus>({
    healthy: true,
    service: 'Vaani AI Voice Health OS',
    database: 'PostgreSQL + Prisma',
    realtime: 'Socket.IO',
    timestamp: new Date().toISOString()
  });

  const checkBackendHealth = async () => {
    try {
      const res = await api.getHealth();
      setSystemHealth({
        healthy: res.status === 'HEALTHY',
        service: res.service || 'Vaani Backend API',
        database: res.database || 'PostgreSQL + Prisma',
        realtime: api.isSocketConnected() ? 'Socket.IO (Connected)' : (res.realtime || 'Socket.IO'),
        timestamp: res.timestamp
      });
    } catch (e) {
      setSystemHealth(prev => ({
        ...prev,
        healthy: false,
        service: 'Backend Offline / Unreachable'
      }));
    }
  };

  useEffect(() => {
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Offline sync state
  const [isOnline, setIsOnline] = useState<boolean>(offlineSyncService.getOnlineStatus());
  const [pendingOfflineDrafts, setPendingOfflineDrafts] = useState<number>(0);
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'synced' | 'failed'>('idle');

  // Subscribe to Auth changes
  useEffect(() => {
    return authService.subscribe((user) => {
      if (user) setCurrentUser(user);
    });
  }, []);

  // Subscribe to Data Store updates
  useEffect(() => {
    const updateAll = () => {
      setVisits(dataStore.getVisits());
      setAlerts(dataStore.getAlerts());
      setHouseholds(dataStore.getHouseholds());
      setPatients(dataStore.getPatients());
      setEarnings(dataStore.getEarnings());
      setIncentiveRules(dataStore.getIncentiveRules());
      setOutbreakClusters(dataStore.getOutbreakClusters());
      setNotifications(dataStore.getNotifications(currentUser?.uid));
      setAuditLogs(dataStore.getAuditLogs());
      setUsers(dataStore.getUsers());
    };

    updateAll();
    return dataStore.subscribe(updateAll);
  }, [currentUser]);

  // Subscribe to Offline Sync
  useEffect(() => {
    return offlineSyncService.subscribe(({ isOnline: online, pendingCount, syncState: state }) => {
      setIsOnline(online);
      setPendingOfflineDrafts(pendingCount);
      setSyncState(state);
    });
  }, []);

  const switchRole = (role: UserRole) => {
    const user = authService.switchRole(role);
    setCurrentUser(user);
  };

  const switchUser = (uid: string) => {
    const user = authService.switchUserById(uid);
    setCurrentUser(user);
  };

  const handleLogVisit = async (data: {
    transcript: string;
    latitude: number;
    longitude: number;
    locationAccuracy: number;
    manualStructuredData?: StructuredClinicalData;
    audioUrl?: string;
  }) => {
    // If completely offline and not synced yet, save to offline draft queue
    if (!navigator.onLine) {
      offlineSyncService.saveDraft({
        transcript: data.transcript,
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.locationAccuracy,
        recordedAt: new Date().toISOString()
      });
    }

    return await dataStore.logVisit({
      worker: currentUser,
      ...data
    });
  };

  const handleUpdateAlert = (alertId: string, updates: Partial<HealthAlert>) => {
    dataStore.updateAlert(alertId, updates, currentUser.name);
  };

  const handleMarkNotification = (notifId: string) => {
    dataStore.markNotificationAsRead(notifId);
  };

  const handleUpdateIncentiveRules = (rules: IncentiveRule[]) => {
    dataStore.updateIncentiveRules(rules);
  };

  const handleResetDatabase = () => {
    dataStore.resetToDemoData();
  };

  const handleTriggerManualSync = async () => {
    await offlineSyncService.processSyncQueue(async (draft) => {
      const res = await dataStore.logVisit({
        worker: currentUser,
        transcript: draft.transcript,
        latitude: draft.latitude || 25.2677,
        longitude: draft.longitude || 83.0298,
        locationAccuracy: draft.accuracy || 10
      });
      return res.visit;
    });
  };

  const handleCreatePatient = async (data: {
    householdId: string;
    name: string;
    age?: number | null;
    gender?: string | null;
    patientCategory?: string | null;
  }) => {
    return await dataStore.createPatient(data);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        switchRole,
        switchUser,
        users,
        visits,
        alerts,
        households,
        patients,
        earnings,
        incentiveRules,
        outbreakClusters,
        notifications,
        auditLogs,
        logVisit: handleLogVisit,
        createPatient: handleCreatePatient,
        updateAlert: handleUpdateAlert,
        markNotificationAsRead: handleMarkNotification,
        updateIncentiveRules: handleUpdateIncentiveRules,
        resetDatabase: handleResetDatabase,
        isOnline,
        pendingOfflineDrafts,
        syncState,
        triggerManualSync: handleTriggerManualSync,
        systemHealth,
        checkBackendHealth
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
