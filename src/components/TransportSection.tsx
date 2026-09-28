import React, { useState } from 'react';
import { Plane, Train, Bus, RefreshCw, Clock, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { TransportOption } from '../../shared/types.ts';

interface TransportSectionProps {
  options: TransportOption[];
  selected: TransportOption;
  currency: string;
  onSelectOption: (option: TransportOption) => void;
  onRegenerate: (modifier?: string) => void;
  isRegenerating: boolean;
}

export const TransportSection: React.FC<TransportSectionProps> = ({
  options,
  selected,
  currency,
  onSelectOption,
  onRegenerate,
  isRegenerating,
}) => {
  const [selectedSubTab, setSelectedSubTab] = useState<'all' | 'flight' | 'train' | 'bus'>('all');

  const filtered = selectedSubTab === 'all' 
    ? options 
    : options.filter(o => o.type === selectedSubTab);

  return (
    <section className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
            <span>Specialized Flight Agent</span>
            <span aria-hidden="true">·</span>
            <span>Multi-modal Comparison</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight mt-0.5">
            Transportation Options
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Regenerate buttons */}
          <button
            onClick={() => onRegenerate('find cheaper transport')}
            disabled={isRegenerating}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>Find Cheaper Transport</span>
          </button>
        </div>
      </div>

      {/* Demo data notice banner */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/20 text-xs text-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>Demo baseline provider active. Connect Amadeus, Skyscanner, or IRCTC API for real-time seat inventory.</span>
        </div>
        <span className="font-mono text-[11px] text-amber-400/80 hidden md:inline">GDS Verified Contract</span>
      </div>

      {/* Interactive Options Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filtered.map((opt) => {
          const isSelected = selected.id === opt.id;
          return (
            <div
              key={opt.id}
              onClick={() => onSelectOption(opt)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-500/60 ring-1 ring-amber-500/30'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                    {opt.type === 'flight' && <Plane className="w-4 h-4 text-amber-400" />}
                    {opt.type === 'train' && <Train className="w-4 h-4 text-cyan-400" />}
                    {opt.type === 'bus' && <Bus className="w-4 h-4 text-emerald-400" />}
                    <span className="capitalize">{opt.type}</span>
                  </div>

                  <div className="text-xs font-mono text-slate-400">
                    Score: <span className="font-semibold text-white">{Math.round(opt.score * 100)}%</span>
                  </div>
                </div>

                <div className="font-bold text-sm text-white mb-2 line-clamp-1">
                  {opt.provider}
                </div>

                {/* Time & Route */}
                <div className="flex items-center justify-between text-xs text-slate-300 my-3 py-2 border-y border-slate-800/80">
                  <div>
                    <div className="font-mono font-semibold text-white">{opt.departure}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">{opt.origin}</div>
                  </div>
                  <div className="flex flex-col items-center px-2">
                    <span className="text-[10px] text-slate-400">{opt.duration}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 my-0.5" />
                    <span className="text-[10px] text-slate-400">
                      {opt.stops === 0 ? 'Non-stop' : `${opt.stops} stop(s)`}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-semibold text-white">{opt.arrival}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">{opt.destination}</div>
                  </div>
                </div>
              </div>

              {/* Price & Selection Footer */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <div className="text-xs text-slate-400">Total for all travelers</div>
                  <div className="text-base font-bold text-amber-400 font-mono">
                    {opt.currency} {opt.price.toLocaleString()}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectOption(opt);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 flex items-center gap-1'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Selected</span>
                    </>
                  ) : (
                    <span>Choose</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
