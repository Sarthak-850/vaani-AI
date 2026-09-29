import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { speechService } from '../services/speech';
import { 
  Settings as SettingsIcon, 
  Globe, 
  Volume2, 
  Wifi, 
  User, 
  Shield, 
  Check, 
  Bell,
  Smartphone
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { currentUser } = useApp();
  const [language, setLanguageState] = useState<'hi' | 'en'>(
    (localStorage.getItem('vaani_language') as 'hi' | 'en') || 'hi'
  );
  const [audioFeedback, setAudioFeedback] = useState(true);
  const [offlinePrefetch, setOfflinePrefetch] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleLanguageChange = (lang: 'hi' | 'en') => {
    setLanguageState(lang);
    localStorage.setItem('vaani_language', lang);
  };

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#00D6C7] uppercase tracking-wider">
          <SettingsIcon className="w-4 h-4" />
          <span>System Preferences</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
          Settings & Worker Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure speech recognition languages, audio feedback, offline sync tolerances, and field device permissions.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-[#43E0B0] flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Settings saved successfully.</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-[#08131B]/90 backdrop-blur-md rounded-3xl p-6 border border-white/5 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-[#00D6C7]" />
          <span>Field Health Worker Identity</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#050B10] border border-white/5 space-y-1">
            <span className="text-slate-400">Authenticated Name:</span>
            <div className="font-bold text-white text-sm">{currentUser.name}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#050B10] border border-white/5 space-y-1">
            <span className="text-slate-400">Designation / Role:</span>
            <div className="font-bold text-[#00D6C7] capitalize">{currentUser.role.replace('_', ' ')}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#050B10] border border-white/5 space-y-1">
            <span className="text-slate-400">Assigned Village / Sector:</span>
            <div className="font-bold text-white">{currentUser.village || 'Bhopal District'}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#050B10] border border-white/5 space-y-1">
            <span className="text-slate-400">Worker Unique ID:</span>
            <div className="font-mono text-slate-300">{currentUser.uid}</div>
          </div>
        </div>
      </div>

      {/* Voice & Language Preferences */}
      <div className="bg-[#08131B]/90 backdrop-blur-md rounded-3xl p-6 border border-white/5 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#00D6C7]" />
          <span>Voice & Language Configuration</span>
        </h3>

        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-2xl bg-[#050B10] border border-white/5 flex items-center justify-between">
            <div>
              <span className="font-bold text-white block">Default Spoken Language</span>
              <span className="text-slate-400">Language model used for Web Speech recognition and entity extraction</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleLanguageChange('hi')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                  language === 'hi'
                    ? 'bg-teal-500/20 text-[#00D6C7] border border-teal-500/40 shadow-[0_0_10px_rgba(0,214,199,0.2)]'
                    : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
                }`}
              >
                हिंदी (Hindi)
              </button>
              <button
                onClick={() => handleLanguageChange('en')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                  language === 'en'
                    ? 'bg-teal-500/20 text-[#00D6C7] border border-teal-500/40 shadow-[0_0_10px_rgba(0,214,199,0.2)]'
                    : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
                }`}
              >
                English
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#050B10] border border-white/5 flex items-center justify-between">
            <div>
              <span className="font-bold text-white block">Speech Feedback (TTS Audio)</span>
              <span className="text-slate-400">Vaani speaks clinical confirmations and warnings aloud</span>
            </div>
            <button
              onClick={() => setAudioFeedback(!audioFeedback)}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                audioFeedback ? 'bg-teal-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  audioFeedback ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Offline & Device Settings */}
      <div className="bg-[#08131B]/90 backdrop-blur-md rounded-3xl p-6 border border-white/5 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-[#00D6C7]" />
          <span>Offline & Field Optimization</span>
        </h3>

        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-2xl bg-[#050B10] border border-white/5 flex items-center justify-between">
            <div>
              <span className="font-bold text-white block">Auto-Prefetch Village Cohort</span>
              <span className="text-slate-400">Download patient and household records for offline operation</span>
            </div>
            <button
              onClick={() => setOfflinePrefetch(!offlinePrefetch)}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                offlinePrefetch ? 'bg-teal-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  offlinePrefetch ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-[#050B10] font-bold text-xs shadow-[0_0_20px_rgba(0,214,199,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
