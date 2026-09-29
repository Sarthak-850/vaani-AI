import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LiveMapView } from '../components/maps/LiveMapView';
import { Map, MapPin, AlertCircle, ShieldCheck, Activity, Users } from 'lucide-react';

export const FieldMap: React.FC = () => {
  const { visits, outbreakClusters, patients } = useApp();
  const [selectedVillage, setSelectedVillage] = useState('ALL');

  const filteredVisits = selectedVillage === 'ALL'
    ? visits
    : visits.filter((v) => v.village === selectedVillage);

  const villages = Array.from(new Set(visits.map((v) => v.village)));

  // Bhopal district default center
  const centerCoord: [number, number] = [23.2599, 77.4126];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#00D6C7] uppercase tracking-wider">
            <Map className="w-4 h-4" />
            <span>Geospatial Field Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            GIS Health Surveillance & Outbreak Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time GPS verified field visits, syndromic disease clusters, and high-risk case mapping across rural sectors.
          </p>
        </div>

        {/* Village Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Sector:</span>
          <select
            value={selectedVillage}
            onChange={(e) => setSelectedVillage(e.target.value)}
            className="text-xs font-bold bg-[#08131B] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-teal-500"
          >
            <option value="ALL">All Sectors ({villages.length})</option>
            {villages.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Map Stats Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#08131B]/90 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Mapped Visits</span>
            <span className="text-xl sm:text-2xl font-bold text-white mt-0.5 block">{filteredVisits.length}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-teal-500/15 text-[#00D6C7] flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#08131B]/90 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Clusters</span>
            <span className="text-xl sm:text-2xl font-bold text-rose-400 mt-0.5 block">{outbreakClusters.length}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#08131B]/90 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Verified Locations</span>
            <span className="text-xl sm:text-2xl font-bold text-[#43E0B0] mt-0.5 block">
              {filteredVisits.filter(v => v.verificationStatus === 'verified').length}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-[#43E0B0] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#08131B]/90 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Patients</span>
            <span className="text-xl sm:text-2xl font-bold text-white mt-0.5 block">{patients.length}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="bg-[#08131B]/90 backdrop-blur-md rounded-3xl p-2 border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] overflow-hidden">
        <LiveMapView
          visits={filteredVisits}
          outbreakClusters={outbreakClusters}
          center={centerCoord}
          zoom={12}
          height="580px"
        />
      </div>
    </div>
  );
};
