import { PrismaClient, Role, Severity, VerificationStatus, AlertStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for Vaani...');

  // Clean existing tables
  await prisma.notification.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.followUp.deleteMany({});
  await prisma.incentive.deleteMany({});
  await prisma.alert.deleteMany({});
  await prisma.healthRecord.deleteMany({});
  await prisma.visit.deleteMany({});
  await prisma.patient.deleteMany({});
  await prisma.household.deleteMany({});
  await prisma.aSHAWorker.deleteMany({});
  await prisma.village.deleteMany({});
  await prisma.user.deleteMany({});

  const defaultPasswordHash = await bcrypt.hash('Password@123', 10);

  // 1. Create Villages
  console.log('Creating Villages...');
  const villageData = [
    { name: 'Bhopal Sector 3', district: 'Bhopal', state: 'Madhya Pradesh', latitude: 23.2599, longitude: 77.4126 },
    { name: 'Ward 14', district: 'Bhopal', state: 'Madhya Pradesh', latitude: 23.2650, longitude: 77.4180 },
    { name: 'Kolar Road', district: 'Bhopal', state: 'Madhya Pradesh', latitude: 23.1691, longitude: 77.4212 },
    { name: 'MP Nagar', district: 'Bhopal', state: 'Madhya Pradesh', latitude: 23.2314, longitude: 77.4382 },
    { name: 'Bairagarh', district: 'Bhopal', state: 'Madhya Pradesh', latitude: 23.2712, longitude: 77.3443 }
  ];

  const villages = await Promise.all(
    villageData.map((v) =>
      prisma.village.create({
        data: v
      })
    )
  );

  // 2. Create Admin & Supervisor Users
  console.log('Creating Admin & Supervisor users...');
  const adminUser = await prisma.user.create({
    data: {
      name: 'Smt. Anjali Patel (Chief Admin)',
      email: 'admin.intelliashe@nhm.gov.in',
      phone: '+91 90000 11111',
      passwordHash: defaultPasswordHash,
      role: Role.ADMIN,
      profilePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      active: true
    }
  });

  const supervisorUser = await prisma.user.create({
    data: {
      name: 'Dr. Rajesh Sharma',
      email: 'dr.sharma.dho@gov.in',
      phone: '+91 91234 56789',
      passwordHash: defaultPasswordHash,
      role: Role.SUPERVISOR,
      profilePhoto: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
      active: true
    }
  });

  // 3. Create 10 ASHA Worker Users and Worker records
  console.log('Creating 10 ASHA Workers...');
  const ashaNames = [
    { name: 'Rani Devi', email: 'rani.asha@gov.in', phone: '+91 98765 43210', villageIdx: 0 },
    { name: 'Sunita Sharma', email: 'sunita.asha@gov.in', phone: '+91 98765 43211', villageIdx: 1 },
    { name: 'Pooja Verma', email: 'pooja.asha@gov.in', phone: '+91 98765 43212', villageIdx: 2 },
    { name: 'Rekha Maurya', email: 'rekha.asha@gov.in', phone: '+91 98765 43213', villageIdx: 3 },
    { name: 'Anita Yadav', email: 'anita.asha@gov.in', phone: '+91 98765 43214', villageIdx: 4 },
    { name: 'Geeta Bind', email: 'geeta.asha@gov.in', phone: '+91 98765 43215', villageIdx: 0 },
    { name: 'Meena Prajapati', email: 'meena.asha@gov.in', phone: '+91 98765 43216', villageIdx: 1 },
    { name: 'Shanti Devi', email: 'shanti.asha@gov.in', phone: '+91 98765 43217', villageIdx: 2 },
    { name: 'Kusum Patel', email: 'kusum.asha@gov.in', phone: '+91 98765 43218', villageIdx: 3 },
    { name: 'Priya Srivastava', email: 'priya.asha@gov.in', phone: '+91 98765 43219', villageIdx: 4 }
  ];

  const ashaWorkers = [];
  for (let i = 0; i < ashaNames.length; i++) {
    const item = ashaNames[i];
    const u = await prisma.user.create({
      data: {
        name: item.name,
        email: item.email,
        phone: item.phone,
        passwordHash: defaultPasswordHash,
        role: Role.ASHA,
        profilePhoto: `https://images.unsplash.com/photo-${1544005313 + i}?w=150&auto=format&fit=crop&q=80`,
        active: true
      }
    });

    const w = await prisma.aSHAWorker.create({
      data: {
        userId: u.id,
        villageId: villages[item.villageIdx].id,
        active: true
      }
    });
    ashaWorkers.push({ user: u, worker: w, village: villages[item.villageIdx] });
  }

  // 4. Create 30 Households and 60 Patients
  console.log('Creating 30 Households & Patients...');
  const householdFamilyNames = [
    'Sharma', 'Yadav', 'Ansari', 'Patel', 'Verma', 'Gupta', 'Maurya', 'Singh',
    'Kumar', 'Bind', 'Mishra', 'Chauhan', 'Pandey', 'Gautam', 'Rajput',
    'Tiwari', 'Dubey', 'Srivastava', 'Choudhary', 'Tripathi', 'Prasad', 'Lal',
    'Devi', 'Prajapati', 'Sonkar', 'Nath', 'Shukla', 'Rawat', 'Kori', 'Kushwaha'
  ];

  const households = [];
  const patients = [];

  for (let i = 0; i < householdFamilyNames.length; i++) {
    const fam = householdFamilyNames[i];
    const village = villages[i % villages.length];
    const latOffset = (Math.random() - 0.5) * 0.015;
    const lngOffset = (Math.random() - 0.5) * 0.015;

    const hasPregnant = i % 3 === 0;
    const hasInfants = i % 2 === 0;

    const hh = await prisma.household.create({
      data: {
        name: `${fam} Household`,
        familyName: `${fam} Family`,
        headOfFamily: `Shri Ramkishore ${fam}`,
        villageId: village.id,
        membersCount: 3 + (i % 5),
        hasPregnantMother: hasPregnant,
        hasInfantsUnder5: hasInfants,
        address: `House #${101 + i}, Ward ${1 + (i % 6)}, ${village.name}`,
        latitude: village.latitude + latOffset,
        longitude: village.longitude + lngOffset,
        notes: `Registered under rural health sub-centre #${(i % 4) + 1}`,
        lastVisitSeverity: i % 4 === 0 ? Severity.HIGH : Severity.LOW
      }
    });
    households.push(hh);

    // Create 2 patients per household (60 patients)
    const p1 = await prisma.patient.create({
      data: {
        householdId: hh.id,
        name: hasPregnant ? `Sunita ${fam}` : `Amit ${fam}`,
        age: hasPregnant ? 24 : 3 + (i % 10),
        gender: hasPregnant ? 'female' : 'male',
        patientCategory: hasPregnant ? 'pregnant_woman' : (hasInfants ? 'infant' : 'child')
      }
    });
    const p2 = await prisma.patient.create({
      data: {
        householdId: hh.id,
        name: `Baby of ${fam}`,
        age: 0.5 + (i % 4),
        gender: i % 2 === 0 ? 'female' : 'male',
        patientCategory: 'infant'
      }
    });
    patients.push(p1, p2);
  }

  // 5. Create 100+ Historical & Live Visits with Health Records, Alerts, Incentives
  console.log('Generating 100+ Visits with clinical transactions...');
  const visitTemplates = [
    {
      category: 'antenatal_care',
      transcript: 'Antenatal checkup for Geeta. 8 months pregnant. Complaining of severe headache and swelling in both feet. BP measured 150/95 mmHg. Suspecting pre-eclampsia risk. Urgent referral to CHC advised.',
      severity: Severity.HIGH,
      symptoms: ['severe headache', 'edema in feet and face', 'elevated blood pressure'],
      observations: ['Pitting edema ++', 'BP 150/95', 'Fundal height 32cm'],
      medications: ['Iron Folic Acid supplements', 'Calcium tabs'],
      alertTitle: 'High Risk Pregnancy: Pre-Eclampsia Symptoms',
      alertDesc: 'Patient at 32 weeks gestational age presenting with BP 150/95 and bilateral pitting edema.',
      action: 'Immediate transportation and escort to Community Health Centre for obstetric evaluation.',
      taskType: 'ANC_PNC',
      amount: 150,
      bonus: 50
    },
    {
      category: 'malnutrition',
      transcript: 'Urgent home visit to Ayush. 14 months old. Child looks very weak, visible muscle wasting and sunken eyes. Weight measured 6.2 kg, MUAC tape shows Red zone 11.2 cm. Immediate emergency admission to NRC required.',
      severity: Severity.CRITICAL,
      symptoms: ['extreme lethargy', 'severe muscle wasting', 'loss of appetite'],
      observations: ['Weight 6.2kg (SAM)', 'MUAC 11.2cm (RED)', 'Severe palmar pallor'],
      medications: ['Zinc syrup', 'ORS packets'],
      alertTitle: 'Severe Acute Malnutrition (SAM) Red Alert',
      alertDesc: '14-month infant with red-zone MUAC 11.2 cm and weight under 3rd percentile.',
      action: 'Emergency admission to Nutrition Rehabilitation Centre (NRC) and pediatrician consult.',
      taskType: 'HIGH_RISK_FOLLOWUP',
      amount: 100,
      bonus: 75
    },
    {
      category: 'child_health',
      transcript: 'I visited Sharma family today. Their child Rahul is 3 years old and weighs 9 kilograms. He has high fever since yesterday and the mother said he is not eating properly. Provided ORS and paracetamol syrup. Advised sponge baths.',
      severity: Severity.MEDIUM,
      symptoms: ['high fever 102F', 'reduced appetite', 'mild dehydration'],
      observations: ['Temp 38.9C', 'Hydration fair', 'Clear lungs'],
      medications: ['Paracetamol syrup 5ml', 'Oral Rehydration Solution'],
      alertTitle: 'Childhood Febrile Illness',
      alertDesc: '3yo presenting with persistent 102F fever and poor oral intake for 24h.',
      action: 'Monitor temperature every 4 hours, maintain hydration, review in 24 hours.',
      taskType: 'ROUTINE_VISIT',
      amount: 75,
      bonus: 25
    },
    {
      category: 'immunization',
      transcript: 'Routine immunization check for 9-month-old infant. Verified vaccination card. Administered MR-1 vaccine and Vitamin A first dose. No adverse reactions after 30 minutes observation.',
      severity: Severity.LOW,
      symptoms: [],
      observations: ['Vaccine card updated', 'Growth on normal trajectory'],
      medications: ['MR-1 Vaccine', 'Vitamin A 100,000 IU'],
      taskType: 'IMMUNIZATION',
      amount: 100,
      bonus: 0
    },
    {
      category: 'communicable_disease',
      transcript: 'Multiple household members reporting watery diarrhea and severe vomiting for 2 days. Provided ORS and chlorine tablets for drinking well water disinfection. Flagging potential waterborne outbreak.',
      severity: Severity.HIGH,
      symptoms: ['watery diarrhea', 'vomiting', 'mild dehydration'],
      observations: ['3 family members affected', 'Open well drinking water source'],
      medications: ['ORS packets', 'Chlorine water purification tabs'],
      alertTitle: 'Cluster Diarrheal Illness - Potential Outbreak',
      alertDesc: 'Multiple acute gastroenteritis cases originating from shared community water source.',
      action: 'Disinfect village water sources with bleaching powder, distribute ORS, notify Medical Officer.',
      taskType: 'OUTBREAK_REPORT',
      amount: 150,
      bonus: 50
    },
    {
      category: 'general_checkup',
      transcript: 'Routine maternal and child wellness checkup. Checked vital signs and dietary counseling provided to family. Mother and baby in healthy condition.',
      severity: Severity.LOW,
      symptoms: [],
      observations: ['Normal growth percentiles', 'Proper hygiene observed'],
      medications: ['Multivitamin drops'],
      taskType: 'ROUTINE_VISIT',
      amount: 50,
      bonus: 0
    }
  ];

  let visitCount = 0;
  for (let i = 0; i < 110; i++) {
    const template = visitTemplates[i % visitTemplates.length];
    const workerObj = ashaWorkers[i % ashaWorkers.length];
    const hh = households[i % households.length];
    const pat = patients[i % patients.length];

    const daysAgo = Math.floor(i / 4);
    const visitDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 - (i % 12) * 3600 * 1000);

    const isSuspicious = i === 42 || i === 89;
    const vStatus = isSuspicious ? VerificationStatus.WARNING : VerificationStatus.VERIFIED;

    const visit = await prisma.visit.create({
      data: {
        ashaWorkerId: workerObj.worker.id,
        householdId: hh.id,
        transcript: template.transcript,
        structuredData: {
          visitType: template.category,
          householdName: hh.familyName,
          patientName: pat.name,
          patientCategory: pat.patientCategory,
          age: pat.age,
          gender: pat.gender,
          symptoms: template.symptoms,
          observations: template.observations,
          medicationsMentioned: template.medications,
          severity: template.severity.toLowerCase(),
          confidence: 0.94,
          followUpRequired: template.severity === Severity.HIGH || template.severity === Severity.CRITICAL,
          followUpDate: template.severity === Severity.HIGH ? new Date(visitDate.getTime() + 48 * 3600 * 1000).toISOString() : null
        },
        visitTime: visitDate,
        latitude: hh.latitude + (Math.random() - 0.5) * 0.002,
        longitude: hh.longitude + (Math.random() - 0.5) * 0.002,
        locationAccuracy: 8.5,
        severity: template.severity,
        status: isSuspicious ? 'flagged' : 'active',
        verificationStatus: vStatus,
        verificationScore: isSuspicious ? 68 : 96,
        verificationReasons: isSuspicious ? ['Short interval between consecutive visits', 'Location variance within acceptable bounds'] : ['GPS and voice biometric verified'],
        aiConfidence: 0.95,
        followUpRequired: template.severity === Severity.HIGH || template.severity === Severity.CRITICAL,
        followUpDate: template.severity === Severity.HIGH ? new Date(visitDate.getTime() + 48 * 3600 * 1000) : null,
        followUpStatus: template.severity === Severity.HIGH ? 'pending' : 'none',
        createdAt: visitDate,
        updatedAt: visitDate
      }
    });

    // Create HealthRecord
    const healthRecord = await prisma.healthRecord.create({
      data: {
        visitId: visit.id,
        patientId: pat.id,
        weight: pat.patientCategory === 'infant' ? 7.4 : 45.0,
        temperature: template.severity === Severity.HIGH ? 39.1 : 37.0,
        bloodPressure: template.category === 'antenatal_care' ? '150/95' : '120/80',
        symptoms: template.symptoms,
        observations: template.observations,
        medications: template.medications,
        riskLevel: template.severity,
        followUpRequired: visit.followUpRequired,
        createdAt: visitDate,
        updatedAt: visitDate
      }
    });

    // Create Alert if High/Critical
    if (template.alertTitle) {
      await prisma.alert.create({
        data: {
          visitId: visit.id,
          severity: template.severity,
          title: template.alertTitle,
          description: template.alertDesc || template.transcript,
          recommendedAction: template.action || 'Conduct supervisor review.',
          status: i % 2 === 0 ? AlertStatus.OPEN : AlertStatus.RESOLVED,
          acknowledgedBy: i % 2 === 0 ? null : supervisorUser.name,
          supervisorNotes: i % 2 === 0 ? null : 'Case verified and medical kit dispatched.',
          createdAt: visitDate,
          updatedAt: visitDate
        }
      });
    }

    // Create Incentive
    await prisma.incentive.create({
      data: {
        ashaWorkerId: workerObj.worker.id,
        visitId: visit.id,
        taskType: template.taskType,
        amount: template.amount,
        bonus: template.bonus,
        status: 'CREDITED',
        reason: `Compensation for verified ${template.category.replace('_', ' ')} visit`,
        createdAt: visitDate,
        updatedAt: visitDate
      }
    });

    // Create Follow-up if required
    if (visit.followUpRequired) {
      await prisma.followUp.create({
        data: {
          healthRecordId: healthRecord.id,
          visitId: visit.id,
          assignedToId: workerObj.worker.id,
          dueDate: new Date(visitDate.getTime() + 48 * 3600 * 1000),
          status: i % 3 === 0 ? 'completed' : 'pending',
          instructions: 'Visit household and re-check blood pressure / symptoms.',
          completedAt: i % 3 === 0 ? new Date(visitDate.getTime() + 40 * 3600 * 1000) : null,
          createdAt: visitDate,
          updatedAt: visitDate
        }
      });
    }

    visitCount++;
  }

  // 6. Create Notifications and Audit Logs
  console.log('Creating Notifications and Audit Logs...');
  await prisma.notification.createMany({
    data: [
      {
        userId: supervisorUser.id,
        title: 'HIGH Alert: Pre-Eclampsia Case Reported',
        message: 'High risk ANC visit recorded by Rani Devi in Bhopal Sector 3.',
        type: 'HIGH_RISK',
        link: '/alerts',
        read: false
      },
      {
        userId: ashaWorkers[0].user.id,
        title: 'Incentive Credited: ₹200',
        message: 'Incentive for verified high-risk ANC follow-up successfully approved.',
        type: 'EARNING_CREDITED',
        link: '/earnings',
        read: true
      },
      {
        userId: 'all',
        title: 'District Health Review Meeting',
        message: 'Monthly ASHA coordination meeting scheduled for Friday at District HQ.',
        type: 'SYSTEM',
        link: '/analytics',
        read: false
      }
    ]
  });

  await prisma.auditLog.createMany({
    data: [
      {
        userId: adminUser.id,
        userName: adminUser.name,
        action: 'SYSTEM_INITIALIZATION',
        entity: 'DATABASE',
        entityId: 'SYSTEM',
        metadata: { database: 'PostgreSQL', orm: 'Prisma', seededVisits: visitCount }
      },
      {
        userId: ashaWorkers[0].user.id,
        userName: ashaWorkers[0].user.name,
        action: 'VISIT_VOICE_AI_LOG',
        entity: 'VISIT',
        entityId: 'INITIAL_SEED',
        metadata: { status: 'VERIFIED', aiModel: 'gemini-1.5-flash' }
      }
    ]
  });

  console.log(`✅ Seeding completed successfully!`);
  console.log(`Summary:`);
  console.log(`- 1 Admin User: ${adminUser.email} (Password: Password@123)`);
  console.log(`- 1 Supervisor User: ${supervisorUser.email} (Password: Password@123)`);
  console.log(`- 10 ASHA Workers (${ashaWorkers[0].user.email}, etc.)`);
  console.log(`- 5 Villages`);
  console.log(`- ${households.length} Households`);
  console.log(`- ${patients.length} Patients`);
  console.log(`- ${visitCount} Total Visits with full clinical transactions`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
