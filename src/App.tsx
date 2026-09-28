/**
 * Multi-Agent AI Travel Planner - Main Application
 * Multi-page / multi-step routing with URL hash sync and persistent state.
 */

import React, { useState, useEffect } from 'react';
import { Navbar, AppRoute } from './components/Navbar.tsx';
import { Stepper } from './components/Stepper.tsx';
import { Hero } from './components/Hero.tsx';
import { TripForm } from './components/TripForm.tsx';
import { AgentProcessingPage } from './components/AgentProcessingPage.tsx';
import { ResultsDashboard } from './components/ResultsDashboard.tsx';
import { DetailedItineraryPage } from './components/DetailedItineraryPage.tsx';
import { PreferencesPage } from './components/PreferencesPage.tsx';
import { ArchitecturePage } from './components/ArchitecturePage.tsx';
import { SavedTripsPage } from './components/SavedTripsPage.tsx';
import { AgentTraceModal } from './components/AgentTraceModal.tsx';
import {
  TripRequest,
  TripPlan,
  TransportOption,
  AccommodationOption,
  UserPreferences,
} from '../shared/types.ts';
import { Compass, AlertCircle, ArrowUp } from 'lucide-react';

const defaultGoaRequest: TripRequest = {
  destination: 'Goa',
  origin: 'Mumbai',
  startDate: '2026-12-15',
  endDate: '2026-12-18',
  travelers: 2,
  budget: 25000,
  currency: 'INR',
  travelStyle: 'balanced',
  accommodationType: 'mid-range',
  foodPreferences: ['Local Specialties', 'Seafood'],
  interests: ['Beaches', 'Adventure', 'Local Food', 'Hidden Gems'],
  transportationPreference: ['flight', 'train'],
  crowdPreference: 'avoid_crowded',
  additionalRequirements: 'Avoid crowded tourist places. Prefer secluded coastal coves and authentic local dining.',
};

async function readJsonResponse<T>(response: Response, defaultError: string): Promise<T> {
  const rawText = await response.text();

  if (!rawText || !rawText.trim()) {
    if (!response.ok) {
      throw new Error(defaultError);
    }
    throw new Error('Server returned an empty response.');
  }

  try {
    const parsed = JSON.parse(rawText) as T;

    if (!response.ok) {
      const apiError =
        typeof parsed === 'object' && parsed !== null && 'error' in parsed
          ? String((parsed as { error?: string }).error)
          : undefined;
      throw new Error(apiError || defaultError);
    }

    return parsed;
  } catch (parseError) {
    if (!response.ok) {
      throw new Error(rawText.trim() || defaultError);
    }

    throw new Error(`Received an invalid JSON response while ${defaultError.toLowerCase()}.`);
  }
}

