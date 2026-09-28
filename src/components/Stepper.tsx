import React from 'react';
import { Check, Compass, Sliders, Cpu, BarChart3, Calendar, ChevronRight } from 'lucide-react';
import { AppRoute } from './Navbar.tsx';

interface StepperProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  hasTrip: boolean;
}

export const Stepper: React.FC<StepperProps> = ({ currentRoute, onNavigate, hasTrip }) => {
  if (currentRoute === 'landing' || currentRoute === 'architecture' || currentRoute === 'preferences' || currentRoute === 'saved') {
    return null;
  }

  const steps = [
    { id: 'configure' as AppRoute, label: 'Trip Configuration', icon: Sliders, enabled: true },
    { id: 'processing' as AppRoute, label: 'Agent Processing', icon: Cpu, enabled: true },
    { id: 'results' as AppRoute, label: 'Results Dashboard', icon: BarChart3, enabled: hasTrip },
    { id: 'itinerary' as AppRoute, label: 'Detailed Itinerary', icon: Calendar, enabled: hasTrip },
  ];

  const getStepIndex = (route: AppRoute) => {
    switch (route) {
      case 'configure': return 0;
      case 'processing': return 1;
      case 'results': return 2;
      case 'itinerary': return 3;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(currentRoute);

  return (
    <nav aria-label="Planning Progress" className="max-w-4xl mx-auto px-4 py-3 mb-6">
      <div className="flex items-center justify-between relative">
        {/* Background connecting bar */}
        <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-0.5 bg-slate-800 -z-0" />
        
        {steps.map((step, idx) => {
          const isCurrent = currentRoute === step.id;
          const isCompleted = currentIndex > idx;
          const isClickable = step.enabled && currentRoute !== 'processing';
          const Icon = step.icon;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <button
                type="button"
                onClick={() => {
                  if (isClickable) onNavigate(step.id);
                }}
                disabled={!isClickable}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                  isCurrent
                    ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/20 shadow-lg shadow-amber-400/20'
                    : isCompleted
                    ? 'bg-emerald-500 text-white hover:bg-emerald-400 cursor-pointer'
                    : isClickable
                    ? 'bg-slate-900 border border-slate-700 text-slate-300 hover:border-slate-500 cursor-pointer'
                    : 'bg-slate-900/60 border border-slate-800 text-slate-600 cursor-not-allowed'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </button>
              <span
                className={`text-[11px] mt-1.5 font-medium whitespace-nowrap hidden sm:block ${
                  isCurrent ? 'text-amber-300 font-semibold' : isCompleted ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </nav>
  );
};
