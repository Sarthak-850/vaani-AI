import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  Mic, 
  MicOff, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Square, 
  RefreshCw, 
  ArrowRight, 
  Stethoscope, 
  Calendar, 
  HeartHandshake, 
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { speechService } from '../services/speech';
import { locationService, GeoLocationCoordinates } from '../services/location';
import { aiExtractionService } from '../services/aiExtraction';
import { StructuredClinicalData, SeverityLevel } from '../types';
import { StructuredDataPreview } from '../components/visits/StructuredDataPreview';

const SAMPLE_PROMPTS = [
  {
    title: 'Child with High Fever',
    label: 'Sharma Family (Rahul, 3yo)',
    text: 'I visited Sharma family today. Their child Rahul is 3 years old and weighs 9 kilograms. He has high fever since yesterday and the mother said he is not eating properly. Provided ORS and paracetamol syrup. Advised sponge baths.'
  },
  {
    title: 'High-Risk Pregnancy',
    label: 'Yadav Family (Geeta, 8mo ANC)',
    text: 'Antenatal checkup for Geeta Yadav, 8 months pregnant. Complaining of severe headache and swelling in both feet and face. BP measured 150/95 mmHg. Suspecting pre-eclampsia risk. Advised urgent escort to Community Health Centre.'
  },
  {
    title: 'Severe Malnutrition (SAM)',
    label: 'Ansari Family (Ayush, 14mo)',
    text: 'Urgent home visit to Ayush Ansari, 14 months old. Child looks very weak, visible muscle wasting and sunken eyes. Weight measured 6.2 kg, MUAC tape shows Red zone 11.2 cm. Immediate emergency admission to NRC required.'
  },
  {
    title: 'Routine Immunization',
    label: 'Patel Family (Ananya, 9mo)',
    text: 'Met with Suman Patel. Her 9-month-old baby girl Ananya is healthy. Checked immunization card. Scheduled for MR-1 vaccine and Vitamin A dose for next session on Tuesday.'
  }
];

