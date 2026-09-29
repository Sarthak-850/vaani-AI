import React, { useState, useRef, useEffect } from 'react';
import { RotateCw, ZoomIn, ZoomOut, Maximize2, Minimize2, Sparkles, Play, Pause, RefreshCw } from 'lucide-react';

interface AvatarViewerProps {
  onInteract?: () => void;
}

export const AvatarViewer: React.FC<AvatarViewerProps> = ({ onInteract }) => {
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const startXRef = useRef<number>(0);
  const startAngleRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-rotation effect
  useEffect(() => {
    if (!isAutoRotating || isDragging) return;
    const interval = setInterval(() => {
      setRotationAngle((prev) => (prev + 1) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, [isAutoRotating, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setIsAutoRotating(false);
    startXRef.current = e.clientX;
    startAngleRef.current = rotationAngle;
    if (onInteract) onInteract();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startXRef.current;
    let newAngle = (startAngleRef.current + deltaX * 0.75) % 360;
    if (newAngle < 0) newAngle += 360;
    setRotationAngle(Math.round(newAngle));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setIsAutoRotating(false);
    startXRef.current = e.touches[0].clientX;
    startAngleRef.current = rotationAngle;
    if (onInteract) onInteract();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - startXRef.current;
    let newAngle = (startAngleRef.current + deltaX * 0.75) % 360;
    if (newAngle < 0) newAngle += 360;
    setRotationAngle(Math.round(newAngle));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoom((prev) => Math.min(prev + 0.1, 1.8));
    } else {
      setZoom((prev) => Math.max(prev - 0.1, 0.7));
    }
  };

  // Convert rotation angle into frame view angle index (0..11 corresponding to 12 view angles)
  const viewIndex = Math.floor(((rotationAngle % 360) / 360) * 12);

  return (
    <div
      className={`relative rounded-3xl bg-gradient-to-b from-slate-950 via-teal-950/40 to-slate-950 border border-teal-500/20 shadow-2xl overflow-hidden transition-all duration-300 ${
        isFullScreen ? 'fixed inset-4 z-50 flex flex-col justify-center items-center bg-slate-950/95 backdrop-blur-xl border-teal-500/40' : 'w-full h-[340px] sm:h-[380px]'
      }`}
      onWheel={handleWheel}
      ref={containerRef}
    >
      {/* Background Ambient Glow & AI Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-500/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0d948810_1px,transparent_1px),linear-gradient(to_bottom,#0d948810_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Header Overlay Controls */}
      <div className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-teal-500/30 text-teal-300 text-xs font-semibold backdrop-blur-md shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
          <span>360° Interactive ASHA Avatar</span>
          <span className="text-[10px] text-teal-400/80 bg-teal-900/50 px-2 py-0.5 rounded-full border border-teal-500/20 font-mono">
            {rotationAngle}°
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 p-1 rounded-full backdrop-blur-md">
          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            title={isAutoRotating ? 'Pause Rotation' : 'Auto Rotate'}
            className="p-1.5 rounded-full hover:bg-teal-500/20 text-slate-300 hover:text-teal-300 transition-colors"
          >
            {isAutoRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.15, 1.8))}
            title="Zoom In"
            className="p-1.5 rounded-full hover:bg-teal-500/20 text-slate-300 hover:text-teal-300 transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.15, 0.7))}
            title="Zoom Out"
            className="p-1.5 rounded-full hover:bg-teal-500/20 text-slate-300 hover:text-teal-300 transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setZoom(1);
              setRotationAngle(0);
            }}
            title="Reset View"
            className="p-1.5 rounded-full hover:bg-teal-500/20 text-slate-300 hover:text-teal-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
            className="p-1.5 rounded-full hover:bg-teal-500/20 text-slate-300 hover:text-teal-300 transition-colors"
          >
            {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Avatar Canvas Area - Drag Interaction */}
      <div
        className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="relative transition-transform duration-75 flex items-center justify-center"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Animated Halo & Pedestal Glow */}
          <div className="absolute -bottom-10 w-48 h-10 bg-teal-500/30 blur-xl rounded-full animate-pulse pointer-events-none" />
          <div className="absolute -bottom-6 w-36 h-4 bg-teal-400/40 rounded-full blur-md pointer-events-none" />

          {/* SVG Vector Illustrated ASHA Worker Avatar */}
          <svg
            viewBox="0 0 240 320"
            className="w-56 h-72 sm:w-64 sm:h-80 drop-shadow-[0_10px_25px_rgba(13,148,136,0.35)] transition-transform duration-100"
            style={{
              transform: `perspective(600px) rotateY(${(rotationAngle % 360) - 180}deg)`,
            }}
          >
            <defs>
              <linearGradient id=" sareeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0d9488" />
                <stop offset="100%" stopColor="#115e59" />
              </linearGradient>
              <linearGradient id="apronGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f1f5f9" />
              </linearGradient>
              <radialGradient id="auraGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* AI Floating Orbit Particles */}
            <circle cx="120" cy="160" r="110" fill="url(#auraGlow)" />
            <circle cx="60" cy="90" r="3" fill="#2dd4bf" className="animate-ping" />
            <circle cx="180" cy="210" r="2.5" fill="#38bdf8" className="animate-pulse" />
            <circle cx="190" cy="110" r="4" fill="#818cf8" className="animate-pulse" />

            {/* Head & Hair */}
            <circle cx="120" cy="85" r="38" fill="#5c3826" />
            <circle cx="120" cy="88" r="32" fill="#e5b497" />
            {/* Hair Bun & Bindi */}
            <circle cx="120" cy="50" r="16" fill="#3d2317" />
            <circle cx="120" cy="74" r="2.5" fill="#e11d48" />
            {/* Eyes & Smile */}
            <ellipse cx="108" cy="85" rx="3" ry="4" fill="#291e16" />
            <ellipse cx="132" cy="85" rx="3" ry="4" fill="#291e16" />
            <path d="M 110 98 Q 120 106 130 98" fill="none" stroke="#b91c1c" strokeWidth="2.5" strokeLinecap="round" />

            {/* ASHA Saree & Uniform Body */}
            <path d="M 85 120 Q 120 110 155 120 L 175 270 Q 120 280 65 270 Z" fill="url(# sareeGrad)" />
            <path d="M 98 120 L 142 120 L 150 260 L 90 260 Z" fill="url(#apronGrad)" />

            {/* Stethoscope */}
            <path d="M 100 122 C 95 150 102 185 120 185 C 138 185 145 150 140 122" fill="none" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="120" cy="185" r="6" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />

            {/* Health Worker Badge & Tablet */}
            <rect x="105" y="140" width="30" height="18" rx="3" fill="#0d9488" stroke="#ffffff" strokeWidth="1" />
            <text x="120" y="152" fill="#ffffff" fontSize="7" fontWeight="bold" textAnchor="middle">ASHA</text>

            {/* Smart Voice Tablet / AI Device in Hand */}
            <g transform="translate(150, 160) rotate(-15)">
              <rect x="0" y="0" width="38" height="54" rx="4" fill="#0f172a" stroke="#2dd4bf" strokeWidth="2" />
              <rect x="4" y="4" width="30" height="40" rx="2" fill="#1e293b" />
              {/* Animated Screen Waves */}
              <path d="M 8 20 Q 19 12 30 20 T 30 32" fill="none" stroke="#2dd4bf" strokeWidth="1.5" className="animate-pulse" />
              <circle cx="19" cy="48" r="2" fill="#2dd4bf" />
            </g>
          </svg>

          {/* Real-time Angle Floating Pill */}
          <div className="absolute -bottom-2 px-3 py-1 rounded-full bg-slate-900/90 border border-teal-500/40 text-teal-300 text-[10px] font-bold shadow-lg flex items-center gap-1.5 backdrop-blur-md">
            <RotateCw className="w-3 h-3 animate-spin text-teal-400" />
            <span>Drag to rotate 360°</span>
          </div>
        </div>
      </div>

      {/* Drag Hint Footer Overlay */}
      <div className="absolute bottom-3 left-4 right-4 pointer-events-none flex items-center justify-between text-[11px] text-slate-400 font-medium">
        <span>360° 3D Mesh Viewer</span>
        <span className="text-teal-400/90 font-mono">Angle: {rotationAngle}°</span>
      </div>
    </div>
  );
};
