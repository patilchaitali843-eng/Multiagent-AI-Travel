import React, { useState } from 'react';
import { 
  Plane, 
  Hotel, 
  Compass, 
  Wallet, 
  Calendar, 
  ArrowLeft, 
  ArrowRight, 
  Bookmark, 
  Check, 
  Download, 
  FileText, 
  Bot, 
  Edit3, 
  Sparkles,
  Layers,
  ChevronRight,
  MapPin,
  Map as MapIcon
} from 'lucide-react';
import { TripPlan, TransportOption, AccommodationOption } from '../../shared/types.ts';
import { TripSummary } from './TripSummary.tsx';
import { TransportSection } from './TransportSection.tsx';
import { AccommodationSection } from './AccommodationSection.tsx';
import { ActivitiesSection } from './ActivitiesSection.tsx';
import { BudgetSection } from './BudgetSection.tsx';
import { InteractiveTripMap } from './InteractiveTripMap.tsx';

interface ResultsDashboardProps {
  plan: TripPlan;
  onEditTrip: () => void;
  onNavigateToItinerary: () => void;
  onOpenTraces: () => void;
  onOptimizeBudget: () => void;
  isOptimizing: boolean;
  onRegenerateSection: (section: 'transport' | 'accommodation' | 'activities', modifier?: string) => void;
  regeneratingSection: string | null;
  onSelectTransport: (opt: TransportOption) => void;
  onSelectStay: (stay: AccommodationOption) => void;
  onSaveTrip: () => void;
  isSaved: boolean;
}

