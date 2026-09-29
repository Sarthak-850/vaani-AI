import React from 'react';
import { 
  ChevronRight, 
  RotateCw, 
  ShieldAlert, 
  FileText, 
  HelpCircle,
  Calendar,
  Users
} from 'lucide-react';

interface VoiceCommandsCardProps {
  onExecuteCommand: (command: string) => void;
}

export const VoiceCommandsCard: React.FC<VoiceCommandsCardProps> = ({ onExecuteCommand }) => {
  const commands = [
    {
      id: 'today-visits',
      label: "Show today's visits",
      icon: RotateCw,
      commandText: "Show today's visits"
    },
    {
      id: 'high-priority',
      label: "List high priority patients",
      icon: ShieldAlert,
      commandText: "List high priority patients"
    },
    {
      id: 'generate-report',
      label: "Generate health report",
      icon: FileText,
      commandText: "Generate health report"
    },
    {
      id: 'assistant-help',
      label: "Open voice assistant help",
      icon: HelpCircle,
      commandText: "Open voice assistant help"
    }
  ];

  return (
    <div className="vaani-glass rounded-2xl p-4 sm:p-5 border border-white/10 shadow-xl backdrop-blur-xl space-y-3">
      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
        Try these commands
      </h3>

      <div className="space-y-2">
        {commands.map((cmd) => {
          const IconComponent = cmd.icon;
          return (
            <button
              key={cmd.id}
              onClick={() => onExecuteCommand(cmd.commandText)}
              className="w-full flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-[#08131B]/60 hover:bg-[#0c1f2e] border border-white/5 hover:border-teal-500/30 text-left transition-all duration-200 group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1 rounded-lg bg-teal-500/10 text-[#00D6C7] group-hover:scale-110 transition-transform">
                  <IconComponent className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-medium text-slate-200 group-hover:text-white transition-colors">
                  {cmd.label}
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#00D6C7] group-hover:translate-x-0.5 transition-all" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
