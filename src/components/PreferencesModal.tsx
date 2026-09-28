import React, { useState, useEffect } from 'react';
import { X, Sliders, Save, Check, Sparkles } from 'lucide-react';
import { UserPreferences, AccommodationType, TravelStyle, CrowdPreference } from '../../shared/types.ts';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPreferencesUpdated: (prefs: UserPreferences) => void;
}

export const PreferencesModal: React.FC<PreferencesModalProps> = ({
  isOpen,
  onClose,
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

  useEffect(() => {
    if (isOpen) {
      fetch('/api/user/preferences')
        .then(res => res.json())
        .then(data => {
          if (data) setPreferences(data);
        })
        .catch(err => console.error('Failed to load user preferences', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 900);
    } catch (err) {
      console.error('Failed to save preferences', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[#0d121c] border border-slate-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Traveler Memory & Preferences</h3>
              <p className="text-xs text-slate-400">
                Persists your preferences across all subsequent trip planning requests
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-slate-300 overflow-y-auto max-h-[70vh]">
          {/* Accommodation Style */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-200">Default Accommodation Style</label>
            <select
              value={preferences.preferredAccommodation}
              onChange={(e) => setPreferences({ ...preferences, preferredAccommodation: e.target.value as AccommodationType })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
            >
              <option value="mid-range">Mid-Range Hotel / Boutique Stay</option>
              <option value="budget_hotel">Budget Hotel / Guest House</option>
              <option value="hostel">Hostel & Social Pods</option>
              <option value="luxury_resort">Luxury Seaside Resort & Spa</option>
              <option value="homestay">Authentic Heritage Homestay</option>
            </select>
          </div>

          {/* Travel Style */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-200">Default Travel Pace</label>
            <select
              value={preferences.travelStyle}
              onChange={(e) => setPreferences({ ...preferences, travelStyle: e.target.value as TravelStyle })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
            >
              <option value="balanced">Balanced (Leisure & Exploration)</option>
              <option value="relaxed">Relaxed (Scenic & Slow)</option>
              <option value="fast-paced">Fast-Paced (High Density)</option>
              <option value="adventure">Adventure (Active & Outdoor)</option>
              <option value="budget">Budget (Cost-Optimizer)</option>
            </select>
          </div>

          {/* Crowd Preference */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-200">Crowd Avoidance Preference</label>
            <select
              value={preferences.crowdPreference}
              onChange={(e) => setPreferences({ ...preferences, crowdPreference: e.target.value as CrowdPreference })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
            >
              <option value="avoid_crowded">Avoid Crowded Hotspots (Secret / Hidden Gems)</option>
              <option value="balanced">Balanced Mix</option>
              <option value="popular_hotspots">Popular Mainstream Spots</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSaved ? 'Preferences Saved!' : 'Save to Memory'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
