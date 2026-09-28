import React from 'react';
import { ArrowLeft, Printer, Download, Sparkles, Calendar, Bookmark, Check } from 'lucide-react';
import { TripPlan } from '../../shared/types.ts';
import { ItinerarySection } from './ItinerarySection.tsx';

interface DetailedItineraryPageProps {
  plan: TripPlan;
  onBackToResults: () => void;
  onEditTrip: () => void;
  onRegenerateDay: (dayNumber: number) => void;
  isRegeneratingDay: number | null;
  onSaveTrip: () => void;
  isSaved: boolean;
}

export const DetailedItineraryPage: React.FC<DetailedItineraryPageProps> = ({
  plan,
  onBackToResults,
  onEditTrip,
  onRegenerateDay,
  isRegeneratingDay,
  onSaveTrip,
  isSaved,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(plan.itinerary, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${plan.request.destination}-daily-itinerary.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 space-y-6 animate-fadeIn">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <button
          onClick={onBackToResults}
          className="px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Results Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onSaveTrip}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isSaved
                ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
                : 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
            }`}
          >
            {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Bookmark className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isSaved ? 'Saved to Collection' : 'Save Itinerary'}</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Export Itinerary JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>Print Itinerary</span>
          </button>
        </div>
      </div>

      {/* Itinerary Timeline View */}
      <ItinerarySection
        itinerary={plan.itinerary}
        currency={plan.budget.currency}
        onRegenerateDay={onRegenerateDay}
        isRegeneratingDay={isRegeneratingDay}
      />

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-800">
        <button
          onClick={onBackToResults}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Results Dashboard</span>
        </button>

        <button
          onClick={onEditTrip}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
        >
          Modify Trip Inputs
        </button>
      </div>
    </div>
  );
};
