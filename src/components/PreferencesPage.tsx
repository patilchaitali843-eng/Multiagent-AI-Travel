import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sliders, Save, Check, Sparkles, User, Heart, Shield, Utensils, ArrowRight } from 'lucide-react';
import { UserPreferences, AccommodationType, TravelStyle, CrowdPreference, TransportType } from '../../shared/types.ts';

interface PreferencesPageProps {
  onBack: () => void;
  onPlanTrip: () => void;
  onPreferencesUpdated: (prefs: UserPreferences) => void;
}

export const PreferencesPage: React.FC<PreferencesPageProps> = ({
  onBack,
  onPlanTrip,
  onPreferencesUpdated,
}) => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    preferredAccommodation: 'mid-range',
    preferredActivities: ['Beaches', 'Adventure', 'Local Food'],
    foodPreferences: ['Local Specialties', 'Seafood'],
    travelStyle: 'balanced',
    preferredTransport: ['flight', 'train'],
    crowdPreference: 'avoid_crowded',
    currency: 'INR',
  });
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/preferences')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.preferredAccommodation) {
          setPreferences(data);
        }
      })
      .catch((err) => console.warn('Could not load preferences', err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      const res = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });
      const data = await res.json();
      setIsSaved(true);
      onPreferencesUpdated(data);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err) {
      console.error('Failed to save preferences', err);
    }
  };

  const activityOptions = ['Beaches', 'Adventure', 'Local Food', 'Sightseeing', 'Museums', 'Nature', 'Nightlife', 'Cultural', 'Hidden Gems'];
  const foodOptions = ['Local Specialties', 'Seafood', 'Vegetarian', 'Vegan', 'Authentic Street Food', 'Fine Dining'];

  const toggleActivity = (act: string) => {
    const cur = preferences.preferredActivities || [];
    if (cur.includes(act)) {
      setPreferences({ ...preferences, preferredActivities: cur.filter(a => a !== act) });
    } else {
      setPreferences({ ...preferences, preferredActivities: [...cur, act] });
    }
  };

  const toggleFood = (item: string) => {
    const cur = preferences.foodPreferences || [];
    if (cur.includes(item)) {
      setPreferences({ ...preferences, foodPreferences: cur.filter(f => f !== item) });
    } else {
      setPreferences({ ...preferences, foodPreferences: [...cur, item] });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
            <Sliders className="w-4 h-4" />
            <span>Persistent Traveler Profile</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Traveler Preferences & Memory
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Preferences stored here are automatically remembered and applied when generating subsequent trips.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          <button
            onClick={onPlanTrip}
            className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>Plan Trip</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
        {/* Style & Accommodation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">
              Default Accommodation Preference
            </label>
            <select
              value={preferences.preferredAccommodation}
              onChange={(e) => setPreferences({ ...preferences, preferredAccommodation: e.target.value as AccommodationType })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs"
            >
              <option value="mid-range">Mid-Range Hotel / Boutique Stay</option>
              <option value="budget_hotel">Budget Hotel / Guest House</option>
              <option value="hostel">Hostel & Social Pods</option>
              <option value="luxury_resort">Luxury Seaside Resort & Spa</option>
              <option value="homestay">Authentic Heritage Homestay</option>
              <option value="villa">Private Beach Villa</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">
              Default Travel Pace
            </label>
            <select
              value={preferences.travelStyle}
              onChange={(e) => setPreferences({ ...preferences, travelStyle: e.target.value as TravelStyle })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs"
            >
              <option value="balanced">Balanced (Leisure & Exploration)</option>
              <option value="relaxed">Relaxed (Slow & Scenic)</option>
              <option value="fast-paced">Fast-Paced (High Density)</option>
              <option value="adventure">Adventure (Active & Outdoor)</option>
              <option value="budget">Budget (Cost-Optimizer)</option>
              <option value="luxury">Luxury (High Comfort)</option>
            </select>
          </div>
        </div>

        {/* Crowd Preference */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200">
            Crowd Density Preference
          </label>
          <select
            value={preferences.crowdPreference}
            onChange={(e) => setPreferences({ ...preferences, crowdPreference: e.target.value as CrowdPreference })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs"
          >
            <option value="avoid_crowded">Avoid Crowded Hotspots (Secret / Hidden Gems)</option>
            <option value="balanced">Balanced Mix of Iconic Landmarks & Quiet Spots</option>
            <option value="popular_hotspots">Popular Mainstream Attractions & Lively Hubs</option>
          </select>
        </div>

        {/* Preferred Activity Interests */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            Favorite Activity Categories
          </label>
          <div className="flex flex-wrap gap-2">
            {activityOptions.map((opt) => {
              const isSelected = (preferences.preferredActivities || []).includes(opt);
              return (
                <button
                  type="button"
                  key={opt}
                  onClick={() => toggleActivity(opt)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-200 font-semibold'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dietary & Dining */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <Utensils className="w-3.5 h-3.5 text-amber-400" />
            Dietary & Dining Preferences
          </label>
          <div className="flex flex-wrap gap-2">
            {foodOptions.map((opt) => {
              const isSelected = (preferences.foodPreferences || []).includes(opt);
              return (
                <button
                  type="button"
                  key={opt}
                  onClick={() => toggleFood(opt)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-200 font-semibold'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Save CTA */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            {isSaved ? '✓ Successfully saved to database!' : 'Synchronized with backend user memory.'}
          </span>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl font-bold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center gap-2 shadow-lg shadow-amber-400/20 cursor-pointer transition-all"
          >
            {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'Preferences Saved' : 'Save Preferences'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
