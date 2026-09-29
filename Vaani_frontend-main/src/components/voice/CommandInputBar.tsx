import React, { useState } from 'react';
import { Send, Mic, MicOff, HeartPulse } from 'lucide-react';

interface CommandInputBarProps {
  onSend: (text: string) => void;
  isListening?: boolean;
  onToggleMic?: () => void;
}

export const CommandInputBar: React.FC<CommandInputBarProps> = ({
  onSend,
  isListening = false,
  onToggleMic
}) => {
  const [inputVal, setInputVal] = useState<string>('');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim()) return;
    onSend(inputVal.trim());
    setInputVal('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full vaani-glass rounded-2xl sm:rounded-full p-2 sm:px-4 sm:py-2.5 border border-white/10 flex items-center gap-3 shadow-2xl backdrop-blur-xl transition-all focus-within:border-teal-500/40"
    >
      {/* Left Icon: Teal Heart Pulse */}
      <div className="pl-1 text-[#00D6C7] shrink-0">
        <HeartPulse className="w-5 h-5 animate-pulse" />
      </div>

      {/* Main Text Input */}
      <input
        type="text"
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        placeholder="Type your command or ask anything..."
        className="flex-1 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
      />

      {/* Right Controls: Send Button + Mic Button */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="submit"
          disabled={!inputVal.trim()}
          title="Send command"
          className="w-8 h-8 rounded-full bg-[#00D6C7] hover:bg-[#16D8D0] disabled:opacity-40 disabled:hover:bg-[#00D6C7] text-[#050B10] flex items-center justify-center transition-all shadow-md active:scale-95"
        >
          <Send className="w-3.5 h-3.5 -translate-x-0.5 translate-y-0.5" />
        </button>

        {onToggleMic && (
          <button
            type="button"
            onClick={onToggleMic}
            title={isListening ? 'Stop microphone' : 'Voice command'}
            className={`w-8 h-8 rounded-full border transition-all flex items-center justify-center ${
              isListening
                ? 'bg-rose-600 border-rose-500 text-white animate-pulse'
                : 'bg-[#08131B] border-white/10 text-slate-300 hover:text-white hover:border-teal-500/30'
            }`}
          >
            {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
    </form>
  );
};
