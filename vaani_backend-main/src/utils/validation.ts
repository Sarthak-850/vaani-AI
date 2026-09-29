import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address format'),
  phone: z.string().min(10, 'Valid phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'SUPERVISOR', 'ASHA']).default('ASHA'),
  villageId: z.string().uuid().optional(),
  villageName: z.string().optional()
});

export const logVisitSchema = z.object({
  transcript: z.string().min(3, 'Transcript must contain clinical notes or voice text'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  locationAccuracy: z.number().positive().default(10),
  timestamp: z.string().optional(),
  audioUrl: z.string().optional(),
  manualStructuredData: z.record(z.any()).optional()
});

export const createHouseholdSchema = z.object({
  name: z.string().min(2, 'Household name is required'),
  familyName: z.string().min(2, 'Family name is required'),
  headOfFamily: z.string().min(2, 'Head of family name is required'),
  villageId: z.string().uuid(),
  membersCount: z.number().int().min(1).default(4),
  hasPregnantMother: z.boolean().default(false),
  hasInfantsUnder5: z.boolean().default(false),
  address: z.string().min(3),
  latitude: z.number(),
  longitude: z.number(),
  notes: z.string().optional()
});

export const createPatientSchema = z.object({
  householdId: z.string().uuid(),
  name: z.string().min(2),
  age: z.number().min(0).max(130).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  patientCategory: z.enum(['infant', 'child', 'pregnant_woman', 'lactating_mother', 'adolescent', 'adult', 'elderly']).optional()
});

export const updateAlertStatusSchema = z.object({
  status: z.enum(['OPEN', 'IN_REVIEW', 'RESOLVED']),
  supervisorNotes: z.string().optional()
});

export const createFollowUpSchema = z.object({
  visitId: z.string().uuid().optional(),
  healthRecordId: z.string().uuid().optional(),
  assignedToId: z.string().uuid().optional(),
  dueDate: z.string().datetime().optional(),
  instructions: z.string().optional()
});
