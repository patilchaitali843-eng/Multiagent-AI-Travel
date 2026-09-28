import React from 'react';
import { Wallet, ShieldCheck, CheckCircle2, AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';
import { BudgetBreakdown } from '../../shared/types.ts';

interface BudgetSectionProps {
  budget: BudgetBreakdown;
  currency: string;
  onOptimizeBudget: () => void;
  isOptimizing: boolean;
}

export const BudgetSection: React.FC<BudgetSectionProps> = ({
  budget,
  currency,
  onOptimizeBudget,
  isOptimizing,
}) => {
  const items = [
    { label: 'Transportation', amount: budget.transportation, color: '#f59e0b', share: (budget.transportation / budget.totalCost) * 100 },
    { label: 'Accommodation', amount: budget.accommodation, color: '#06b6d4', share: (budget.accommodation / budget.totalCost) * 100 },
    { label: 'Dining & Meals', amount: budget.food, color: '#10b981', share: (budget.food / budget.totalCost) * 100 },
    { label: 'Activities & Entry', amount: budget.activities, color: '#8b5cf6', share: (budget.activities / budget.totalCost) * 100 },
    { label: 'Local Transit (Cabs/Metro)', amount: budget.localTransport, color: '#ec4899', share: (budget.localTransport / budget.totalCost) * 100 },
    { label: 'Miscellaneous & Tips', amount: budget.miscellaneous, color: '#64748b', share: (budget.miscellaneous / budget.totalCost) * 100 },
    { label: 'Contingency Reserve (5%)', amount: budget.contingency, color: '#14b8a6', share: (budget.contingency / budget.totalCost) * 100 },
  ];

  // SVG Donut Calculations
  let cumulativePercent = 0;
  const donutSlices = items.map((item) => {
    const start = cumulativePercent;
    const end = cumulativePercent + item.share;
    cumulativePercent = end;

    // Convert start and end percent to SVG circle dashoffset
    const circumference = 2 * Math.PI * 40;
    const strokeDasharray = `${(item.share / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((start / 100) * circumference);

    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <section className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-purple-400">
            <span>Deterministic Math Engine</span>
            <span aria-hidden="true">·</span>
            <span>Zero LLM Arithmetic</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight mt-0.5">
            Budget Breakdown & Optimization
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOptimizeBudget}
            disabled={isOptimizing}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isOptimizing ? 'Optimizing Budget...' : '1-Click Optimize Budget'}</span>
          </button>
        </div>
      </div>

      {/* Compliance Callout Banner */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        budget.withinBudget
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
      }`}>
        <div className="flex items-start gap-3">
          {budget.withinBudget ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
          )}
          <div>
            <div className="font-bold text-sm">
              {budget.withinBudget
                ? `Plan is strictly within budget (${budget.utilizationPercentage}% utilized)`
                : `Budget exceeded by ${currency} ${(budget.totalCost - budget.budget).toLocaleString()}`}
            </div>
            <div className="text-xs text-slate-300 mt-0.5">
              {budget.optimizationNotes && budget.optimizationNotes.length > 0 
                ? budget.optimizationNotes.join(' ')
                : 'All costs calculated deterministically with built-in 5% contingency buffer.'}
            </div>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Remaining Buffer</div>
          <div className={`text-base font-bold font-mono ${budget.remaining >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {currency} {budget.remaining.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Charts & Breakdown Table Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* SVG Donut Chart */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#1e293b"
                strokeWidth="12"
              />
              {donutSlices.map((slice, i) => (
                <circle
                  key={i}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth="12"
                  strokeDasharray={slice.strokeDasharray}
                  strokeDashoffset={slice.strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Cost</span>
              <span className="text-base font-bold text-white font-mono">
                {currency} {budget.totalCost.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">
                {budget.utilizationPercentage}% of budget
              </span>
            </div>
          </div>

          <div className="w-full mt-4 grid grid-cols-2 gap-2 text-[11px]">
            {items.slice(0, 4).map((it) => (
              <div key={it.label} className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: it.color }} />
                <span className="truncate">{it.label}</span>
                <span className="font-mono text-slate-400 ml-auto">{Math.round(it.share)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Deterministic Breakdown Table */}
        <div className="lg:col-span-7 space-y-2.5">
          <div className="rounded-xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Expense Category</th>
                  <th className="py-2.5 px-3">Calculation Basis</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40 font-mono">
                {items.map((row) => (
                  <tr key={row.label} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2 px-3 font-sans font-medium text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: row.color }} />
                      <span>{row.label}</span>
                    </td>
                    <td className="py-2 px-3 text-slate-400 font-sans text-[11px]">
                      {row.label.includes('Transportation') && 'Selected transit carrier total'}
                      {row.label.includes('Accommodation') && 'Per-night rate × total nights'}
                      {row.label.includes('Dining') && 'Travel style daily allowance'}
                      {row.label.includes('Activities') && 'Sum of selected admissions'}
                      {row.label.includes('Local Transit') && 'Estimated taxi & metro rides'}
                      {row.label.includes('Miscellaneous') && 'Emergency daily incidentals'}
                      {row.label.includes('Contingency') && '5% safety hedge'}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-slate-200">
                      {currency} {row.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-950/90 border-t border-slate-700 text-xs font-mono font-bold">
                <tr>
                  <td colSpan={2} className="py-2.5 px-3 font-sans text-white">
                    Grand Total Calculated Expenditure:
                  </td>
                  <td className="py-2.5 px-3 text-right text-amber-400 text-sm">
                    {currency} {budget.totalCost.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