export default function App() {
  // Navigation & Route state
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('landing');

  // Application Data States
  const [formData, setFormData] = useState<TripRequest>(() => {
    try {
      const saved = localStorage.getItem('travel_planner_form');
      return saved ? JSON.parse(saved) : defaultGoaRequest;
    } catch {
      return defaultGoaRequest;
    }
  });

  const [plan, setPlan] = useState<TripPlan | null>(() => {
    try {
      const saved = localStorage.getItem('travel_planner_active_plan');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [regeneratingSection, setRegeneratingSection] = useState<'transport' | 'accommodation' | 'activities' | null>(null);
  const [regeneratingDay, setRegeneratingDay] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSavedTrip, setIsSavedTrip] = useState<boolean>(false);

  // Modals & Panels
  const [isTracesOpen, setIsTracesOpen] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('travel_planner_demo_mode');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // Sync route with URL Hash for seamless back/forward browser navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '') as AppRoute;
      const validRoutes: AppRoute[] = [
        'landing',
        'configure',
        'processing',
        'results',
        'itinerary',
        'preferences',
        'architecture',
        'saved',
      ];
      if (validRoutes.includes(hash)) {
        setCurrentRoute(hash);
      } else if (!hash) {
        setCurrentRoute('landing');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (route: AppRoute) => {
    setCurrentRoute(route);
    window.location.hash = `#/${route}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Persist form and plan state
  useEffect(() => {
    try {
      localStorage.setItem('travel_planner_form', JSON.stringify(formData));
    } catch (e) {}
  }, [formData]);

  useEffect(() => {
    try {
      if (plan) {
        localStorage.setItem('travel_planner_active_plan', JSON.stringify(plan));
      }
    } catch (e) {}
  }, [plan]);

  useEffect(() => {
    try {
      localStorage.setItem('travel_planner_demo_mode', JSON.stringify(isDemoMode));
    } catch (e) {}
  }, [isDemoMode]);

  // Load preferences memory on start
  useEffect(() => {
    fetch('/api/user/preferences')
      .then(async (res) => {
        try {
          const prefs = await readJsonResponse<UserPreferences>(res, 'Failed to load preferences');
          if (prefs && prefs.preferredAccommodation) {
            setFormData((prev) => ({
              ...prev,
              accommodationType: prefs.preferredAccommodation,
              travelStyle: prefs.travelStyle || prev.travelStyle,
              crowdPreference: prefs.crowdPreference || prev.crowdPreference,
            }));
          }
        } catch {
          // Ignore preference load failures and keep defaults.
        }
      })
      .catch(() => {});
  }, []);

  // Primary Trip Generation Flow
  const handleStartGeneration = async (request: TripRequest) => {
    setIsLoading(true);
    setErrorMessage(null);
    setIsSavedTrip(false);

    // Navigate immediately to processing page
    navigateTo('processing');

    try {
      // 1. Create trip record
      const createRes = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const createText = await createRes.text();

      if (!createRes.ok) {
        let backendMessage = 'Failed to create trip request';

        if (createText && createText.trim()) {
          try {
            const parsed = JSON.parse(createText) as { error?: string; details?: string };
            backendMessage = parsed.error || parsed.details || backendMessage;
          } catch {
            backendMessage = createText.trim();
          }
        }

        throw new Error(backendMessage);
      }

      if (!createText || !createText.trim()) {
        throw new Error('Trip creation returned an empty response.');
      }

      let created: { id: string };
      try {
        created = JSON.parse(createText) as { id: string };
      } catch {
        throw new Error('Trip creation returned an invalid JSON response.');
      }

      if (!created?.id) {
        throw new Error('Trip creation response did not include a trip id.');
      }

      // 2. Execute multi-agent orchestrator
      const genRes = await fetch(`/api/trips/${created.id}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const generatedPlan: TripPlan = await readJsonResponse<TripPlan>(
        genRes,
        'Agent orchestration failed'
      );

      setPlan(generatedPlan);
      // Auto save to server session
      saveTripToStore(generatedPlan);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error occurred while planning trip');
    } finally {
      setIsLoading(false);
    }
  };

  const saveTripToStore = (targetPlan: TripPlan) => {
    try {
      const localStr = localStorage.getItem('saved_trips_store');
      const list: TripPlan[] = localStr ? JSON.parse(localStr) : [];
      const updated = [targetPlan, ...list.filter((t) => t.id !== targetPlan.id)];
      localStorage.setItem('saved_trips_store', JSON.stringify(updated));
      setIsSavedTrip(true);
    } catch (e) {
      console.warn('Failed to save trip to localStorage', e);
    }
  };

  // 1-Click Budget Optimizer
  const handleOptimizeBudget = async () => {
    if (!plan) return;
    setIsOptimizing(true);
    try {
      const res = await fetch(`/api/trips/${plan.id}/optimize-budget`, {
        method: 'POST',
      });
      const updated = await readJsonResponse<TripPlan>(res, 'Budget optimization failed');
      setPlan(updated);
      saveTripToStore(updated);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to optimize budget');
    } finally {
      setIsOptimizing(false);
    }
  };

  // Section Regenerator
  const handleRegenerateSection = async (
    section: 'transport' | 'accommodation' | 'activities',
    modifier?: string
  ) => {
    if (!plan) return;
    setRegeneratingSection(section);
    try {
      const res = await fetch(`/api/trips/${plan.id}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, promptModifier: modifier }),
      });
      const updated = await readJsonResponse<TripPlan>(
        res,
        `Regenerating ${section} failed`
      );
      setPlan(updated);
      saveTripToStore(updated);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || `Failed to regenerate ${section}`);
    } finally {
      setRegeneratingSection(null);
    }
  };

  // Single Day Regenerator
  const handleRegenerateDay = async (dayNumber: number) => {
    if (!plan) return;
    setRegeneratingDay(dayNumber);
    try {
      const res = await fetch(`/api/trips/${plan.id}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'day', targetDay: dayNumber }),
      });
      const updated = await readJsonResponse<TripPlan>(
        res,
        `Regenerating Day ${dayNumber} failed`
      );
      setPlan(updated);
      saveTripToStore(updated);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || `Failed to regenerate Day ${dayNumber}`);
    } finally {
      setRegeneratingDay(null);
    }
  };

  // Manual transport switcher
  const handleSelectTransport = (option: TransportOption) => {
    if (!plan) return;
    const updated = {
      ...plan,
      selectedTransport: option,
    };
    setPlan(updated);
    saveTripToStore(updated);
  };

  // Manual stay switcher
  const handleSelectStay = (stay: AccommodationOption) => {
    if (!plan) return;
    const updated = {
      ...plan,
      selectedAccommodation: stay,
    };
    setPlan(updated);
    saveTripToStore(updated);
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Functional Navbar */}
      <Navbar
        currentRoute={currentRoute}
        onNavigate={navigateTo}
        onOpenTraces={() => setIsTracesOpen(true)}
        hasTrip={Boolean(plan)}
        isDemoMode={isDemoMode}
        onToggleDemoMode={() => setIsDemoMode(!isDemoMode)}
        traceCount={plan?.traceLogs.length || 0}
      />

      {/* Multi-Step Stepper Navigation Bar */}
      <Stepper
        currentRoute={currentRoute}
        onNavigate={navigateTo}
        hasTrip={Boolean(plan)}
      />

      {/* Main Multi-Page Views */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Global Error Notice if any */}
        {errorMessage && currentRoute !== 'processing' && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs text-rose-400 hover:text-rose-200"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 1. Landing Page View */}
        {currentRoute === 'landing' && (
          <div className="space-y-12">
            <Hero
              onPlanTrip={() => navigateTo('configure')}
              onApplyPreset={(preset) => {
                setFormData((prev) => ({ ...prev, ...preset }));
                navigateTo('configure');
              }}
              onOpenArchitecture={() => navigateTo('architecture')}
            />
          </div>
        )}

        {/* 2. Configure Trip Page View */}
        {currentRoute === 'configure' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
                <span>Step 1 of 4</span>
                <span aria-hidden="true">·</span>
                <span>Trip Configuration Parameters</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                Customize Your Vacation Parameters
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Set destination, origin, dates, budget, and travel preferences. Our multi-agent swarm will research and optimize your trip.
              </p>
            </div>

            <TripForm
              formData={formData}
              onChange={setFormData}
              onSubmit={handleStartGeneration}
              onBack={() => navigateTo('landing')}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* 3. Agent Research / Processing Page View */}
        {currentRoute === 'processing' && (
          <AgentProcessingPage
            request={formData}
            plan={plan}
            isLoading={isLoading}
            errorMessage={errorMessage}
            onNavigateToResults={() => navigateTo('results')}
            onBackToConfigure={() => navigateTo('configure')}
            onRetry={() => handleStartGeneration(formData)}
          />
        )}

        {/* 4. Results Dashboard View */}
        {currentRoute === 'results' && plan && (
          <ResultsDashboard
            plan={plan}
            onEditTrip={() => navigateTo('configure')}
            onNavigateToItinerary={() => navigateTo('itinerary')}
            onOpenTraces={() => setIsTracesOpen(true)}
            onOptimizeBudget={handleOptimizeBudget}
            isOptimizing={isOptimizing}
            onRegenerateSection={handleRegenerateSection}
            regeneratingSection={regeneratingSection}
            onSelectTransport={handleSelectTransport}
            onSelectStay={handleSelectStay}
            onSaveTrip={() => saveTripToStore(plan)}
            isSaved={isSavedTrip}
          />
        )}

        {/* Fallback if user navigates to results with no trip yet */}
        {currentRoute === 'results' && !plan && (
          <div className="max-w-md mx-auto text-center py-16 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">No Active Trip Plan Found</h3>
            <p className="text-xs text-slate-400">
              Configure your travel dates and budget to let our autonomous agents generate a personalized plan.
            </p>
            <button
              onClick={() => navigateTo('configure')}
              className="px-6 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-colors cursor-pointer"
            >
              Start Planning Trip
            </button>
          </div>
        )}

        {/* 5. Detailed Itinerary Page View */}
        {currentRoute === 'itinerary' && plan && (
          <DetailedItineraryPage
            plan={plan}
            onBackToResults={() => navigateTo('results')}
            onEditTrip={() => navigateTo('configure')}
            onRegenerateDay={handleRegenerateDay}
            isRegeneratingDay={regeneratingDay}
            onSaveTrip={() => saveTripToStore(plan)}
            isSaved={isSavedTrip}
          />
        )}

        {currentRoute === 'itinerary' && !plan && (
          <div className="max-w-md mx-auto text-center py-16 space-y-4">
            <h3 className="text-lg font-bold text-white">No Itinerary Available</h3>
            <p className="text-xs text-slate-400">
              Please plan a trip first to review the full day-by-day itinerary schedule.
            </p>
            <button
              onClick={() => navigateTo('configure')}
              className="px-6 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-colors cursor-pointer"
            >
              Configure Trip
            </button>
          </div>
        )}

        {/* 6. Saved Trips Page View */}
        {currentRoute === 'saved' && (
          <SavedTripsPage
            onLoadTrip={(savedPlan) => {
              setPlan(savedPlan);
              setFormData(savedPlan.request);
              navigateTo('results');
            }}
            onNewTrip={() => navigateTo('configure')}
          />
        )}

        {/* 7. Preferences Memory Page View */}
        {currentRoute === 'preferences' && (
          <PreferencesPage
            onBack={() => navigateTo(plan ? 'results' : 'landing')}
            onPlanTrip={() => navigateTo('configure')}
            onPreferencesUpdated={(newPrefs) => {
              setFormData((prev) => ({
                ...prev,
                accommodationType: newPrefs.preferredAccommodation,
                travelStyle: newPrefs.travelStyle,
                crowdPreference: newPrefs.crowdPreference,
              }));
            }}
          />
        )}

        {/* 8. System Architecture Page View */}
        {currentRoute === 'architecture' && (
          <ArchitecturePage
            onBack={() => navigateTo(plan ? 'results' : 'landing')}
            onPlanTrip={() => navigateTo('configure')}
          />
        )}
      </main>

      {/* Floating Back to Top Button */}
      {(currentRoute === 'results' || currentRoute === 'itinerary') && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xl transition-all z-30 cursor-pointer"
          title="Scroll to Top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Observability Traces Modal (Accessible from header or button anywhere) */}
      <AgentTraceModal
        isOpen={isTracesOpen}
        onClose={() => setIsTracesOpen(false)}
        logs={plan?.traceLogs || []}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-8 text-xs text-slate-500 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Compass className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-slate-300">Multi-Agent AI Travel Planner</span>
            <span aria-hidden="true">·</span>
            <span>Production Portfolio Project</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={() => navigateTo('configure')} className="hover:text-amber-300 cursor-pointer">Configure</button>
            <span aria-hidden="true">·</span>
            <button onClick={() => navigateTo('architecture')} className="hover:text-cyan-300 cursor-pointer">Architecture</button>
            <span aria-hidden="true">·</span>
            <button onClick={() => navigateTo('preferences')} className="hover:text-amber-300 cursor-pointer">Preferences</button>
            <span aria-hidden="true">·</span>
            <button onClick={() => navigateTo('saved')} className="hover:text-white cursor-pointer">Saved Trips</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
