import { GoogleGenerativeAI } from '@google/generative-ai';
import { StructuredClinicalData, SeverityLevel, VisitCategory } from '../types';
import { api } from './api';

export class AIExtractionService {
  private geminiKey: string | null = null;
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    this.geminiKey = import.meta.env.VITE_GEMINI_API_KEY || null;
    if (this.geminiKey && this.geminiKey !== 'demo-gemini-key') {
      try {
        this.genAI = new GoogleGenerativeAI(this.geminiKey);
      } catch (e) {
        console.warn('Failed to initialize Google Generative AI client', e);
      }
    }
  }

  /**
   * Processes a spoken/written visit transcript and returns structured clinical data.
   */
  public async extractStructuredVisit(transcript: string, context?: {
    village?: string;
    householdHint?: string;
  }): Promise<StructuredClinicalData> {
    if (!transcript || transcript.trim().length === 0) {
      throw new Error('Visit transcript is empty. Please record or type visit details.');
    }

    // 1. Try Backend Node.js / Express Gemini Extraction
    try {
      const backendStructured = await api.extractPreview(transcript, context?.village);
      if (backendStructured && backendStructured.visitType && backendStructured.severity) {
        return backendStructured;
      }
    } catch (backendError) {
      console.debug('Backend extraction unavailable, using direct/rule fallback engine:', backendError);
    }

    // 2. If Gemini is directly configured in browser env, attempt direct extraction
    if (this.genAI) {
      try {
        return await this.extractWithGemini(transcript, context);
      } catch (geminiError) {
        console.warn('Gemini extraction failed, falling back to embedded clinical rule parser:', geminiError);
      }
    }

    // 3. Resilient Rule-Based Clinical Parser (works offline & in local demo mode)
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
  "symptoms": string[] (extracted symptoms),
  "observations": string[] (clinical observations, hygiene, flags),
  "medicationsMentioned": string[] (ORS, paracetamol, IFA, zinc, etc.),
  "immunizationStatus": string | null,
  "pregnancyDetails": {
    "trimester": number | null,
    "gestationalWeek": number | null,
    "highRiskFlags": string[],
    "ironFolicAcidSupplements": boolean | null,
    "bloodPressure": string | null,
    "edemaNoted": boolean | null
  } | null,
  "referralRequired": boolean,
  "referralFacility": string | null,
  "severity": "low" | "medium" | "high" | "critical",
  "followUpRequired": boolean,
  "followUpDate": string | null (YYYY-MM-DD format if recommended),
  "followUpInstructions": string | null,
  "confidence": number (between 0.0 and 1.0)
}

