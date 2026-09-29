import request from 'supertest';
import { app } from '../src/server';
import { generateToken } from '../src/utils/jwt';
import { Role } from '@prisma/client';
import { geminiService } from '../src/services/gemini.service';
import { verificationService } from '../src/services/verification.service';
import { incentiveService } from '../src/services/incentive.service';

describe('Vaani Backend API & Services Test Suite', () => {
  const mockAshaUser = {
    userId: '11111111-1111-1111-1111-111111111111',
    email: 'rani.asha@gov.in',
    name: 'Rani Devi',
    role: Role.ASHA,
    workerId: '22222222-2222-2222-2222-222222222222',
    villageId: '33333333-3333-3333-3333-333333333333'
  };

  const ashaToken = generateToken(mockAshaUser);

  describe('1. Health Check Endpoint', () => {
    it('GET /api/health returns 200 and system health metadata', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('HEALTHY');
      expect(res.body.database).toContain('PostgreSQL');
      expect(res.body.realtime).toBe('Socket.IO');
    });
  });

  describe('2. Authentication Endpoint Validation', () => {
    it('POST /api/auth/login fails with 400 for invalid body schema', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'not-an-email',
        password: '123'
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('3. Gemini Clinical AI & Rule Engine Unit Tests', () => {
    it('Extracts structured clinical data correctly for ANC pre-eclampsia transcript', async () => {
      const transcript =
        'Antenatal checkup for Geeta Yadav, 8 months pregnant. Complaining of severe headache and swelling in both feet. BP measured 150/95 mmHg.';
      const extracted = geminiService.extractWithRuleEngine(transcript, { village: 'Ramnagar' });

      expect(extracted.visitType).toBe('antenatal_care');
      expect(extracted.severity).toBe('high');
      expect(extracted.referralRequired).toBe(true);
      expect(extracted.followUpRequired).toBe(true);
      expect(extracted.bloodPressure).toBe('150/95');
    });

    it('Extracts structured clinical data correctly for Severe Acute Malnutrition (SAM)', async () => {
      const transcript =
        'Urgent visit to Ayush Ansari, 14 months old. Child looks very weak, muscle wasting and sunken eyes. MUAC Red zone. Weight 6.2 kg.';
      const extracted = geminiService.extractWithRuleEngine(transcript, { village: 'Shivdaspur' });

      expect(extracted.visitType).toBe('malnutrition');
      expect(extracted.severity).toBe('critical');
      expect(extracted.referralRequired).toBe(true);
      expect(extracted.weightKg).toBe(6.2);
    });
  });

  describe('4. Multi-Agent Verification Service Tests', () => {
    it('Flags impossible travel speed as SUSPICIOUS', () => {
      const prevDate = new Date();
      const currentDate = new Date(prevDate.getTime() + 10 * 60 * 1000); // 10 minutes later

      const verification = verificationService.verifyVisit({
        latitude: 28.6139, // Delhi (~800km away from Varanasi)
        longitude: 77.2090,
        locationAccuracy: 10,
        transcript: 'Routine checkup completed for new household.',
        timestamp: currentDate.toISOString(),
        previousVisits: [
          {
            latitude: 25.2677, // Varanasi
            longitude: 83.0298,
            visitTime: prevDate,
            transcript: 'Routine visit in village.'
          }
        ]
      });

      expect(verification.status).toBe('SUSPICIOUS');
      expect(verification.requiresReview).toBe(true);
    });

    it('Verifies normal visit within valid bounds', () => {
      const verification = verificationService.verifyVisit({
        latitude: 25.2678,
        longitude: 83.0299,
        locationAccuracy: 8,
        transcript: 'Visited Sharma family and checked child Rahul with mild fever.',
        timestamp: new Date().toISOString()
      });

      expect(verification.status).toBe('VERIFIED');
      expect(verification.requiresReview).toBe(false);
    });
  });

  describe('5. ASHA Incentive Compensation Engine Tests', () => {
    it('Calculates correct incentive for ANC visit with high risk bonus', () => {
      const incentive = incentiveService.calculateIncentive({
        visitType: 'antenatal_care',
        severity: 'high',
        followUpRequired: true,
        workerId: 'worker-1',
        visitId: 'visit-1'
      });

      expect(incentive.taskType).toBe('ANC_PNC');
      expect(incentive.amount).toBe(150);
      expect(incentive.bonus).toBe(50);
      expect(incentive.amount + incentive.bonus).toBe(200);
    });

    it('Calculates standard incentive for routine immunization', () => {
      const incentive = incentiveService.calculateIncentive({
        visitType: 'immunization',
        severity: 'low',
        followUpRequired: false,
        workerId: 'worker-1',
        visitId: 'visit-2'
      });

      expect(incentive.taskType).toBe('IMMUNIZATION');
      expect(incentive.amount).toBe(100);
      expect(incentive.bonus).toBe(0);
    });
  });

  describe('6. Protected API Routes Authentication', () => {
    it('GET /api/visits rejects unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/visits');
      expect(res.status).toBe(401);
      expect(res.body.code).toBe('UNAUTHORIZED');
    });

    it('GET /api/alerts rejects unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/alerts');
      expect(res.status).toBe(401);
      expect(res.body.code).toBe('UNAUTHORIZED');
    });
  });
});
