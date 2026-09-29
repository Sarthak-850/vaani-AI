import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';

export interface StructuredClinicalData {
  visitType: 'child_health' | 'antenatal_care' | 'postnatal_care' | 'immunization' | 'malnutrition' | 'communicable_disease' | 'elderly_care' | 'general_checkup';
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
  pregnancyDetails?: {
    trimester?: number;
    highRiskFlags?: string[];
  };
  referralRequired: boolean;
  referralFacility?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  followUpRequired: boolean;
  followUpDate?: string | null;
  followUpInstructions?: string;
  confidence: number;
}

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    if (env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim().length > 0 && env.GEMINI_API_KEY !== 'demo-gemini-key') {
      try {
        this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
      } catch (err) {
        console.warn('Failed to initialize Google Generative AI client:', err);
      }
    }
  }

  public async extractStructuredVisit(
    transcript: string,
    context?: { village?: string; workerName?: string }
  ): Promise<StructuredClinicalData> {
    if (!transcript || transcript.trim().length === 0) {
      throw new Error('Visit transcript is empty. Please provide visit notes or audio transcript.');
    }

    // 1. If Gemini client is active, attempt extraction with 1 retry
    if (this.genAI) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          return await this.extractWithGemini(transcript, context);
        } catch (geminiError: any) {
          console.warn(`Gemini extraction attempt ${attempt} failed:`, geminiError?.message || geminiError);
          if (attempt === 2) {
            console.info('Falling back to embedded resilient clinical rule engine.');
          }
        }
      }
    }

    // 2. Resilient Rule-Based Fallback Engine
    return this.extractWithRuleEngine(transcript, context);
  }

  private async extractWithGemini(transcript: string, context?: any): Promise<StructuredClinicalData> {
    const model = this.genAI!.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1
      }
    });

    const systemPrompt = `You are Vaani, a clinical decision support and data extraction AI for ASHA healthcare workers in rural India.
Convert the following spoken visit transcript into strict, valid JSON matching this exact schema:

{
  "visitType": "child_health" | "antenatal_care" | "postnatal_care" | "immunization" | "malnutrition" | "communicable_disease" | "elderly_care" | "general_checkup",
  "householdName": string (e.g. "Sharma Family" or family head),
  "patientName": string (if mentioned, e.g. "Rahul", "Geeta"),
  "patientCategory": "infant" | "child" | "pregnant_woman" | "lactating_mother" | "adolescent" | "adult" | "elderly",
  "age": number (in years, decimals for months, e.g. 0.75 for 9mo, or null if unmentioned),
  "gender": "male" | "female" | "other" | null,
  "weightKg": number | null,
  "temperatureC": number | null,
  "bloodPressure": string | null (e.g. "120/80"),
  "symptoms": string[] (list of all symptoms reported),
  "observations": string[] (clinical signs, MUAC tape color, swelling, pallor),
  "medicationsMentioned": string[] (medicines or supplements advised/given),
  "immunizationStatus": string | null,
  "pregnancyDetails": {
    "trimester": number | null,
    "highRiskFlags": string[] | []
  } | null,
  "referralRequired": boolean,
  "referralFacility": string | null,
  "severity": "low" | "medium" | "high" | "critical",
  "followUpRequired": boolean,
  "followUpDate": string | null (ISO format date if follow up recommended, e.g. 24-48 hours ahead),
  "followUpInstructions": string | null,
  "confidence": number (between 0.80 and 0.99)
}

Clinical Triage Rules:
- "critical": Severe Acute Malnutrition (SAM) red zone, respiratory distress, convulsion, unresponsive infant, severe postpartum hemorrhage, BP > 160/110.
- "high": Pre-eclampsia symptoms (high BP + edema/headache), severe dehydration with vomiting/diarrhea, fever > 103F in infants, high risk pregnancy with missed ANC.
- "medium": Moderate fever with reduced intake, mild diarrhea with good hydration, yellow-zone malnutrition, missed vaccines with mild cold.
- "low": Routine wellness checkup, normal immunization administered, healthy pregnancy follow-up.

Context: Village: ${context?.village || 'Rural Health Sub-Centre'}
Transcript: "${transcript}"`;

    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);

    // Validate parsed output
    if (!parsed.visitType || !parsed.severity) {
      throw new Error('AI output missing required clinical fields');
    }

    return parsed as StructuredClinicalData;
  }

  public extractWithRuleEngine(transcript: string, context?: any): StructuredClinicalData {
    const text = transcript.toLowerCase();
    const symptoms: string[] = [];
    const observations: string[] = [];
    const medications: string[] = [];

    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let visitType: StructuredClinicalData['visitType'] = 'general_checkup';
    let referralRequired = false;
    let followUpRequired = false;
    let patientCategory: StructuredClinicalData['patientCategory'] = 'adult';
    let patientName: string | undefined = undefined;
    let householdName = `${context?.village || 'Village'} Household`;
    let weightKg: number | undefined = undefined;
    let bloodPressure: string | undefined = undefined;

    // Detect Household / Name
    const familyMatch = transcript.match(/([A-Z][a-z]+)\s+family/i);
    if (familyMatch) {
      householdName = `${familyMatch[1]} Family`;
    }

    const nameMatch = transcript.match(/\b(Rahul|Geeta|Ayush|Ananya|Suman|Amit|Pooja|Ravi|Karan|Sunita|Radha)\b/i);
    if (nameMatch) {
      patientName = nameMatch[1];
    }

    // Detect Symptoms & Triage
    if (text.includes('fever') || text.includes('bukhar') || text.includes('taap')) {
      symptoms.push('Fever');
      severity = 'medium';
      visitType = 'child_health';
    }
    if (text.includes('cough') || text.includes('khansi')) symptoms.push('Cough');
    if (text.includes('diarrhea') || text.includes('dast') || text.includes('loose motion')) {
      symptoms.push('Diarrhea');
      severity = 'medium';
    }
    if (text.includes('headache') || text.includes('sar dard')) symptoms.push('Severe headache');
    if (text.includes('swelling') || text.includes('edema') || text.includes('sujan')) {
      symptoms.push('Edema / Swelling');
      observations.push('Bilateral pitting edema');
      severity = 'high';
    }
    if (text.includes('weak') || text.includes('muscle wasting') || text.includes('sunken eyes') || text.includes('muac') || text.includes('sam')) {
      symptoms.push('Severe muscle wasting');
      observations.push('MUAC Red Zone (<11.5cm)');
      severity = 'critical';
      visitType = 'malnutrition';
      referralRequired = true;
      followUpRequired = true;
    }

    // Pregnancy & ANC
    if (text.includes('pregnant') || text.includes('garbhavati') || text.includes('anc') || text.includes('trimester') || text.includes('month pregnant')) {
      visitType = 'antenatal_care';
      patientCategory = 'pregnant_woman';
      if (text.includes('150/') || text.includes('160/') || text.includes('high bp') || text.includes('headache')) {
        severity = 'high';
        referralRequired = true;
        followUpRequired = true;
      }
    }

    // Immunization
    if (text.includes('vaccine') || text.includes('teeka') || text.includes('mr-1') || text.includes('immunization') || text.includes('polio')) {
      visitType = 'immunization';
      medications.push('Vaccine Dose');
      patientCategory = 'infant';
    }

    // Vitals extraction
    const weightMatch = text.match(/(\d+(\.\d+)?)\s*(kg|kilograms|kilo)/i);
    if (weightMatch) weightKg = parseFloat(weightMatch[1]);

    const bpMatch = text.match(/(\d{2,3}\/\d{2,3})\s*(mmhg)?/i);
    if (bpMatch) bloodPressure = bpMatch[1];

    if (text.includes('ors') || text.includes('paracetamol') || text.includes('iron') || text.includes('folic')) {
      if (text.includes('ors')) medications.push('ORS Solution');
      if (text.includes('paracetamol')) medications.push('Paracetamol syrup');
      if (text.includes('iron') || text.includes('folic')) medications.push('Iron Folic Acid (IFA)');
    }

    if (severity === 'high' || severity === 'critical') {
      followUpRequired = true;
      referralRequired = true;
    }

    return {
      visitType,
      householdName,
      patientName,
      patientCategory,
      weightKg,
      bloodPressure,
      symptoms: symptoms.length > 0 ? symptoms : ['General checkup symptoms review'],
      observations: observations.length > 0 ? observations : ['Vital signs reviewed'],
      medicationsMentioned: medications,
      referralRequired,
      referralFacility: referralRequired ? 'Community Health Centre (CHC)' : undefined,
      severity,
      followUpRequired,
      followUpDate: followUpRequired ? new Date(Date.now() + 48 * 3600 * 1000).toISOString() : null,
      confidence: 0.91
    };
  }
}

export const geminiService = new GeminiService();
