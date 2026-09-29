import React from 'react';

interface VaaniAvatarCenterpieceProps {
  isListening?: boolean;
  onInteract?: () => void;
}

export const VaaniAvatarCenterpiece: React.FC<VaaniAvatarCenterpieceProps> = ({
  isListening = false,
  onInteract
}) => {
  return (
    <div
      onClick={onInteract}
      className="relative w-full h-full min-h-[460px] sm:min-h-[500px] flex flex-col items-center justify-center select-none overflow-hidden"
    >
      {/* Subtle Background Radial Ambient Glow */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-500/10 via-transparent to-transparent pointer-events-none" 
        aria-hidden="true"
      />

      {/* Main Character Presentation Stage */}
      <div className="relative flex flex-col items-center justify-end w-full flex-1 pb-4">
        
        {/* Neon Teal Circular Base Pedestal Ring beneath feet */}
        <div 
          className="relative w-full flex items-center justify-center pointer-events-none"
          aria-hidden="true"
        >
          {/* Outer glowing elliptical ring */}
          <div
            className={`absolute -bottom-2 w-64 sm:w-72 lg:w-80 h-14 rounded-[50%] border transition-all duration-500 ${
              isListening
                ? 'border-[#00D6C7] shadow-[0_0_35px_#00D6C7,inset_0_0_20px_#00D6C7]'
                : 'border-[#00D6C7]/70 shadow-[0_0_25px_rgba(0,214,199,0.4),inset_0_0_15px_rgba(0,214,199,0.2)]'
            }`}
          />
          {/* Inner subtle glow floor puddle */}
          <div className="absolute -bottom-3 w-52 sm:w-60 lg:w-68 h-10 rounded-[50%] bg-[#00D6C7]/15 blur-sm" />
        </div>

        {/* High-Resolution Front-Facing Vaani Character */}
        <div className="relative z-10 flex items-center justify-center">
          <img
            src="/assets/vaani-character.png"
            alt="Vaani AI Healthcare Assistant"
            className="h-[400px] sm:h-[460px] lg:h-[490px] xl:h-[510px] w-auto max-w-full object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)] select-none pointer-events-none"
            style={{
              imageRendering: 'auto',
            }}
            draggable={false}
          />
        </div>

        {/* Subtle status indicator pill when listening */}
        {isListening && (
          <div className="absolute bottom-2 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-[#08131B]/90 border border-teal-500/50 text-[#00D6C7] text-xs font-semibold shadow-lg backdrop-blur-md animate-pulse">
            <span className="w-2 h-2 rounded-full bg-[#00D6C7] animate-ping" />
            <span>Listening...</span>
          </div>
        )}

      </div>
    </div>
  );
};
