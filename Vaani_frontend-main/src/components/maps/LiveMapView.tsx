import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Visit, OutbreakCluster, SeverityLevel, VerificationStatus } from '../../types';
import { ShieldCheck, AlertTriangle, User, Activity, AlertCircle } from 'lucide-react';

// Fix default leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Create custom DOM markers
const createCustomMarker = (severity: SeverityLevel, verificationStatus: VerificationStatus) => {
  let bgColor = 'bg-emerald-500';
  let ringColor = 'border-white';
  let pulse = '';

  if (verificationStatus === 'suspicious') {
    bgColor = 'bg-amber-600';
  } else if (severity === 'critical') {
    bgColor = 'bg-rose-600';
    pulse = 'animate-ping';
  } else if (severity === 'high') {
    bgColor = 'bg-orange-500';
  } else if (severity === 'medium') {
    bgColor = 'bg-amber-500';
  }

  const html = `
    <div class="relative flex items-center justify-center w-8 h-8">
      ${severity === 'critical' ? `<span class="absolute w-8 h-8 rounded-full ${bgColor} opacity-60 ${pulse}"></span>` : ''}
      <div class="w-7 h-7 rounded-full ${bgColor} border-2 ${ringColor} shadow-lg flex items-center justify-center text-white text-[11px] font-bold">
        ${severity === 'critical' ? '!' : severity === 'high' ? 'H' : '✓'}
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });
};

const createWorkerMarker = (name: string) => {
  const html = `
    <div class="relative flex items-center justify-center">
      <div class="px-2 py-1 rounded-full bg-slate-900 text-white text-[10px] font-bold shadow-md border border-slate-700 flex items-center gap-1">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>${name.split(' ')[0]}</span>
      </div>
    </div>
  `;
  return L.divIcon({
    className: 'worker-marker',
    html,
    iconSize: [60, 24],
    iconAnchor: [30, 12]
  });
};

// Map Recenter Component
const ChangeView: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

interface LiveMapViewProps {
  visits: Visit[];
  outbreakClusters?: OutbreakCluster[];
  center?: [number, number];
  zoom?: number;
  selectedVisitId?: string;
  onSelectVisit?: (visit: Visit) => void;
  height?: string;
}

export const LiveMapView: React.FC<LiveMapViewProps> = ({
  visits,
  outbreakClusters = [],
  center = [23.2599, 77.4126], // Bhopal sector
  zoom = 13,
  selectedVisitId,
  onSelectVisit,
  height = '420px'
}) => {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100" style={{ height }}>
      
      {/* Map Legend Overlay */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/90 backdrop-blur-md p-2.5 rounded-xl shadow-md border border-slate-200 text-xs flex flex-col gap-1.5 pointer-events-auto">
        <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Live Status</span>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="text-slate-600">Routine / Low</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span className="text-slate-600">Medium Severity</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
          <span className="text-slate-600">High Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
          <span className="text-slate-700 font-semibold">Critical Triage</span>
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <ChangeView center={center} zoom={zoom} />
        
        {/* OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Outbreak Cluster Overlays */}
        {outbreakClusters.map((cluster) => {
          // Approx coordinate for demonstration if village matched
  const villageCoords: Record<string, [number, number]> = {
    'Bhopal': [23.2599, 77.4126],
    'Ward 14': [23.2650, 77.4180],
    'Bhopal Sector 3': [23.2510, 77.4050],
    'Ramnagar': [25.2677, 83.0298],
    'Kalyanpur': [25.2921, 83.0543],
    'Shivdaspur': [25.3114, 82.9812],
    'Chandpur': [25.2410, 83.0110],
    'Bahadurpur': [25.2815, 83.0850]
  };
          const coords = villageCoords[cluster.village] || [25.2677, 83.0298];
          const color = cluster.riskLevel === 'HIGH' || cluster.riskLevel === 'CRITICAL' ? '#ef4444' : '#f59e0b';

          return (
            <Circle
              key={cluster.id}
              center={coords}
              radius={700}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.18,
                weight: 2,
                dashArray: '6, 6'
              }}
            >
              <Popup>
                <div className="p-1">
                  <div className="font-bold text-rose-700 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{cluster.symptomCategory}</span>
                  </div>
                  <div className="text-[11px] text-slate-700 mt-1">
                    <strong>{cluster.village}</strong>: {cluster.currentCases} active cases (vs {cluster.historicalBaseline} baseline)
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {cluster.recommendedAction}
                  </div>
                </div>
              </Popup>
            </Circle>
          );
        })}

        {/* Visit Markers */}
        {visits.map((visit) => {
          if (!visit.latitude || !visit.longitude) return null;

          return (
            <Marker
              key={visit.id}
              position={[visit.latitude, visit.longitude]}
              icon={createCustomMarker(visit.severity, visit.verificationStatus)}
              eventHandlers={{
                click: () => onSelectVisit && onSelectVisit(visit)
              }}
            >
              <Popup className="visit-popup">
                <div className="p-1 max-w-xs">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5 mb-1.5">
                    <span className="font-bold text-slate-900 text-xs">{visit.householdName}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      visit.severity === 'critical' ? 'bg-rose-100 text-rose-700' :
                      visit.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                      visit.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {visit.severity}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 space-y-0.5">
                    <div><strong>ASHA Worker:</strong> {visit.workerName} ({visit.village})</div>
                    <div><strong>Category:</strong> {visit.structuredData.visitType.replace('_', ' ')}</div>
                    {visit.structuredData.patientName && (
                      <div><strong>Patient:</strong> {visit.structuredData.patientName} ({visit.structuredData.patientCategory})</div>
                    )}
                    {visit.structuredData.symptoms.length > 0 && (
                      <div><strong>Symptoms:</strong> {visit.structuredData.symptoms.join(', ')}</div>
                    )}
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">
                      GPS ±{visit.locationAccuracy}m ({visit.verificationStatus})
                    </span>
                    <span className="font-semibold text-emerald-600">
                      {visit.verificationScore}% Verified
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
