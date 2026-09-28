import React from 'react';
import { ArrowRight, Plane, Hotel, Compass, ShieldCheck, Zap, Layers, Sparkles } from 'lucide-react';
import { TripRequest } from '../../shared/types.ts';

interface HeroProps {
  onPlanTrip: () => void;
  onApplyPreset: (preset: Partial<TripRequest>) => void;
  onOpenArchitecture: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onPlanTrip, onApplyPreset, onOpenArchitecture }) => {
  const presets: Array<{
    title: string;
    destination: string;
    origin: string;
    budget: number;
    currency: string;
    travelers: number;
    style: any;
    desc: string;
    accommodationType?: any;
    interests?: string[];
  }> = [
    {
      title: 'Goa Coastal & Adventure',
      destination: 'Goa',
      origin: 'Mumbai',
      budget: 25000,
      currency: 'INR',
      travelers: 2,
      style: 'balanced',
      accommodationType: 'mid-range',
      interests: ['Beaches', 'Adventure', 'Local Food', 'Hidden Gems'],
      desc: 'Beaches · Kayaking · Local Konkani Food · Avoid Crowds',
    },
    {
      title: 'Tokyo Cultural & Culinary',
      destination: 'Tokyo',
      origin: 'Delhi',
      budget: 180000,
      currency: 'INR',
      travelers: 2,
      style: 'balanced',
      accommodationType: 'mid-range',
      interests: ['Sightseeing', 'Cultural', 'Local Food', 'Museums'],
      desc: 'Shinjuku · Ramen Trails · Historic Asakusa · Shinkansen',
    },
    {
      title: 'Swiss Alps Scenic & Hiking',
      destination: 'Interlaken',
      origin: 'Zurich',
      budget: 150000,
      currency: 'INR',
      travelers: 2,
      style: 'adventure',
      accommodationType: 'mid-range',
      interests: ['Nature', 'Adventure', 'Sightseeing'],
      desc: 'Alpine Trails · Glacier Views · Panoramic Express',
    },
  ];

  return (
    <section className="relative pt-10 pb-16 overflow-hidden border-b border-slate-800/60 animate-fadeIn">
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[200px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
        {/* Clean unboxed metadata kicker */}
        <div className="inline-flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-amber-400/90 mb-4">
          <span>Autonomous Multi-Agent System</span>
          <span aria-hidden="true">·</span>
          <span>Zero LLM Math Hallucination</span>
          <span aria-hidden="true">·</span>
          <span>FastAPI & Vite</span>
        </div>

        {/* Primary Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.12]">
          Plan your perfect trip <span className="bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200 bg-clip-text text-transparent">with AI</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Multiple specialized AI agents research transportation, evaluate accommodations, curate uncrowded activities, and deterministically optimize your budget into an actionable daily itinerary.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            onClick={onPlanTrip}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Plan My Trip</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenArchitecture}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>System Architecture</span>
          </button>
        </div>

        {/* Architectural Highlights Bar */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
              <Plane className="w-4 h-4" />
              <span>Transport Agent</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Evaluates flight times, layovers, trains, and price scores.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold">
              <Hotel className="w-4 h-4" />
              <span>Hotel Agent</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Filters verified stays by distance, user rating, and style.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <Compass className="w-4 h-4" />
              <span>Activity Agent</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Curates category diversity and respects crowd preferences.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Budget Validator</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Deterministic calculations with auto-fallback loop.
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mt-8 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-xs">
          <span className="text-slate-400 flex items-center gap-1.5 font-medium">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Quick Demo Presets:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {presets.map((preset) => (
              <button
                key={preset.title}
                onClick={() => {
                  onApplyPreset({
                    destination: preset.destination,
                    origin: preset.origin,
                    budget: preset.budget,
                    currency: preset.currency,
                    travelers: preset.travelers,
                    travelStyle: preset.style,
                    accommodationType: preset.accommodationType,
                    interests: preset.interests,
                  });
                  onPlanTrip();
                }}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-amber-500/50 hover:bg-slate-800/70 transition-colors cursor-pointer text-[12px] flex items-center gap-1.5"
              >
                <span>{preset.destination}</span>
                <span className="text-slate-500">·</span>
                <span className="font-mono text-amber-300">{preset.currency} {preset.budget.toLocaleString()}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