export type ResultsTab = 'overview' | 'map' | 'transport' | 'accommodation' | 'activities' | 'budget';

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  plan,
  onEditTrip,
  onNavigateToItinerary,
  onOpenTraces,
  onOptimizeBudget,
  isOptimizing,
  onRegenerateSection,
  regeneratingSection,
  onSelectTransport,
  onSelectStay,
  onSaveTrip,
  isSaved,
}) => {
  const [activeTab, setActiveTab] = useState<ResultsTab>('overview');

  const tabs: Array<{ id: ResultsTab; label: string; icon: any; count?: string | number }> = [
    { id: 'overview', label: 'Trip Overview', icon: Layers },
    { id: 'map', label: 'Destination Map', icon: MapIcon, count: plan.activities.length + 1 },
    { id: 'transport', label: 'Transportation', icon: Plane, count: plan.transportation.length },
    { id: 'accommodation', label: 'Accommodation', icon: Hotel, count: plan.accommodation.length },
    { id: 'activities', label: 'Activities', icon: Compass, count: plan.activities.length },
    { id: 'budget', label: 'Budget Breakdown', icon: Wallet, count: `${plan.budget.utilizationPercentage}%` },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-6 animate-fadeIn">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={onEditTrip}
            className="px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Edit Parameters</span>
          </button>

          <button
            onClick={onSaveTrip}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isSaved
                ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
                : 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
            }`}
          >
            {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Bookmark className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isSaved ? 'Trip Saved!' : 'Save Trip'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenTraces}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-amber-300 border border-amber-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Agent Logs ({plan.traceLogs.length})</span>
          </button>

          <button
            onClick={onNavigateToItinerary}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <span>View Full Itinerary</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary Trip Executive Summary */}
      <TripSummary
        plan={plan}
        onOptimizeBudget={onOptimizeBudget}
        isOptimizing={isOptimizing}
        onOpenTraces={onOpenTraces}
      />

      {/* Clickable Section Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800/80 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Views */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Transport Card */}
              <div 
                onClick={() => setActiveTab('transport')}
                className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs text-amber-400 font-mono mb-2">
                  <span>Selected Transport</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="font-bold text-sm text-white line-clamp-1">
                  {plan.selectedTransport.provider}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {plan.selectedTransport.duration} · {plan.selectedTransport.stops === 0 ? 'Non-stop' : `${plan.selectedTransport.stops} stop`}
                </div>
                <div className="mt-3 font-mono font-bold text-amber-300 text-sm">
                  {plan.budget.currency} {plan.selectedTransport.price.toLocaleString()}
                </div>
              </div>

              {/* Stay Card */}
              <div 
                onClick={() => setActiveTab('accommodation')}
                className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs text-cyan-400 font-mono mb-2">
                  <span>Selected Stay</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="font-bold text-sm text-white line-clamp-1">
                  {plan.selectedAccommodation.name}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  ★ {plan.selectedAccommodation.rating} · {plan.selectedAccommodation.type}
                </div>
                <div className="mt-3 font-mono font-bold text-cyan-300 text-sm">
                  {plan.budget.currency} {plan.selectedAccommodation.totalPrice.toLocaleString()}
                </div>
              </div>

              {/* Activities Card */}
              <div 
                onClick={() => setActiveTab('activities')}
                className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs text-emerald-400 font-mono mb-2">
                  <span>Curated Experiences</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="font-bold text-sm text-white">
                  {plan.activities.length} Activities Curated
                </div>
                <div className="text-xs text-slate-400 mt-1 line-clamp-1">
                  {plan.activities.slice(0, 2).map(a => a.category).join(', ')}
                </div>
                <div className="mt-3 font-mono font-bold text-emerald-300 text-sm">
                  {plan.budget.currency} {plan.budget.activities.toLocaleString()} total
                </div>
              </div>

              {/* Itinerary CTA Card */}
              <div 
                onClick={onNavigateToItinerary}
                className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-slate-900/90 to-slate-900 border border-amber-500/30 hover:border-amber-400 hover:bg-slate-900 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs text-amber-400 font-mono mb-2">
                  <span>Day Schedule</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="font-bold text-sm text-white">
                  {plan.itinerary.length} Days Planned
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Morning, Afternoon & Evening
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs font-bold text-amber-400">
                  <span>Open Full Schedule</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>

            {/* Interactive Geospatial Map Component */}
            <InteractiveTripMap
              destination={plan.request.destination}
              selectedAccommodation={plan.selectedAccommodation}
              activities={plan.activities}
              currency={plan.budget.currency}
            />

            {/* Budget Visualizer in Overview */}
            <BudgetSection
              budget={plan.budget}
              currency={plan.budget.currency}
              onOptimizeBudget={onOptimizeBudget}
              isOptimizing={isOptimizing}
            />

            {/* Quick Transport & Stay Previews */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TransportSection
                options={plan.transportation}
                selected={plan.selectedTransport}
                currency={plan.budget.currency}
                onSelectOption={onSelectTransport}
                onRegenerate={(mod) => onRegenerateSection('transport', mod)}
                isRegenerating={regeneratingSection === 'transport'}
              />

              <AccommodationSection
                options={plan.accommodation}
                selected={plan.selectedAccommodation}
                currency={plan.budget.currency}
                onSelectStay={onSelectStay}
                onRegenerate={(mod) => onRegenerateSection('accommodation', mod)}
                isRegenerating={regeneratingSection === 'accommodation'}
              />
            </div>
          </div>
        )}

        {activeTab === 'map' && (
          <InteractiveTripMap
            destination={plan.request.destination}
            selectedAccommodation={plan.selectedAccommodation}
            activities={plan.activities}
            currency={plan.budget.currency}
          />
        )}

        {activeTab === 'transport' && (
          <TransportSection
            options={plan.transportation}
            selected={plan.selectedTransport}
            currency={plan.budget.currency}
            onSelectOption={onSelectTransport}
            onRegenerate={(mod) => onRegenerateSection('transport', mod)}
            isRegenerating={regeneratingSection === 'transport'}
          />
        )}

        {activeTab === 'accommodation' && (
          <AccommodationSection
            options={plan.accommodation}
            selected={plan.selectedAccommodation}
            currency={plan.budget.currency}
            onSelectStay={onSelectStay}
            onRegenerate={(mod) => onRegenerateSection('accommodation', mod)}
            isRegenerating={regeneratingSection === 'accommodation'}
          />
        )}

        {activeTab === 'activities' && (
          <ActivitiesSection
            activities={plan.activities}
            currency={plan.budget.currency}
            onRegenerate={(mod) => onRegenerateSection('activities', mod)}
            isRegenerating={regeneratingSection === 'activities'}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetSection
            budget={plan.budget}
            currency={plan.budget.currency}
            onOptimizeBudget={onOptimizeBudget}
            isOptimizing={isOptimizing}
          />
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-800">
        <button
          onClick={onEditTrip}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Edit Trip Parameters</span>
        </button>

        <button
          onClick={onNavigateToItinerary}
          className="px-6 py-2.5 rounded-xl font-bold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center gap-2 shadow-lg shadow-amber-400/20 cursor-pointer transition-all"
        >
          <span>Continue to Detailed Daily Itinerary</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
