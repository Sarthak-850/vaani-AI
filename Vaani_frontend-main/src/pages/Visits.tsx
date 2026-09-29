import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { VisitCard } from '../components/visits/VisitCard';
import { Search, Filter, MapPin, Calendar, Activity, ShieldCheck, Download } from 'lucide-react';
import { SeverityLevel, VerificationStatus, VisitCategory } from '../types';

export const Visits: React.FC = () => {
  const { visits, currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVillage, setSelectedVillage] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedVerification, setSelectedVerification] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Filter visits
  const filteredVisits = visits.filter((v) => {
    // If worker role, show their visits or all in their village
    if (currentUser.role === 'asha_worker' && v.workerId !== currentUser.uid && v.village !== currentUser.village) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = v.householdName.toLowerCase().includes(q);
      const matchPatient = v.structuredData.patientName?.toLowerCase().includes(q);
      const matchTranscript = v.transcript.toLowerCase().includes(q);
      const matchSymptoms = v.structuredData.symptoms.some((s) => s.toLowerCase().includes(q));
      if (!matchName && !matchPatient && !matchTranscript && !matchSymptoms) return false;
    }

    if (selectedVillage !== 'ALL' && v.village !== selectedVillage) return false;
    if (selectedSeverity !== 'ALL' && v.severity !== selectedSeverity) return false;
    if (selectedVerification !== 'ALL' && v.verificationStatus !== selectedVerification) return false;
    if (selectedCategory !== 'ALL' && v.structuredData.visitType !== selectedCategory) return false;

    return true;
  });

  const villages = Array.from(new Set(visits.map((v) => v.village)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Field Visits Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {filteredVisits.length} visits recorded with GPS verification and AI clinical parsing
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#08131B]/90 backdrop-blur-md rounded-2xl p-4 border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by household name, patient, symptoms, or keywords..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#050B10] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Village</label>
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              className="w-full p-2 bg-[#050B10] border border-white/10 rounded-lg text-slate-200 font-medium focus:border-teal-500 outline-none"
            >
              <option value="ALL">All Villages</option>
              {villages.map((vil) => (
                <option key={vil} value={vil}>{vil}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Clinical Severity</label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full p-2 bg-[#050B10] border border-white/10 rounded-lg text-slate-200 font-medium focus:border-teal-500 outline-none"
            >
              <option value="ALL">All Severities</option>
              <option value="low">Low (Routine)</option>
              <option value="medium">Medium</option>
              <option value="high">High Risk</option>
              <option value="critical">Critical Triage</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">GPS Verification</label>
            <select
              value={selectedVerification}
              onChange={(e) => setSelectedVerification(e.target.value)}
              className="w-full p-2 bg-[#050B10] border border-white/10 rounded-lg text-slate-200 font-medium focus:border-teal-500 outline-none"
            >
              <option value="ALL">All Verification Status</option>
              <option value="verified">Verified (Score &gt; 80%)</option>
              <option value="warning">GPS Warning</option>
              <option value="suspicious">Needs Review</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Visit Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 bg-[#050B10] border border-white/10 rounded-lg text-slate-200 font-medium focus:border-teal-500 outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="child_health">Child Health</option>
              <option value="antenatal_care">Antenatal Care (ANC)</option>
              <option value="postnatal_care">Postnatal Care (PNC)</option>
              <option value="immunization">Immunization</option>
              <option value="malnutrition">Malnutrition (SAM/MAM)</option>
              <option value="elderly_care">Elderly Care</option>
            </select>
          </div>
        </div>
      </div>

      {/* Visits List */}
      <div className="space-y-3">
        {filteredVisits.length === 0 ? (
          <div className="bg-[#08131B]/90 rounded-2xl p-12 text-center border border-white/5">
            <Activity className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-300">No matching visits found</h3>
            <p className="text-xs text-slate-500 mt-1">Try resetting your search query or filters.</p>
          </div>
        ) : (
          filteredVisits.map((visit) => (
            <VisitCard key={visit.id} visit={visit} />
          ))
        )}
      </div>
    </div>
  );
};
