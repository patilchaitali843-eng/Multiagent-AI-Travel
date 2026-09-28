import React, { useState } from 'react';
import { X, Bot, Shield, CheckCircle2, AlertTriangle, Info, Terminal, Filter } from 'lucide-react';
import { AgentTraceLog } from '../../shared/types.ts';

interface AgentTraceModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AgentTraceLog[];
}

export const AgentTraceModal: React.FC<AgentTraceModalProps> = ({
  isOpen,
  onClose,
  logs,
}) => {
  const [selectedAgent, setSelectedAgent] = useState<string>('ALL');

  if (!isOpen) return null;

  const agents = ['ALL', 'ORCHESTRATOR', 'FLIGHT_AGENT', 'HOTEL_AGENT', 'ACTIVITY_AGENT', 'BUDGET_VALIDATOR', 'ITINERARY_AGENT'];

  const filtered = selectedAgent === 'ALL'
    ? logs
    : logs.filter(l => l.agent === selectedAgent);

  const getAgentColor = (agent: string) => {
    switch (agent) {
      case 'ORCHESTRATOR': return 'text-amber-400';
      case 'FLIGHT_AGENT': return 'text-orange-400';
      case 'HOTEL_AGENT': return 'text-cyan-400';
      case 'ACTIVITY_AGENT': return 'text-emerald-400';
      case 'BUDGET_VALIDATOR': return 'text-purple-400';
      case 'ITINERARY_AGENT': return 'text-blue-400';
      default: return 'text-slate-400';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'SUCCESS': return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'WARNING': return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'ERROR': return <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />;
      default: return <Info className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl max-h-[85vh] bg-[#0d121c] border border-slate-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Multi-Agent Execution Observability Trace</span>
              </h3>
              <p className="text-xs text-slate-400">
                Live chronological trace of autonomous agents & deterministic validator
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="px-5 py-2.5 bg-slate-950/50 border-b border-slate-800/60 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          {agents.map((ag) => (
            <button
              key={ag}
              onClick={() => setSelectedAgent(ag)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono whitespace-nowrap transition-colors cursor-pointer ${
                selectedAgent === ag
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {ag}
            </button>
          ))}
        </div>

        {/* Logs Terminal Area */}
        <div className="p-5 overflow-y-auto space-y-3 font-mono text-xs flex-1 bg-black/40">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No traces recorded yet for this filter.
            </div>
          ) : (
            filtered.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-start gap-2.5"
              >
                <div className="mt-0.5 flex-shrink-0">{getLevelIcon(log.level)}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${getAgentColor(log.agent)}`}>
                      [{log.agent}]
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-slate-300 font-sans text-xs leading-relaxed">
                    {log.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>{filtered.length} Trace Events Logged</span>
          <span className="text-emerald-400">Execution Flow Verified</span>
        </div>
      </div>
    </div>
  );
};
