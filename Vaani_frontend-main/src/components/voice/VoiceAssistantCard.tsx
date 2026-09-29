import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Activity, Sparkles, Volume2, AlertCircle } from 'lucide-react';
import { speechService } from '../../services/speech';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

interface VoiceAssistantCardProps {
  onTranscriptReady?: (transcript: string) => void;
  onListeningChange?: (isListening: boolean) => void;
}

export const VoiceAssistantCard: React.FC<VoiceAssistantCardProps> = ({
  onTranscriptReady,
  onListeningChange
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(20);
  const [statusMessage, setStatusMessage] = useState<string>('Tap microphone to speak');
  const [transcript, setTranscript] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [language, setLanguage] = useState<'hi-IN' | 'en-IN'>('en-IN');

  useEffect(() => {
    if (onListeningChange) {
      onListeningChange(isListening);
    }
  }, [isListening, onListeningChange]);

  const startListening = async () => {
    try {
      setStatusMessage('Listening...');
      setIsListening(true);
      setTranscript('');

      await speechService.startListening({
        language,
        onTranscriptUpdate: (fullTranscript, isFinal) => {
          setTranscript(fullTranscript);
          if (isFinal) {
            handleProcessTranscript(fullTranscript);
          }
        },
        onError: (err) => {
          setStatusMessage('Connection unavailable');
          setIsListening(false);
          toast.error(err);
        },
        onAudioLevel: (level) => {
          setAudioLevel(Math.max(15, level));
        }
      });
    } catch (e: any) {
      setStatusMessage('Connection unavailable');
      setIsListening(false);
      toast.error(e.message || 'Microphone access failed');
    }
  };

  const stopListening = async () => {
    setIsListening(false);
    setStatusMessage('Vaani is thinking...');
    setIsProcessing(true);

    try {
      await speechService.stopListening();
      if (transcript.trim()) {
        await handleProcessTranscript(transcript);
      } else {
        setStatusMessage('Tap microphone to speak');
        setIsProcessing(false);
      }
    } catch (e) {
      setStatusMessage('Tap microphone to speak');
      setIsProcessing(false);
    }
  };

  const handleProcessTranscript = async (text: string) => {
    if (!text.trim()) return;
    setIsProcessing(true);
    setStatusMessage('Vaani is thinking...');

    try {
      if (onTranscriptReady) {
        onTranscriptReady(text);
      }
      setStatusMessage('Vaani is ready');
      toast.success('Clinical transcript processed by Vaani AI');
    } catch (e) {
      setStatusMessage('Vaani is ready');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Waveform heights calculation
  const waveformHeights = [
    30, 65, 45, 80, 95, 60, 85, 50, 90, 75, 40, 70, 85, 60, 40
  ];

  return (
    <div className="vaani-glass rounded-2xl p-4 sm:p-5 border border-white/10 shadow-xl relative overflow-hidden backdrop-blur-xl">
      {/* Background Accent Subtle Glow */}
      <div className="absolute -top-12 -left-12 w-36 h-36 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-teal-500/15 text-[#00D6C7]">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Voice Assistant</h3>
            <p className="text-[11px] text-[#94A3B8] font-medium transition-colors">
              {statusMessage}
            </p>
          </div>
        </div>

        {/* Language Selector Pill */}
        <div className="flex items-center bg-[#050B10]/80 p-0.5 rounded-lg border border-white/10 text-[10px] font-bold">
          <button
            onClick={() => setLanguage('en-IN')}
            className={`px-2 py-0.5 rounded-md transition-all ${
              language === 'en-IN' ? 'bg-[#00D6C7] text-[#050B10]' : 'text-slate-400 hover:text-white'
            }`}
          >
            ENG
          </button>
          <button
            onClick={() => setLanguage('hi-IN')}
            className={`px-2 py-0.5 rounded-md transition-all ${
              language === 'hi-IN' ? 'bg-[#00D6C7] text-[#050B10]' : 'text-slate-400 hover:text-white'
            }`}
          >
            हिंदी
          </button>
        </div>
      </div>

      {/* Audio Waveform Display */}
      <div className="h-14 sm:h-16 flex items-center justify-center gap-1.5 px-3 mb-5">
        {waveformHeights.map((h, i) => {
          const dynamicHeight = isListening
            ? Math.min(100, Math.max(18, (audioLevel * ((i % 5) + 1) * 0.4)))
            : 22;

          return (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-150 ${
                isListening
                  ? 'bg-gradient-to-t from-[#00D6C7] to-[#43E0B0] shadow-[0_0_8px_#00D6C7]'
                  : 'bg-slate-700/60'
              }`}
              style={{
                height: `${isListening ? dynamicHeight : (i % 2 === 0 ? 18 : 28)}%`
              }}
            />
          );
        })}
      </div>

      {/* Center Big Circular Glowing Mic Button */}
      <div className="flex flex-col items-center justify-center">
        <button
          onClick={toggleMic}
          aria-label={isListening ? 'Stop listening' : 'Start voice recording'}
          className={`relative p-5 rounded-full transition-all duration-300 shadow-2xl group ${
            isListening
              ? 'bg-gradient-to-tr from-rose-600 to-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.6)] scale-105'
              : 'bg-gradient-to-tr from-[#00D6C7] to-[#16D8D0] shadow-[0_0_28px_rgba(0,214,199,0.55)] hover:scale-105 active:scale-95'
          }`}
        >
          {/* Subtle Outer Neon Ring Pulse */}
          <span
            className={`absolute -inset-1.5 rounded-full border transition-opacity duration-300 ${
              isListening
                ? 'border-rose-500/60 animate-ping'
                : 'border-[#00D6C7]/50 group-hover:opacity-100 opacity-60'
            }`}
          />

          {isListening ? (
            <MicOff className="w-6 h-6 text-white" />
          ) : (
            <Mic className="w-6 h-6 text-[#050B10] group-hover:scale-110 transition-transform" />
          )}
        </button>

        {/* Live Transcript Bubble */}
        {transcript && (
          <div className="mt-4 w-full p-2.5 rounded-xl bg-[#050B10]/80 border border-teal-500/20 text-xs text-slate-300 italic text-center animate-in fade-in duration-200">
            "{transcript}"
          </div>
        )}
      </div>
    </div>
  );
};