Important Medical Rules:
- If pregnant woman has high BP (>140/90) or edema or severe headache: severity is "high" or "critical", referralRequired: true.
- If child MUAC < 11.5cm or severe wasting / SAM: severity is "critical", referralRequired: true to NRC.
- If high fever with lethargy/convulsions: severity is "high", referralRequired: true.
- Return ONLY the JSON object.`;

    const prompt = `Transcript: "${transcript}"\nContext: ${JSON.stringify(context || {})}`;
    const result = await model.generateContent([systemPrompt, prompt]);
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText) as StructuredClinicalData;
    return this.validateAndNormalizeData(parsed, transcript);
  }

  /**
   * Resilient Clinical Parser based on standard Indian National Health Mission (NHM) ASHA protocols
   */
  public extractWithRuleEngine(transcript: string, context?: { village?: string; householdHint?: string }): StructuredClinicalData {
    const textLower = transcript.toLowerCase();
    
    // Extract Household
    let householdName = 'Household';
    const householdMatch = transcript.match(/([A-Z][a-z]+)\s+(?:family|household|parivar|ghar)/i) ||
                           transcript.match(/visited\s+([A-Z][a-z]+)/i) ||
                           transcript.match(/met\s+with\s+([A-Z][a-z]+)/i);
    if (householdMatch && householdMatch[1]) {
      householdName = `${householdMatch[1]} Family`;
    } else if (context?.householdHint) {
      householdName = context.householdHint;
    }

    // Extract Patient Name
    let patientName: string | undefined;
    const patientMatch = transcript.match(/(?:child|baby|patient|mother|named|name is)\s+([A-Z][a-z]+)/i) ||
                         transcript.match(/([A-Z][a-z]+)\s+is\s+(\d+)\s*(?:years|months|yrs|yo)/i);
    if (patientMatch && patientMatch[1]) {
      patientName = patientMatch[1];
    }

    // Extract Age
    let age: number | undefined;
    const yearMatch = textLower.match(/(\d+)\s*(?:years|year|yrs|yr)\s*old/);
    const monthMatch = textLower.match(/(\d+)\s*(?:months|month|mo|mahine)\s*old/);
    if (yearMatch) {
      age = parseInt(yearMatch[1], 10);
    } else if (monthMatch) {
      age = parseFloat((parseInt(monthMatch[1], 10) / 12).toFixed(2));
    }

    // Extract Weight
    let weightKg: number | undefined;
    const weightMatch = textLower.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilograms|kilos|kilo)/);
    if (weightMatch) {
      weightKg = parseFloat(weightMatch[1]);
    }

    // Extract Blood Pressure
    let bloodPressure: string | undefined;
    const bpMatch = textLower.match(/(\d{2,3}\s*\/\s*\d{2,3})\s*(?:mmhg|bp)?/);
    if (bpMatch) {
      bloodPressure = bpMatch[1].replace(/\s+/g, '');
    }

    // Symptoms Detection
    const symptoms: string[] = [];
    if (/fever|bukhar|temperature|pyrexia/.test(textLower)) symptoms.push('fever');
    if (/cough|khansi|cold|sardi/.test(textLower)) symptoms.push('cough');
    if (/diarrhea|loose stool|dast|pet kharab/.test(textLower)) symptoms.push('diarrhea');
    if (/vomit|ultian|vomiting/.test(textLower)) symptoms.push('vomiting');
    if (/headache|sir dard/.test(textLower)) symptoms.push('headache');
    if (/not eating|poor appetite|khana nahi/.test(textLower)) symptoms.push('poor appetite');
    if (/weakness|lethargy|kamzori|fatigue/.test(textLower)) symptoms.push('weakness/lethargy');
    if (/swelling|edema|soojan/.test(textLower)) symptoms.push('edema / swelling');
    if (/shortness of breath|breathing fast|saans/.test(textLower)) symptoms.push('rapid breathing');
    if (/convulsion|fits|daura/.test(textLower)) symptoms.push('convulsions/seizures');

    // Medications Mentioned
    const medicationsMentioned: string[] = [];
    if (/paracetamol|pcm|crocin|calpol/.test(textLower)) medicationsMentioned.push('Paracetamol');
    if (/ors|oral rehydration/.test(textLower)) medicationsMentioned.push('ORS');
    if (/zinc/.test(textLower)) medicationsMentioned.push('Zinc supplements');
    if (/ifa|iron|folic acid/.test(textLower)) medicationsMentioned.push('Iron Folic Acid (IFA)');
    if (/calcium/.test(textLower)) medicationsMentioned.push('Calcium D3');
    if (/amoxicillin|antibiotic/.test(textLower)) medicationsMentioned.push('Antibiotic prescribed');

    // Categorization
    let visitType: VisitCategory = 'general_checkup';
    let patientCategory: StructuredClinicalData['patientCategory'] = 'adult';
    let severity: SeverityLevel = 'low';
    let referralRequired = false;
    let referralFacility: string | undefined;

    const isPregnant = /pregnant|garbhavati|garbh|antenatal|anc|trimester|gestation/.test(textLower);
    const isChild = /child|baby|infant|baccha|toddler|muac|months old|\d+\s*year old/.test(textLower);
    const isMalnutrition = /malnutrition|sam|mam|muac|underweight|wasting|severe acute/.test(textLower);
    const isImmunization = /vaccine|teeka|immunization|indradhanush|polio|bcg|pentavalent|mr-1|mr-2/.test(textLower);

    if (isPregnant) {
      visitType = 'antenatal_care';
      patientCategory = 'pregnant_woman';
      if (/pre-eclampsia|high bp|150\/|160\/|severe headache|swelling|bleeding/.test(textLower)) {
        severity = 'high';
        referralRequired = true;
        referralFacility = 'Community Health Centre (CHC) / District Hospital';
      } else {
        severity = 'medium';
      }
    } else if (isMalnutrition || (weightKg && age && age <= 3 && weightKg < 8.5)) {
      visitType = 'malnutrition';
      patientCategory = 'child';
      if (/red zone|severe|< 11\.5|<11\.5|wasting/.test(textLower) || (weightKg && weightKg < 7 && age && age >= 1)) {
        severity = 'critical';
        referralRequired = true;
        referralFacility = 'Nutrition Rehabilitation Centre (NRC) District Hospital';
      } else {
        severity = 'medium';
      }
    } else if (isImmunization) {
      visitType = 'immunization';
      patientCategory = age && age < 1 ? 'infant' : 'child';
      severity = 'low';
    } else if (isChild) {
      visitType = 'child_health';
      patientCategory = age && age < 1 ? 'infant' : 'child';
      if (symptoms.includes('convulsions/seizures') || (symptoms.includes('fever') && symptoms.includes('weakness/lethargy') && symptoms.length >= 3)) {
        severity = 'high';
        referralRequired = true;
        referralFacility = 'Primary Health Centre (PHC) / CHC';
      } else if (symptoms.length > 0) {
        severity = 'medium';
      }
    } else if (/elderly|grandfather|grandmother|bujurg|old age/.test(textLower)) {
      visitType = 'elderly_care';
      patientCategory = 'elderly';
      severity = 'low';
    }

    const followUpRequired = severity !== 'low' || isPregnant || isChild;
    const followUpDate = followUpRequired 
      ? new Date(Date.now() + (severity === 'critical' ? 1 : severity === 'high' ? 2 : 4) * 86400000).toISOString().split('T')[0]
      : null;

    return {
      visitType,
      householdName,
      patientName,
      patientCategory,
      age,
      weightKg,
      bloodPressure,
      symptoms,
      observations: [
        `Voice transcript extracted: ${symptoms.length} symptoms detected`,
        referralRequired ? `Urgent referral indicated: ${referralFacility}` : 'Routine community monitoring'
      ],
      medicationsMentioned,
      referralRequired,
      referralFacility,
      severity,
      followUpRequired,
      followUpDate,
      followUpInstructions: referralRequired 
        ? `Ensure transport and accompaniment to ${referralFacility}`
        : 'Monitor recovery and verify medication adherence.',
      confidence: 0.92
    };
  }

  private validateAndNormalizeData(data: StructuredClinicalData, transcript: string): StructuredClinicalData {
    // Ensure all mandatory fields exist and are safe
    return {
      ...data,
      householdName: data.householdName || 'Household',
      symptoms: Array.isArray(data.symptoms) ? data.symptoms : [],
      observations: Array.isArray(data.observations) ? data.observations : [],
      medicationsMentioned: Array.isArray(data.medicationsMentioned) ? data.medicationsMentioned : [],
      confidence: typeof data.confidence === 'number' ? Math.max(0.5, Math.min(1.0, data.confidence)) : 0.9
    };
  }
}

export const aiExtractionService = new AIExtractionService();
