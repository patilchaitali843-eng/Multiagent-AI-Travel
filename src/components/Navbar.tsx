import React from 'react';
import { Compass, Bot, Sliders, Layers, Sparkles, Database, BookmarkCheck, ArrowRight } from 'lucide-react';

export type AppRoute = 'landing' | 'configure' | 'processing' | 'results' | 'itinerary' | 'preferences' | 'architecture' | 'saved';

interface NavbarProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  onOpenTraces?: () => void;
  hasTrip: boolean;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  traceCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onNavigate,
  onOpenTraces,
  hasTrip,
  isDemoMode,
  onToggleDemoMode,
  traceCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#0b0f17]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <button 
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 group text-left cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:border-amber-400/60 transition-colors">
            <Compass className="w-5 h-5 animate-[spin_12s_linear_infinite]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg tracking-tight text-white font-['Plus_Jakarta_Sans']">
                Multi-Agent AI Travel Planner
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Autonomous Coordinator & Deterministic Budget Engine
            </p>
          </div>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Plan My Trip CTA in header */}
          {currentRoute !== 'configure' && currentRoute !== 'processing' && (
            <button
              onClick={() => onNavigate('configure')}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Plan My Trip</span>
            </button>
          )}

          {/* If Trip is ready, show quick Results & Itinerary link */}
          {hasTrip && currentRoute !== 'results' && currentRoute !== 'processing' && (
            <button
              onClick={() => onNavigate('results')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
            >
              Results
            </button>
          )}

          {hasTrip && currentRoute !== 'itinerary' && currentRoute !== 'processing' && (
            <button
              onClick={() => onNavigate('itinerary')}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs text-cyan-300 border border-slate-700 transition-colors cursor-pointer"
            >
              Itinerary
            </button>
          )}

          {/* Saved Trips */}
          <button
            onClick={() => onNavigate('saved')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
              currentRoute === 'saved'
                ? 'border-amber-400/80 bg-amber-400/10 text-amber-300'
                : 'border-slate-800 bg-slate-900/40 text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
            title="Saved Trips"
          >
            <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Saved Trips</span>
          </button>

          {/* User Memory Preferences */}
          <button
            onClick={() => onNavigate('preferences')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
              currentRoute === 'preferences'
                ? 'border-amber-400/80 bg-amber-400/10 text-amber-300'
                : 'border-slate-800 bg-slate-900/40 text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
            title="Preferences Memory"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Preferences</span>
          </button>

          {/* Architecture Page */}
          <button
            onClick={() => onNavigate('architecture')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
              currentRoute === 'architecture'
                ? 'border-cyan-400/80 bg-cyan-400/10 text-cyan-300'
                : 'border-slate-800 bg-slate-900/40 text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
            title="System Architecture & Interview Guide"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Architecture</span>
          </button>

          {/* Mode Switcher */}
          <button
            onClick={onToggleDemoMode}
            title={isDemoMode ? "Click to switch to Live Agent Mode (uses real-time Gemini reasoning)" : "Click to switch to Demo Provider Mode"}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700/80 bg-slate-900/60 text-xs text-slate-300 hover:text-white hover:border-slate-600 transition-colors cursor-pointer"
          >
            <span className={`w-2 h-2 rounded-full ${isDemoMode ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
            <span className="font-mono text-[11px]">
              {isDemoMode ? 'Demo Mode' : 'Live Mode'}
            </span>
          </button>

          {/* Live Agent Logs Trigger (when trip exists) */}
          {hasTrip && onOpenTraces && (
            <button
              onClick={onOpenTraces}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-xs text-amber-300 hover:bg-amber-500/20 transition-colors cursor-pointer"
              title="View Agent Execution Traces"
            >
              <Bot className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Traces</span>
              {traceCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 text-[10px] font-mono text-amber-200">
                  {traceCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
