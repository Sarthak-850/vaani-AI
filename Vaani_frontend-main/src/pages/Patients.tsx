import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Patient } from '../types';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  HeartPulse, 
  Calendar,
  ChevronRight,
  Activity
} from 'lucide-react';
import { AddPatientModal } from '../components/modals/AddPatientModal';

export const Patients: React.FC = () => {
  const { patients } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('ALL');
  const [selectedRisk, setSelectedRisk] = useState('ALL');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter patients based on query and dropdowns
  const filteredPatients = patients.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchPhone = p.phone?.toLowerCase().includes(q);
      const matchVillage = p.village ? p.village.toLowerCase().includes(q) : false;
      const matchConditions = p.chronicConditions?.some(c => c.toLowerCase().includes(q));
      if (!matchName && !matchPhone && !matchVillage && !matchConditions) return false;
    }

    if (selectedVillage !== 'ALL' && p.village !== selectedVillage) return false;
    if (selectedRisk !== 'ALL' && p.riskLevel !== selectedRisk) return false;

    return true;
  });

  const villages = Array.from(new Set(patients.map((p) => p.village || 'Bhopal')));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#00D6C7] uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Community Health Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Registered Patients & Beneficiaries
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Prisma database records with longitudinal clinical tracking, risk categorization, and visit history.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-[#050B10] font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(0,214,199,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Patient</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#08131B]/90 backdrop-blur-md rounded-2xl p-4 border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patients by name, phone number, village, or chronic condition..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#050B10] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Village</label>
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              className="w-full p-2 bg-[#050B10] border border-white/10 rounded-lg text-slate-200 font-medium focus:border-teal-500 outline-none"
            >
              <option value="ALL">All Villages ({villages.length})</option>
              {villages.map((vil) => (
                <option key={vil} value={vil}>{vil}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Clinical Risk Level</label>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="w-full p-2 bg-[#050B10] border border-white/10 rounded-lg text-slate-200 font-medium focus:border-teal-500 outline-none"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="LOW">Low (Routine)</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High Risk</option>
              <option value="CRITICAL">Critical Triage</option>
            </select>
          </div>

          <div className="col-span-2 sm:col-span-1 flex items-end">
            <div className="text-xs text-slate-400 font-medium pb-2">
              Showing <span className="text-white font-bold">{filteredPatients.length}</span> verified patients
            </div>
          </div>
        </div>
      </div>

      {/* Patient Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatients.length === 0 ? (
          <div className="col-span-full bg-[#08131B]/90 rounded-2xl p-12 text-center border border-white/5">
            <Users className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-300">No matching patients found</h3>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or register a new patient.</p>
          </div>
        ) : (
          filteredPatients.map((patient) => (
            <div
              key={patient.id}
              onClick={() => setSelectedPatient(patient)}
              className="bg-[#08131B]/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/5 hover:border-teal-500/30 shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-[#00D6C7] transition-colors">
                      {patient.name}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{patient.village}</span>
                      {patient.age && <span>• {patient.age} yrs</span>}
                      {patient.gender && <span>• {patient.gender}</span>}
                    </p>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    patient.riskLevel === 'CRITICAL' ? 'bg-rose-500/15 text-rose-400 border-rose-500/30 animate-pulse' :
                    patient.riskLevel === 'HIGH' ? 'bg-orange-500/15 text-orange-400 border-orange-500/30' :
                    patient.riskLevel === 'MEDIUM' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                    'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {patient.riskLevel || 'LOW'}
                  </span>
                </div>

                {patient.phone && (
                  <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-2">
                    <Phone className="w-3 h-3 text-slate-500" />
                    <span>{patient.phone}</span>
                  </p>
                )}

                {/* Chronic Conditions */}
                {patient.chronicConditions && patient.chronicConditions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {patient.chronicConditions.map((cond, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-slate-300 font-medium"
                      >
                        {cond}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">
                  Registered: {new Date(patient.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="text-[#00D6C7] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Details <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#08131B] border border-white/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedPatient.name}</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Village: {selectedPatient.village} • Age: {selectedPatient.age || 'N/A'} • Gender: {selectedPatient.gender || 'N/A'}
                </p>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="text-slate-400 hover:text-white p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-[#050B10] border border-white/5 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">Contact Number:</span>
                <span className="font-mono">{selectedPatient.phone || 'Not recorded'}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">Risk Assessment:</span>
                <span className="font-bold text-[#43E0B0]">{selectedPatient.riskLevel || 'LOW'}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">Prisma Record ID:</span>
                <span className="font-mono text-[10px] text-slate-400">{selectedPatient.id}</span>
              </div>
            </div>

            {selectedPatient.chronicConditions && selectedPatient.chronicConditions.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Documented Medical Conditions
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPatient.chronicConditions.map((c, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-teal-500/10 border border-teal-500/20 text-[#00D6C7] text-xs font-semibold"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-white/5 flex justify-end">
              <button
                onClick={() => setSelectedPatient(null)}
                className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/15 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      <AddPatientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};
