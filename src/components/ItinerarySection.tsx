import React, { useState } from 'react';
import { Calendar, Clock, Utensils, RefreshCw, MapPin, DollarSign, Sun, Sunset, Moon, CheckCircle } from 'lucide-react';
import { ItineraryDay, ItinerarySlot } from '../../shared/types.ts';

interface ItinerarySectionProps {
  itinerary: ItineraryDay[];
  currency: string;
  onRegenerateDay: (dayNumber: number) => void;
  isRegeneratingDay: number | null;
}

export const ItinerarySection: React.FC<ItinerarySectionProps> = ({
  itinerary,
  currency,
  onRegenerateDay,
  isRegeneratingDay,
}) => {
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);

  const currentDay = itinerary[activeDayIndex] || itinerary[0];

  const renderSlot = (slot: ItinerarySlot, index: number) => {
    return (
      <div
        key={`${slot.time}-${index}`}
        className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-amber-400 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{slot.time}</span>
          </div>

          <div className="font-bold text-sm text-white">
            {slot.title}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            {slot.description}
          </p>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
            <MapPin className="w-3 h-3 text-slate-500" />
            <span>{slot.location}</span>
          </div>
        </div>

        {slot.cost > 0 && (
          <div className="text-right flex-shrink-0 pt-1 sm:pt-0">
            <span className="text-[11px] text-slate-400 block">Est. Cost</span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {currency} {slot.cost.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span>Specialized Itinerary Agent</span>
            <span aria-hidden="true">·</span>
            <span>Chronological Schedule Builder</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight mt-0.5">
            Day-by-Day Personalized Itinerary
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onRegenerateDay(currentDay.dayNumber)}
            disabled={isRegeneratingDay === currentDay.dayNumber}
            className="px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegeneratingDay === currentDay.dayNumber ? 'animate-spin' : ''}`} />
            <span>Regenerate Day {currentDay.dayNumber}</span>
          </button>
        </div>
      </div>

      {/* Day Selector Tabs (Interactive segmented buttons) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 scrollbar-none">
        {itinerary.map((day, idx) => (
          <button
            key={day.dayNumber}
            onClick={() => setActiveDayIndex(idx)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeDayIndex === idx
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-slate-950/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            <span>Day {day.dayNumber}</span>
            <span className={`text-[10px] font-mono ${activeDayIndex === idx ? 'text-slate-900/80' : 'text-slate-400'}`}>
              · {day.date}
            </span>
          </button>
        ))}
      </div>

      {/* Active Day Detail Card */}
      <div className="space-y-6">
        {/* Day Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
          <div>
            <div className="text-base font-bold text-white">
              Day {currentDay.dayNumber}: {currentDay.date}
            </div>
            {currentDay.notes && (
              <p className="text-xs text-slate-400 mt-0.5">{currentDay.notes}</p>
            )}
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[11px] text-slate-400 block">Est. Day Outlay</span>
            <span className="text-sm font-bold font-mono text-amber-400">
              {currency} {currentDay.dailyEstimatedCost.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Morning Block */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Sun className="w-4 h-4" />
            <span>Morning Experience</span>
          </div>
          <div className="space-y-2">
            {currentDay.morning.map((slot, i) => renderSlot(slot, i))}
          </div>
        </div>

        {/* Afternoon Block */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-400">
            <Sunset className="w-4 h-4" />
            <span>Afternoon Experience</span>
          </div>
          <div className="space-y-2">
            {currentDay.afternoon.map((slot, i) => renderSlot(slot, i))}
          </div>
        </div>

        {/* Evening Block */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
            <Moon className="w-4 h-4" />
            <span>Evening Experience</span>
          </div>
          <div className="space-y-2">
            {currentDay.evening.map((slot, i) => renderSlot(slot, i))}
          </div>
        </div>

        {/* Curated Meals Card */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <Utensils className="w-4 h-4" />
            <span>Curated Culinary Recommendations for Day {currentDay.dayNumber}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Breakfast</span>
              <p className="text-slate-200">{currentDay.meals.breakfast}</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Lunch</span>
              <p className="text-slate-200">{currentDay.meals.lunch}</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Dinner</span>
              <p className="text-slate-200">{currentDay.meals.dinner}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
