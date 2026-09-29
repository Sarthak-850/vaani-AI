import React, { useState, useRef, useEffect } from 'react';
import { RotateCw, ZoomIn, ZoomOut, Maximize2, Minimize2, RefreshCw } from 'lucide-react';

interface VaaniAvatarCenterpieceProps {
  isListening?: boolean;
  onInteract?: () => void;
}

export const VaaniAvatarCenterpiece: React.FC<VaaniAvatarCenterpieceProps> = ({
  isListening = false,
  onInteract
}) => {
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const startXRef = useRef<number>(0);
  const startAngleRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-rotation effect (slow gentle drift if enabled)
  useEffect(() => {
    if (!isAutoRotating || isDragging) return;
    const interval = setInterval(() => {
      setRotationAngle((prev) => (prev + 1) % 360);
    }, 50);
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
    let newAngle = (startAngleRef.current + deltaX * 0.6) % 360;
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
    let newAngle = (startAngleRef.current + deltaX * 0.6) % 360;
    if (newAngle < 0) newAngle += 360;
    setRotationAngle(Math.round(newAngle));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoom((prev) => Math.min(prev + 0.1, 1.6));
    } else {
      setZoom((prev) => Math.max(prev - 0.1, 0.75));
    }
  };

  // Convert rotation to a 3D perspective angle
  const clampedAngle = ((rotationAngle % 360) + 360) % 360;
  // Calculate subtle 3D tilt
  const tiltY = ((clampedAngle > 180 ? clampedAngle - 360 : clampedAngle) * 0.4);

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      className={`relative flex flex-col items-center justify-between select-none overflow-hidden transition-all duration-300 ${
        isFullScreen
          ? 'fixed inset-4 z-50 bg-[#050B10]/95 backdrop-blur-2xl border border-teal-500/40 rounded-3xl p-6 shadow-2xl'
          : 'w-full h-full min-h-[460px] sm:min-h-[520px]'
      }`}
    >
      {/* Background Ambient Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-500/12 via-teal-950/5 to-transparent pointer-events-none" />

      {/* Floating Right-Side Controls (matching reference screenshot) */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2">
        {/* 360° Indicator Pill */}
        <div className="px-2.5 py-1 rounded-full bg-[#08131B]/90 border border-slate-700/80 text-white text-[11px] font-bold shadow-lg backdrop-blur-md">
          360°
        </div>

        {/* Reset View Button */}
        <button
          onClick={() => {
            setRotationAngle(0);
            setZoom(1);
          }}
          title="Reset rotation & zoom"
          className="w-8 h-8 rounded-full bg-[#08131B]/90 hover:bg-teal-500/20 text-slate-300 hover:text-teal-300 border border-slate-700/80 flex items-center justify-center transition-all shadow-md"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* Zoom In Button */}
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.15, 1.6))}
          title="Zoom in"
          className="w-8 h-8 rounded-full bg-[#08131B]/90 hover:bg-teal-500/20 text-slate-300 hover:text-teal-300 border border-slate-700/80 flex items-center justify-center transition-all shadow-md text-sm font-bold"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        {/* Zoom Out Button */}
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.15, 0.75))}
          title="Zoom out"
          className="w-8 h-8 rounded-full bg-[#08131B]/90 hover:bg-teal-500/20 text-slate-300 hover:text-teal-300 border border-slate-700/80 flex items-center justify-center transition-all shadow-md text-sm font-bold"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        {/* Fullscreen / Focus Button */}
        <button
          onClick={() => setIsFullScreen(!isFullScreen)}
          title={isFullScreen ? 'Exit focus' : 'Focus character'}
          className="w-8 h-8 rounded-full bg-[#08131B]/90 hover:bg-teal-500/20 text-slate-300 hover:text-teal-300 border border-slate-700/80 flex items-center justify-center transition-all shadow-md"
        >
          {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Main Interactive Character Stage */}
      <div
        className="w-full flex-1 flex items-center justify-center cursor-grab active:cursor-grabbing relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="relative flex items-center justify-center transition-transform duration-75"
          style={{
            transform: `scale(${zoom})`,
          }}
        >
          {/* Neon Teal Circular Base Pedestal Ring */}
          <div
            className={`absolute bottom-6 w-56 sm:w-64 h-12 rounded-[50%] border-2 transition-all duration-300 pointer-events-none ${
              isListening
                ? 'border-[#00D6C7] shadow-[0_0_35px_#00D6C7,inset_0_0_20px_#00D6C7]'
                : 'border-[#00D6C7]/80 shadow-[0_0_24px_rgba(0,214,199,0.5),inset_0_0_15px_rgba(0,214,199,0.3)]'
            }`}
          />
          <div className="absolute bottom-4 w-48 sm:w-56 h-8 rounded-[50%] bg-[#00D6C7]/15 blur-md pointer-events-none" />

          {/* High-Resolution Vaani ASHA Character Image */}
          <div
            className="relative transition-transform duration-100 ease-out"
            style={{
              transform: `perspective(800px) rotateY(${tiltY}deg)`,
              transformStyle: 'preserve-3d',
            }}
          >
            <img
              src="/assets/vaani-character.png"
              alt="Vaani AI Healthcare Assistant"
              className="max-h-[380px] sm:max-h-[440px] w-auto object-contain drop-shadow-[0_12px_30px_rgba(0,214,199,0.25)] select-none pointer-events-none"
              draggable={false}
            />

            {/* Glowing Aura Overlay when listening */}
            {isListening && (
              <div className="absolute inset-0 bg-[#00D6C7]/10 rounded-full blur-2xl animate-pulse pointer-events-none" />
            )}
          </div>
        </div>
      </div>

      {/* Bottom Interaction Hint (matching screenshot) */}
      <div className="relative z-10 pb-2 text-center">
        <p className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-2">
          <span>Move mouse to interact</span>
          <span className="text-slate-600">•</span>
          <span>Drag to rotate 360°</span>
          <span className="text-slate-600">•</span>
          <span>Scroll to zoom</span>
        </p>
      </div>
    </div>
  );
};
