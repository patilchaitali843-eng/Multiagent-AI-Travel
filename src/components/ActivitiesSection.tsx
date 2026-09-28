import React, { useState } from 'react';
import { Compass, Clock, MapPin, RefreshCw, Sparkles, ShieldCheck, Flame, Tag } from 'lucide-react';
import { ActivityOption } from '../../shared/types.ts';

interface ActivitiesSectionProps {
  activities: ActivityOption[];
  currency: string;
  onRegenerate: (modifier?: string) => void;
  isRegenerating: boolean;
}

export const ActivitiesSection: React.FC<ActivitiesSectionProps> = ({
  activities,
  currency,
  onRegenerate,
  isRegenerating,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(activities.map(a => a.category)))];

  const filtered = selectedFilter === 'all'
    ? activities
    : activities.filter(a => a.category === selectedFilter);

  return (
    <section className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <span>Specialized Activity Agent</span>
            <span aria-hidden="true">·</span>
            <span>Interest Matching & Crowd Filter</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight mt-0.5">
            Personalized Activities & Experiences
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onRegenerate('find more adventure activities')}
            disabled={isRegenerating}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>More Adventure</span>
          </button>

          <button
            onClick={() => onRegenerate('add more local food experiences')}
            disabled={isRegenerating}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>More Food Tours</span>
          </button>
        </div>
      </div>

      {/* Interactive Category Filter Tabs (Permitted segmented controls) */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/60 rounded-xl border border-slate-800/80">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize cursor-pointer ${
              selectedFilter === cat
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((act) => (
          <div
            key={act.id}
            className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Clean unboxed text kicker for category and match score */}
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
                <span className="text-emerald-400 font-semibold">{act.category}</span>
                <span>Match: {Math.round(act.preferenceMatch * 100)}%</span>
              </div>

              <h4 className="font-bold text-sm text-white leading-snug line-clamp-2 mb-2">
                {act.name}
              </h4>

              <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-3">
                {act.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/70 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {act.durationHours}h · {act.bestTime}
                </span>
                <span>
                  Crowd: <strong className={act.crowdLevel === 'Low' ? 'text-emerald-400' : 'text-amber-400'}>{act.crowdLevel}</strong>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Estimated Cost</span>
                <span className="text-sm font-bold font-mono text-white">
                  {act.estimatedCost === 0 ? 'Free Entry' : `${currency} ${act.estimatedCost.toLocaleString()}`}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
