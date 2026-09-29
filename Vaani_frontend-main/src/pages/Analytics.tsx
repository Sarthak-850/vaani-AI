import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  CartesianGrid, 
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  Activity, 
  ShieldCheck, 
  MapPin, 
  AlertCircle, 
  Stethoscope, 
  Filter 
} from 'lucide-react';

const COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const Analytics: React.FC = () => {
  const { visits, outbreakClusters, households, users } = useApp();
  const [selectedVillage, setSelectedVillage] = useState<string>('ALL');

  const filteredVisits = selectedVillage === 'ALL'
    ? visits
    : visits.filter((v) => v.village === selectedVillage);

  // 1. Visits by Category Breakdown
  const categoryCountMap: Record<string, number> = {};
  filteredVisits.forEach((v) => {
    const cat = v.structuredData.visitType.replace('_', ' ');
    categoryCountMap[cat] = (categoryCountMap[cat] || 0) + 1;
  });

  const categoryChartData = Object.entries(categoryCountMap).map(([name, value]) => ({
    name: name.toUpperCase(),
    value
  }));

  // 2. Daily Visits Trend
  const dailyVisitsData = [
    { date: 'Aug 17', visits: 12, fever: 3, anc: 4 },
    { date: 'Aug 18', visits: 16, fever: 5, anc: 6 },
    { date: 'Aug 19', visits: 19, fever: 8, anc: 5 },
    { date: 'Aug 20', visits: 24, fever: 11, anc: 7 },
    { date: 'Aug 21', visits: 22, fever: 14, anc: 5 },
    { date: 'Aug 22', visits: 28, fever: 19, anc: 8 },
    { date: 'Aug 23', visits: filteredVisits.length, fever: 21, anc: 9 }
  ];

  // 3. Severity Distribution
  const severityData = [
    { name: 'Low / Routine', count: filteredVisits.filter((v) => v.severity === 'low').length, color: '#10b981' },
    { name: 'Medium', count: filteredVisits.filter((v) => v.severity === 'medium').length, color: '#f59e0b' },
    { name: 'High Risk', count: filteredVisits.filter((v) => v.severity === 'high').length, color: '#f97316' },
    { name: 'Critical Triage', count: filteredVisits.filter((v) => v.severity === 'critical').length, color: '#ef4444' }
  ];

  // 4. Village Comparison
  const villageVisitsMap: Record<string, { total: number; highRisk: number }> = {};
  visits.forEach((v) => {
    if (!villageVisitsMap[v.village]) villageVisitsMap[v.village] = { total: 0, highRisk: 0 };
    villageVisitsMap[v.village].total += 1;
    if (v.severity === 'high' || v.severity === 'critical') {
      villageVisitsMap[v.village].highRisk += 1;
    }
  });

  const villageBarData = Object.entries(villageVisitsMap).map(([village, data]) => ({
    village,
    totalVisits: data.total,
    highRiskCases: data.highRisk
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#00D6C7] uppercase tracking-wider">
            <Activity className="w-4 h-4" />
            <span>Epidemiological Surveillance & Disease Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Health Analytics & Outbreak Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Automated cluster detection from aggregated voice logs across rural sectors.
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
            <option value="ALL">All 5 Sectors (Bhopal District)</option>
            <option value="Bhopal Sector 3">Bhopal Sector 3</option>
            <option value="Ward 14">Ward 14</option>
            <option value="Kolar Road">Kolar Road</option>
            <option value="MP Nagar">MP Nagar</option>
            <option value="Bairagarh">Bairagarh</option>
          </select>
        </div>
      </div>

      {/* OUTBREAK SURVEILLANCE CARDS */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>Active Syndromic Outbreak Cluster Detections</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {outbreakClusters.map((cluster) => (
            <div
              key={cluster.id}
              className={`p-5 rounded-3xl border shadow-[0_4px_20px_rgba(0,0,0,0.3)] space-y-3 bg-[#08131B]/90 backdrop-blur-md ${
                cluster.riskLevel === 'HIGH' ? 'border-rose-500/40 ring-1 ring-rose-500/20' : 'border-amber-500/30'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Village {cluster.village}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-0.5">
                    {cluster.symptomCategory}
                  </h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  cluster.riskLevel === 'HIGH' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                }`}>
                  {cluster.riskLevel} SPIKE
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#050B10] border border-white/5 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">Reported Cases</span>
                  <span className="text-lg font-black text-rose-400">{cluster.currentCases} cases</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Baseline Avg</span>
                  <span className="text-sm font-bold text-slate-300">{cluster.historicalBaseline} / week</span>
                </div>
              </div>

              <div className="text-xs text-slate-300 bg-amber-950/20 p-2.5 rounded-xl border border-amber-500/20">
                <span className="font-bold text-amber-400 block mb-0.5">Recommended Protocol:</span>
                <span className="text-[11px] text-amber-200/90">{cluster.recommendedAction}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Visit Volume & Fever Spike Trend */}
        <div className="bg-[#08131B]/90 backdrop-blur-md p-5 rounded-3xl border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">7-Day Field Visit & Febrile Trend</h3>
              <p className="text-xs text-slate-400">Correlation between total visits and acute fever cases</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyVisitsData}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D6C7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00D6C7" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFever" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#050B10', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px', color: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                <Area type="monotone" dataKey="visits" name="Total Visits" stroke="#00D6C7" fillOpacity={1} fill="url(#colorVisits)" strokeWidth={2} />
                <Area type="monotone" dataKey="fever" name="Fever Spike" stroke="#f43f5e" fillOpacity={1} fill="url(#colorFever)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Village Health Distribution Comparison */}
        <div className="bg-[#08131B]/90 backdrop-blur-md p-5 rounded-3xl border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Visits & High Risk Cases by Village</h3>
              <p className="text-xs text-slate-400">Comparative field activity across rural sectors</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={villageBarData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="village" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#050B10', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px', color: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                <Bar dataKey="totalVisits" name="Total Visits" fill="#00D6C7" radius={[6, 6, 0, 0]} />
                <Bar dataKey="highRiskCases" name="High Risk Cases" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Visit Category Breakdown */}
        <div className="bg-[#08131B]/90 backdrop-blur-md p-5 rounded-3xl border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Healthcare Service Category Breakdown</h3>
            <p className="text-xs text-slate-400">Distribution of maternal, pediatric, and immunization visits</p>
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#050B10', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px', color: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Clinical Severity Proportions */}
        <div className="bg-[#08131B]/90 backdrop-blur-md p-5 rounded-3xl border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Clinical Severity Breakdown</h3>
            <p className="text-xs text-slate-400">Triage levels assigned by AI Clinical Extraction Agent</p>
          </div>

          <div className="space-y-3 pt-3">
            {severityData.map((sev) => (
              <div key={sev.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-300">{sev.name}</span>
                  <span className="font-mono text-white">{sev.count} visits</span>
                </div>
                <div className="w-full bg-[#050B10] border border-white/5 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      backgroundColor: sev.color,
                      width: `${filteredVisits.length > 0 ? (sev.count / filteredVisits.length) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
