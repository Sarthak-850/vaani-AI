export type UserRole = 'asha_worker' | 'supervisor' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  village: string;
  district: string;
  state: string;
  profilePhoto?: string;
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

export type VisitCategory = 
  | 'child_health'
  | 'antenatal_care'
  | 'postnatal_care'
  | 'immunization'
  | 'malnutrition'
  | 'communicable_disease'
  | 'elderly_care'
  | 'general_checkup';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type VerificationStatus = 'verified' | 'warning' | 'suspicious';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'OPEN' | 'IN_REVIEW' | 'RESOLVED';
export type FollowUpStatus = 'pending' | 'completed' | 'overdue' | 'none';

export interface PregnancyDetails {
  trimester?: number;
  gestationalWeek?: number;
  highRiskFlags?: string[];
  ironFolicAcidSupplements?: boolean;
  bloodPressure?: string;
  edemaNoted?: boolean;
}

export interface StructuredClinicalData {
  visitType: VisitCategory;
  householdName: string;
  patientName?: string;
  patientCategory?: 'infant' | 'child' | 'pregnant_woman' | 'lactating_mother' | 'adolescent' | 'adult' | 'elderly';
  age?: number;
  gender?: 'male' | 'female' | 'other';
  weightKg?: number;
  temperatureC?: number;
  bloodPressure?: string;
  symptoms: string[];
  observations: string[];
  medicationsMentioned: string[];
  immunizationStatus?: string;
  pregnancyDetails?: PregnancyDetails;
  referralRequired: boolean;
  referralFacility?: string;
  severity: SeverityLevel;
  followUpRequired: boolean;
  followUpDate?: string | null;
  followUpInstructions?: string;
  confidence: number;
}

export interface VerificationResult {
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number; // 0 (safest) to 100 (highest risk)
  status: VerificationStatus;
  reasons: string[];
  requiresReview: boolean;
}

export interface Visit {
  id: string;
  workerId: string;
  workerName: string;
  workerVillage: string;
  householdId: string;
  householdName: string;
  village: string;
  transcript: string;
  structuredData: StructuredClinicalData;
  latitude: number;
  longitude: number;
  locationAccuracy: number; // in meters
  timestamp: string;
  severity: SeverityLevel;
  status: 'active' | 'archived' | 'flagged';
  verificationStatus: VerificationStatus;
  verificationScore: number;
  verificationReasons: string[];
  aiConfidence: number;
  followUpRequired: boolean;
  followUpDate?: string | null;
  followUpStatus: FollowUpStatus;
  audioUrl?: string;
  createdAt: string;
  updatedAt: string;
  syncedFromOffline?: boolean;
}

export interface HealthAlert {
  id: string;
  visitId: string;
  workerId: string;
  workerName: string;
  householdId: string;
  householdName: string;
  village: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  recommendedAction: string;
  status: AlertStatus;
  acknowledgedBy?: string;
  supervisorNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Household {
  id: string;
  familyName: string;
  headOfFamily: string;
  village: string;
  district: string;
  state: string;
  membersCount: number;
  hasPregnantMother: boolean;
  hasInfantsUnder5: boolean;
  address: string;
  latitude: number;
  longitude: number;
  lastVisitDate?: string;
  lastVisitSeverity?: SeverityLevel;
  notes?: string;
}

export interface EarningRecord {
  id: string;
  workerId: string;
  visitId?: string;
  taskType: 'ROUTINE_VISIT' | 'IMMUNIZATION' | 'ANC_PNC' | 'HIGH_RISK_FOLLOWUP' | 'OUTBREAK_REPORT';
  amount: number;
  bonus: number;
  status: 'CREDITED' | 'PENDING' | 'DISBURSED';
  description: string;
  date: string;
  createdAt: string;
}

export interface IncentiveRule {
  id: string;
  taskType: string;
  title: string;
  baseAmount: number;
  bonusAmount: number;
  description: string;
  active: boolean;
}

export interface OutbreakCluster {
  id: string;
  village: string;
  symptomCategory: string;
  currentCases: number;
  historicalBaseline: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  trend: 'UPWARD' | 'STABLE' | 'DOWNWARD';
  detectedAt: string;
  recommendedAction: string;
  affectedVisitsCount: number;
  status: 'ACTIVE_INVESTIGATION' | 'RESOLVED' | 'MONITORING';
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'HIGH_RISK' | 'FOLLOW_UP' | 'SUSPICIOUS_GPS' | 'EARNING_CREDITED' | 'SYSTEM';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface OfflineDraftVisit {
  localId: string;
  transcript: string;
  recordedAt: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  audioBlob?: Blob;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'failed';
  syncError?: string;
}

export interface Patient {
  id: string;
  householdId: string;
  name: string;
  age?: number | null;
  gender?: string | null;
  patientCategory?: string | null;
  phone?: string | null;
  village?: string;
  riskLevel?: string;
  chronicConditions?: string[];
  createdAt: string;
  updatedAt: string;
  household?: Household;
  healthRecords?: any[];
}