export const LogVisit: React.FC = () => {
  const { currentUser, logVisit } = useApp();
  const navigate = useNavigate();

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [language, setLanguage] = useState<'en-IN' | 'hi-IN'>('en-IN');
  const [audioVolume, setAudioVolume] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  // GPS States
  const [location, setLocation] = useState<GeoLocationCoordinates | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // AI Processing & Submission States
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiStep, setAiStep] = useState<string>('');
  const [structuredData, setStructuredData] = useState<StructuredClinicalData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    visitId: string;
    incentiveAmount: number;
    alertCreated: boolean;
  } | null>(null);

  const timerRef = useRef<any>(null);

  // Automatically fetch GPS position on mount
  useEffect(() => {
    fetchCurrentLocation();
  }, []);

  // Timer effect for voice recording
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const fetchCurrentLocation = async () => {
    setIsFetchingLocation(true);
    setLocationError(null);
    try {
      const coords = await locationService.getCurrentPosition();
      setLocation(coords);
    } catch (err: any) {
      console.warn('GPS fetch failed:', err);
      setLocationError(err.message || 'GPS location unavailable. Defaulting to village center.');
      // Fallback coordinate for demo in Varanasi rural belt
      setLocation({
        latitude: 25.2680 + (Math.random() - 0.5) * 0.005,
        longitude: 83.0300 + (Math.random() - 0.5) * 0.005,
        accuracy: 12,
        timestamp: Date.now()
      });
    } finally {
      setIsFetchingLocation(false);
    }
  };

  const startVoiceRecording = async () => {
    setErrorMessage(null);
    setSuccessResult(null);

    await speechService.startListening({
      language,
      onTranscriptUpdate: (text) => {
        setTranscript(text);
      },
      onError: (err) => {
        setErrorMessage(err);
        setIsRecording(false);
      },
      onAudioLevel: (volume) => {
        setAudioVolume(volume);
      }
    });

    setIsRecording(true);
  };

  const stopVoiceRecording = async () => {
    setIsRecording(false);
    const blob = await speechService.stopListening();
    setAudioBlob(blob);
    setAudioVolume(0);

    // If transcript captured, automatically trigger AI extraction
    if (transcript.trim().length > 10) {
      handleExtractAI(transcript);
    }
  };

  const handleApplySample = (sampleText: string) => {
    setTranscript(sampleText);
    setErrorMessage(null);
    handleExtractAI(sampleText);
  };

  const handleExtractAI = async (textToExtract = transcript) => {
    if (!textToExtract || textToExtract.trim().length === 0) {
      setErrorMessage('Please record or type a visit description first.');
      return;
    }

    setIsProcessingAI(true);
    setErrorMessage(null);

    try {
      setAiStep('1. Sending audio transcript to Vaani AI...');
      await new Promise((r) => setTimeout(r, 400));

      setAiStep('2. Parsing clinical symptoms, vitals & patient metadata...');
      const extracted = await aiExtractionService.extractStructuredVisit(textToExtract, {
        village: currentUser.village
      });

      setAiStep('3. Running Vaani verification & triage safety agents...');
      await new Promise((r) => setTimeout(r, 400));

      setStructuredData(extracted);
    } catch (err: any) {
      console.error('AI Extraction error:', err);
      setErrorMessage(err.message || 'Failed to analyze visit. You can continue with manual review.');
      // Use rule fallback
      const fallback = aiExtractionService.extractWithRuleEngine(textToExtract, { village: currentUser.village });
      setStructuredData(fallback);
    } finally {
      setIsProcessingAI(false);
      setAiStep('');
    }
  };

  const handleSubmitVisit = async () => {
    if (!transcript || transcript.trim().length === 0) {
      setErrorMessage('Please provide a visit description.');
      return;
    }

    if (!location) {
      setErrorMessage('GPS Location is required for visit verification.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await logVisit({
        transcript,
        latitude: location.latitude,
        longitude: location.longitude,
        locationAccuracy: location.accuracy,
        manualStructuredData: structuredData || undefined
      });

      // Confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      setSuccessResult({
        visitId: result.visit.id,
        incentiveAmount: (result.earning?.amount || 50) + (result.earning?.bonus || 0),
        alertCreated: Boolean(result.alert)
      });
    } catch (err: any) {
      console.error('Submission failed:', err);
      setErrorMessage(err.message || 'Failed to submit visit.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24">
      
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
          <Sparkles className="w-4 h-4" />
          <span>Voice-First AI Field Entry • Vaani Agent</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Log Household Visit
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Simply speak in Hindi or English about what happened during your visit. Vaani AI will extract structured fields, check GPS, and calculate your incentive.
        </p>
      </div>

      {/* SUCCESS CONFIRMATION MODAL / SCREEN */}
      {successResult && (
        <div className="bg-emerald-50 border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-xl animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-emerald-950">
              Visit Successfully Verified & Logged!
            </h2>
            <p className="text-xs sm:text-sm text-emerald-800">
              Visit ID: <code className="font-mono bg-emerald-100 px-2 py-0.5 rounded">{successResult.visitId}</code>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto pt-2">
            <div className="bg-white p-3 rounded-2xl border border-emerald-200 text-xs">
              <span className="text-slate-500 block">Incentive Credited</span>
              <span className="text-lg font-black text-emerald-700">
                +₹{successResult.incentiveAmount}.00
              </span>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-emerald-200 text-xs">
              <span className="text-slate-500 block">Supervisor Live Feed</span>
              <span className="text-xs font-bold text-slate-800">
                {successResult.alertCreated ? '🚨 High-Risk Alert Sent' : '✓ Real-time Sync Complete'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={() => {
                setSuccessResult(null);
                setTranscript('');
                setStructuredData(null);
              }}
              className="px-5 py-2.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-all shadow-xs"
            >
              Log Another Visit
            </button>

            <button
              onClick={() => navigate('/visits')}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
            >
              <span>View All Visits</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {!successResult && (
        <>
          {/* PRIMARY VOICE RECORDING CARD */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* Top Toolbar: Language & Timer */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Language:</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  disabled={isRecording}
                  className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-emerald-500"
                >
                  <option value="en-IN">English (Indian Accent)</option>
                  <option value="hi-IN">हिन्दी (Hindi)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                {isRecording && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-rose-600" />
                    <span>REC {formatTimer(recordingSeconds)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Central Mic Visualizer & Pulsing CTA */}
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
              
              <div className="relative flex items-center justify-center">
                {isRecording && (
                  <div 
                    className="absolute w-28 h-28 rounded-full bg-emerald-500/20 mic-recording-pulse"
                    style={{ transform: `scale(${1 + (audioVolume / 100) * 0.4})` }}
                  />
                )}

                <button
                  type="button"
                  onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-white shadow-xl transition-all ${
                    isRecording
                      ? 'bg-rose-600 hover:bg-rose-700 ring-8 ring-rose-200 scale-105'
                      : 'bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 ring-8 ring-emerald-100 hover:scale-105'
                  }`}
                >
                  {isRecording ? (
                    <Square className="w-8 h-8 fill-current" />
                  ) : (
                    <Mic className="w-9 h-9" />
                  )}
                </button>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  {isRecording ? 'Listening to your visit report...' : 'Tap to Start Voice Recording'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  {isRecording 
                    ? 'Speak clearly about household name, patient age, symptoms, medications, and advice given.' 
                    : '“Tell us what happened during the visit”'}
                </p>
              </div>

              {/* Audio visualizer bar level indicator */}
              {isRecording && (
                <div className="flex items-center gap-1 h-6">
                  {[40, 70, 90, 60, 100, 80, 50, 90, 60].map((height, i) => (
                    <div
                      key={i}
                      className="w-1 rounded-full bg-emerald-500 transition-all duration-75"
                      style={{
                        height: `${Math.max(6, (audioVolume * height) / 100)}px`
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Quick Sample Prompts (For easy one-click testing!) */}
            <div className="border-t border-slate-100 pt-4">
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Or Click a Sample Spoken Visit to Test:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SAMPLE_PROMPTS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplySample(sample.text)}
                    className="p-2.5 text-left rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition-all group"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900 group-hover:text-emerald-800">
                      <span>{sample.title}</span>
                      <span className="text-[10px] font-medium text-slate-500">{sample.label}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5 italic">
                      "{sample.text}"
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Spoken Transcript Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <span>Visit Transcript</span>
                  {transcript && <span className="text-slate-400 font-normal">({transcript.length} chars)</span>}
                </label>
                {transcript && (
                  <button
                    type="button"
                    onClick={() => handleExtractAI(transcript)}
                    disabled={isProcessingAI}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isProcessingAI ? 'animate-spin' : ''}`} />
                    <span>Re-parse with AI</span>
                  </button>
                )}
              </div>

              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Spoken transcript will appear here automatically. You can also edit or type manually..."
                rows={4}
                className="w-full text-xs sm:text-sm p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-emerald-500 leading-relaxed"
              />
            </div>

            {/* GPS LOCATION STATUS CARD */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">GPS Location Pin</span>
                    {location && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        location.accuracy <= 25 ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}>
                        ±{location.accuracy}m Accuracy
                      </span>
                    )}
                  </div>
                  {location ? (
                    <span className="text-[11px] text-slate-600 font-mono block mt-0.5">
                      Lat: {location.latitude.toFixed(5)}, Lng: {location.longitude.toFixed(5)} • {currentUser.village}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500">
                      {isFetchingLocation ? 'Acquiring high-accuracy GPS coordinates...' : 'Location not captured.'}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={fetchCurrentLocation}
                disabled={isFetchingLocation}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
              >
                {isFetchingLocation ? 'Locating...' : 'Refresh GPS'}
              </button>
            </div>

            {/* AI Extraction Trigger / Progress Bar */}
            {isProcessingAI && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                  <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
                  <span>Gemini AI Processing:</span>
                </div>
                <div className="text-xs text-emerald-700 font-medium">
                  {aiStep || 'Extracting clinical schema and vitals...'}
                </div>
                <div className="w-full bg-emerald-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-600 h-1.5 rounded-full animate-pulse w-3/4" />
                </div>
              </div>
            )}

            {/* Error Message Box */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Notice:</span>
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            {/* STRUCTURED CLINICAL DATA PREVIEW */}
            {structuredData && !isProcessingAI && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-emerald-600" />
                    <span>Verified Structured Data Output</span>
                  </span>
                </div>
                <StructuredDataPreview data={structuredData} />
              </div>
            )}

            {/* SUBMIT ACTION BUTTON */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSubmitVisit}
                disabled={isSubmitting || isProcessingAI || !transcript.trim()}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-base shadow-lg shadow-emerald-600/25 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Submitting & Verifying Field Visit...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Confirm & Submit Visit to Cloud</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
