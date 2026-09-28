import React from 'react';
import { MapPin, Calendar, Users, Wallet, CheckCircle, RefreshCw, Download, FileText } from 'lucide-react';
import { TripPlan } from '../../shared/types.ts';

interface TripSummaryProps {
  plan: TripPlan;
  onOptimizeBudget: () => void;
  isOptimizing: boolean;
  onOpenTraces: () => void;
}

export const TripSummary: React.FC<TripSummaryProps> = ({
  plan,
  onOptimizeBudget,
  isOptimizing,
  onOpenTraces,
}) => {
  const { request, budget, iterationsCount } = plan;

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(plan, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${request.destination}-itinerary-${request.startDate}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          {/* Unboxed clean metadata kicker */}
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
            <span>Verified AI Plan</span>
            <span aria-hidden="true">·</span>
            <span>{plan.itinerary.length} Days</span>
            <span aria-hidden="true">·</span>
            <span>{iterationsCount > 0 ? `${iterationsCount} Budget Passes` : 'Passed 1st Pass'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {request.destination} Itinerary
          </h2>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              {request.origin} → {request.destination}
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              {request.startDate} to {request.endDate}
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              {request.travelers} Traveler{request.travelers > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenTraces}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>View Agent Trace ({plan.traceLogs.length})</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Export full plan as JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Total Budget</div>
          <div className="mt-1 text-lg font-bold text-white font-mono">
            {budget.currency} {budget.budget.toLocaleString()}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Total Calculated Cost</div>
          <div className="mt-1 text-lg font-bold text-amber-300 font-mono">
            {budget.currency} {budget.totalCost.toLocaleString()}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Unallocated Buffer</div>
          <div className={`mt-1 text-lg font-bold font-mono ${budget.remaining >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {budget.currency} {budget.remaining.toLocaleString()}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Budget Compliance</div>
          <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold">
            {budget.withinBudget ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">{budget.utilizationPercentage}% Utilized</span>
              </>
            ) : (
              <>
                <span className="text-rose-400 font-mono">Exceeded by {budget.currency} {Math.abs(budget.remaining).toLocaleString()}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
