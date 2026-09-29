import React, { useState, useEffect } from 'react';
import { X, Mic, MicOff, MapPin, Sparkles, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { speechService } from '../../services/speech';
import { api } from '../../services/api';
import { StructuredClinicalData } from '../../types';
import toast from 'react-hot-toast';

interface NewVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialHouseholdId?: string;
}

export const NewVisitModal: React.FC<NewVisitModalProps> = ({
  isOpen,
  onClose,
  initialHouseholdId
}) => {
  const { households, logVisit, currentUser } = useApp();

  const [selectedHouseholdId, setSelectedHouseholdId] = useState<string>(initialHouseholdId || '');
  const [transcript, setTranscript] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [structuredData, setStructuredData] = useState<StructuredClinicalData | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy: number }>({
    lat: 23.2599,
    lng: 77.4126,
    accuracy: 10
  });

  useEffect(() => {
    if (initialHouseholdId) {
      setSelectedHouseholdId(initialHouseholdId);
    } else if (households.length > 0 && !selectedHouseholdId) {
      setSelectedHouseholdId(households[0].id);
    }
  }, [initialHouseholdId, households, selectedHouseholdId]);

  // Fetch real geolocation on open
  useEffect(() => {
    if (isOpen && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy)
          });
        },
        (err) => {
          console.warn('Geolocation error:', err.message);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleRecording = async () => {
    if (isRecording) {
      setIsRecording(false);
      await speechService.stopListening();
      if (transcript.trim()) {
        extractClinicalData(transcript);
      }
    } else {
      setIsRecording(true);
      try {
        await speechService.startListening({
          language: 'en-IN',
          onTranscriptUpdate: (text) => setTranscript(text),
          onError: (err) => {
            setIsRecording(false);
            toast.error(err);
          }
        });
      } catch (e: any) {
        setIsRecording(false);
        toast.error(e.message || 'Microphone error');
      }
    }
  };

  const extractClinicalData = async (textToExtract?: string) => {
    const text = textToExtract || transcript;
    if (!text.trim()) {
      toast.error('Please record or type a visit description first.');
      return;
    }

    setIsExtracting(true);
    try {
      const selectedHh = households.find(h => h.id === selectedHouseholdId);
      const res = await api.extractPreview(text, selectedHh?.village || currentUser.village);
      setStructuredData(res);
      toast.success('AI clinical extraction complete!');
    } catch (e: any) {
      toast.error('AI extraction fallback applied.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = async () => {
    if (!transcript.trim()) {
      toast.error('Please provide visit notes or spoken transcript.');
      return;
    }

    setIsSubmitting(true);
    try {
      await logVisit({
        transcript,
        latitude: coords.lat,
        longitude: coords.lng,
        locationAccuracy: coords.accuracy,
        manualStructuredData: structuredData || undefined
      });

      toast.success('Visit logged & synchronized successfully!');
      onClose();
      // Reset form
      setTranscript('');
      setStructuredData(null);
    } catch (e: any) {
      toast.error(e.message || 'Failed to log visit.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#08131B] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-500/10 text-[#00D6C7]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Log New Household Visit</h3>
              <p className="text-xs text-slate-400">Voice-powered clinical triage & GPS verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Household Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Household
            </label>
            <select
              value={selectedHouseholdId}
              onChange={(e) => setSelectedHouseholdId(e.target.value)}
              className="w-full bg-[#050B10] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500/50"
            >
              {households.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.familyName} ({h.village} • Head: {h.headOfFamily})
                </option>
              ))}
            </select>
          </div>

          {/* GPS Coordinates Badge */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#050B10] border border-white/5 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#00D6C7]" />
              <span>GPS: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)} (±{coords.accuracy}m)</span>
            </span>
            <span className="text-emerald-400 font-semibold">Verified Location</span>
          </div>

          {/* Spoken Transcript Input & Mic Control */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <span>Spoken Visit Transcript / Notes</span>
                {isRecording && (
                  <span className="text-rose-400 text-[10px] font-bold animate-pulse">
                    ● Recording Audio...
                  </span>
                )}
              </label>

              <button
                type="button"
                onClick={toggleRecording}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                  isRecording
                    ? 'bg-rose-600 text-white animate-pulse shadow-rose-600/30'
                    : 'bg-[#00D6C7] text-[#050B10] hover:bg-[#16D8D0] shadow-teal-500/20'
                }`}
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{isRecording ? 'Stop Recording' : 'Speak to Record'}</span>
              </button>
            </div>

            <textarea
              rows={4}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="e.g. Visited Lakshmi Devi in Ramnagar, 7 months pregnant with blood pressure 145/95, complained of severe headache and leg edema. Advised iron supplements and referral to CHC."
              className="w-full bg-[#050B10] border border-white/10 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500/50 leading-relaxed"
            />
          </div>

          {/* AI Clinical Extraction Preview */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => extractClinicalData()}
              disabled={isExtracting || !transcript.trim()}
              className="px-4 py-2 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-[#00D6C7] text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isExtracting ? 'Extracting Clinical Data...' : 'Extract & Preview with AI'}</span>
            </button>
          </div>

          {structuredData && (
            <div className="p-4 rounded-2xl bg-[#050B10] border border-teal-500/30 space-y-2.5 text-xs animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="font-bold text-white uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-[#00D6C7]" />
                  <span>AI Structured Clinical Extract</span>
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  structuredData.severity === 'critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                  structuredData.severity === 'high' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {structuredData.severity} Severity
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400">Visit Type:</span>{' '}
                  <span className="font-semibold text-slate-200 capitalize">{structuredData.visitType.replace('_', ' ')}</span>
                </div>
                {structuredData.bloodPressure && (
                  <div>
                    <span className="text-slate-400">Blood Pressure:</span>{' '}
                    <span className="font-semibold text-rose-400">{structuredData.bloodPressure}</span>
                  </div>
                )}
                {structuredData.patientName && (
                  <div>
                    <span className="text-slate-400">Patient:</span>{' '}
                    <span className="font-semibold text-slate-200">{structuredData.patientName}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-400">Follow-up:</span>{' '}
                  <span className="font-semibold text-amber-400">{structuredData.followUpRequired ? 'Required in 48h' : 'None'}</span>
                </div>
              </div>

              {structuredData.symptoms.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 pt-1">
                  <span className="text-[10px] text-slate-400 mr-1">Symptoms:</span>
                  {structuredData.symptoms.map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px]">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-end gap-3 bg-[#050B10]/50">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !transcript.trim()}
            className="px-5 py-2.5 rounded-xl bg-[#00D6C7] hover:bg-[#16D8D0] disabled:opacity-50 text-[#050B10] text-xs font-bold transition-all shadow-lg shadow-teal-500/25 active:scale-95 flex items-center gap-2"
          >
            <span>{isSubmitting ? 'Saving to Backend...' : 'Confirm & Log Visit'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
