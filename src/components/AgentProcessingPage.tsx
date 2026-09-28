import React, { useEffect, useState } from 'react';
import { 
  Cpu, 
  Plane, 
  Hotel, 
  Compass, 
  ShieldCheck, 
  Calendar, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { TripRequest, TripPlan, AgentTraceLog } from '../../shared/types.ts';

interface AgentProcessingPageProps {
  request: TripRequest;
  plan: TripPlan | null;
  isLoading: boolean;
  errorMessage: string | null;
  onNavigateToResults: () => void;
  onBackToConfigure: () => void;
  onRetry: () => void;
}

interface AgentStage {
  id: string;
  name: string;
  role: string;
  description: string;
  icon: any;
  color: string;
  agentTag: AgentTraceLog['agent'];
}

export const AgentProcessingPage: React.FC<AgentProcessingPageProps> = ({
  request,
  plan,
  isLoading,
  errorMessage,
  onNavigateToResults,
  onBackToConfigure,
  onRetry,
}) => {
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [progress, setProgress] = useState(10);

  const stages: AgentStage[] = [
    {
      id: 'orchestrator',
      name: 'Orchestrator Agent',
      role: 'Master Coordinator',
      description: `Ingesting requirements for ${request.destination} (${request.currency} ${request.budget.toLocaleString()}, ${request.travelers} traveler(s)). Delegating parallel agent tasks...`,
      icon: Cpu,
      color: 'amber',
      agentTag: 'ORCHESTRATOR',
    },
    {
      id: 'transport',
      name: 'Transport Agent',
      role: 'Route & Carrier Optimization',
      description: `Searching flights, express trains, and transit options from ${request.origin} to ${request.destination}...`,
      icon: Plane,
      color: 'orange',
      agentTag: 'FLIGHT_AGENT',
    },
    {
      id: 'hotel',
      name: 'Hotel Agent',
      role: 'Accommodation Research',
      description: `Evaluating verified stays, distance to sights, and user rating sentiment in ${request.destination}...`,
      icon: Hotel,
      color: 'cyan',
      agentTag: 'HOTEL_AGENT',
    },
    {
      id: 'activity',
      name: 'Activity Agent',
      role: 'Curating Experiences',
      description: `Researching activities aligned with '${request.interests.join(', ')}' and '${request.crowdPreference.replace('_', ' ')}' preferences...`,
      icon: Compass,
      color: 'emerald',
      agentTag: 'ACTIVITY_AGENT',
    },
    {
      id: 'budget',
      name: 'Budget Validator',
      role: 'Deterministic Arithmetic Math Engine',
      description: 'Computing subtotal, food allocations, transit allowances, and 5% contingency reserve (No LLM math)...',
      icon: ShieldCheck,
      color: 'purple',
      agentTag: 'BUDGET_VALIDATOR',
    },
    {
      id: 'itinerary',
      name: 'Itinerary Generator',
      role: 'Chronological Scheduling',
      description: 'Synthesizing morning, afternoon, evening slots with meal stops and realistic transit buffers...',
      icon: Calendar,
      color: 'blue',
      agentTag: 'ITINERARY_AGENT',
    },
  ];

  // Stage simulation progression while loading
  useEffect(() => {
    if (!isLoading && plan) {
      setActiveStageIndex(stages.length - 1);
      setProgress(100);
      const timer = setTimeout(() => {
        onNavigateToResults();
      }, 900);
      return () => clearTimeout(timer);
    }

    const interval = setInterval(() => {
      setActiveStageIndex((prev) => {
        const next = Math.min(prev + 1, stages.length - 2);
        setProgress(Math.round(((next + 1) / stages.length) * 90));
        return next;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isLoading, plan]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Multi-Agent Swarm Orchestration in Progress</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Planning Your Journey to {request.destination}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Six specialized agents are collaborating in real time to research, balance, and deterministically validate your personalized trip.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Orchestrator Execution Status</span>
          <span className="text-amber-400 font-bold">{progress}% Complete</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-emerald-400 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Error state if generation fails */}
      {errorMessage && (
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <span>Agent Orchestration Encountered An Issue</span>
          </div>
          <p className="text-xs text-rose-200">{errorMessage}</p>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onRetry}
              className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Generation</span>
            </button>
            <button
              onClick={onBackToConfigure}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs cursor-pointer"
            >
              Edit Trip Parameters
            </button>
          </div>
        </div>
      )}

      {/* Agent Stages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {stages.map((stage, idx) => {
          const isDone = !isLoading && plan ? true : idx < activeStageIndex;
          const isActive = idx === activeStageIndex && isLoading;
          const isPending = idx > activeStageIndex && isLoading;
          const Icon = stage.icon;

          return (
            <div
              key={stage.id}
              className={`p-4 rounded-xl border transition-all duration-300 flex items-start gap-3.5 ${
                isActive
                  ? 'bg-slate-900/90 border-amber-400/70 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/30'
                  : isDone
                  ? 'bg-slate-950/70 border-emerald-500/30 text-slate-200'
                  : 'bg-slate-950/40 border-slate-800/80 opacity-60'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isActive
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                    : isDone
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-900 text-slate-600 border border-slate-800'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : isActive ? (
                  <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-sm text-white truncate">
                    {stage.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {stage.role}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {stage.description}
                </p>

                {isActive && (
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-400 font-mono animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>Processing live parameters...</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          onClick={onBackToConfigure}
          disabled={isLoading}
          className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-40"
        >
          ← Back to Parameters
        </button>

        {plan && (
          <button
            onClick={onNavigateToResults}
            className="px-6 py-2.5 rounded-xl font-bold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center gap-2 shadow-lg shadow-amber-400/20 cursor-pointer transition-all"
          >
            <span>View Results Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
