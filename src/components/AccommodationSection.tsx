import React from 'react';
import { Hotel, Star, MapPin, RefreshCw, Check, Sparkles, Wifi, Coffee, Waves } from 'lucide-react';
import { AccommodationOption } from '../../shared/types.ts';

interface AccommodationSectionProps {
  options: AccommodationOption[];
  selected: AccommodationOption;
  currency: string;
  onSelectStay: (stay: AccommodationOption) => void;
  onRegenerate: (modifier?: string) => void;
  isRegenerating: boolean;
}

export const AccommodationSection: React.FC<AccommodationSectionProps> = ({
  options,
  selected,
  currency,
  onSelectStay,
  onRegenerate,
  isRegenerating,
}) => {
  return (
    <section className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span>Specialized Hotel Agent</span>
            <span aria-hidden="true">·</span>
            <span>Vetted Stays & Distance Matching</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight mt-0.5">
            Recommended Accommodation
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onRegenerate('find cheaper hotels')}
            disabled={isRegenerating}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>Find Cheaper Hotels</span>
          </button>
        </div>
      </div>

      {/* Featured Selected Stay Card */}
      <div className="p-5 rounded-xl bg-slate-950/70 border border-cyan-500/30 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        <div className="md:col-span-5 h-48 sm:h-56 rounded-xl overflow-hidden relative">
          <img
            src={selected.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'}
            alt={selected.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md text-[11px] font-semibold text-white border border-slate-700">
            {selected.type}
          </div>
          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{selected.rating}</span>
          </div>
        </div>

        <div className="md:col-span-7 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <span>Primary Selected Stay</span>
              <span aria-hidden="true">·</span>
              <span>Match Score {Math.round(selected.score * 100)}%</span>
            </div>

            <h4 className="text-xl font-bold text-white tracking-tight mt-1">
              {selected.name}
            </h4>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{selected.location}</span>
              <span aria-hidden="true">·</span>
              <span>{selected.distanceFromCenterKm} km from center</span>
            </div>
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-1.5">
            {selected.amenities.map((amenity) => (
              <span
                key={amenity}
                className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-slate-300"
              >
                {amenity}
              </span>
            ))}
          </div>

          {/* Price details */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <div>
              <span className="text-xs text-slate-400">Total Stay Cost</span>
              <div className="text-xl font-bold text-cyan-300 font-mono">
                {currency} {selected.totalPrice.toLocaleString()}
                <span className="text-xs text-slate-400 font-normal ml-1.5 font-sans">
                  ({currency} {selected.pricePerNight.toLocaleString()}/night)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-medium border border-cyan-500/30">
              <Check className="w-4 h-4" />
              <span>Current Choice</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alternative Stays Row */}
      {options.length > 1 && (
        <div className="space-y-2 pt-2">
          <div className="text-xs font-semibold text-slate-400">
            Alternative Accommodations Researched:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {options
              .filter(o => o.id !== selected.id)
              .map((stay) => (
                <div
                  key={stay.id}
                  onClick={() => onSelectStay(stay)}
                  className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 text-xs mb-1">
                      <span className="text-slate-400">{stay.type}</span>
                      <span className="text-amber-400 flex items-center gap-0.5 font-semibold">
                        <Star className="w-3 h-3 fill-current" />
                        {stay.rating}
                      </span>
                    </div>
                    <div className="font-semibold text-xs text-white line-clamp-1">
                      {stay.name}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {stay.location}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/60">
                    <span className="text-xs font-mono font-bold text-slate-200">
                      {currency} {stay.totalPrice.toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStay(stay);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-medium"
                    >
                      Switch
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </section>
  );
};
