import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Calendar,
  Users,
  Wallet,
  Sparkles,
  Plane,
  Train,
  Bus,
  Check,
  AlertCircle,
  Shield,
  Heart,
  Utensils,
  ArrowLeft,
  ArrowRight,
  Zap,
  RotateCcw
} from 'lucide-react';
import { TripRequest, TransportType, AccommodationType, TravelStyle, CrowdPreference } from '../../shared/types.ts';

interface TripFormProps {
  formData: TripRequest;
  onChange: (data: TripRequest) => void;
  onSubmit: (data: TripRequest) => void;
  onBack: () => void;
  isLoading: boolean;
}

export const TripForm: React.FC<TripFormProps> = ({
  formData,
  onChange,
  onSubmit,
  onBack,
  isLoading,
}) => {
  const [validationError, setValidationError] = useState<string | null>(null);

  const interestOptions = [
    'Beaches',
    'Adventure',
    'Local Food',
    'Sightseeing',
    'Museums',
    'Nature',
    'Nightlife',
    'Cultural',
    'Hidden Gems',
  ];

  const foodOptions = [
    'Local Specialties',
    'Seafood',
    'Vegetarian',
    'Vegan',
    'Authentic Street Food',
    'Fine Dining',
  ];

  const presets: Array<{
    name: string;
    destination: string;
    origin: string;
    budget: number;
    currency: string;
    travelers: number;
    travelStyle: TravelStyle;
    accommodationType: AccommodationType;
    interests: string[];
    foodPreferences: string[];
  }> = [
    {
      name: 'Goa Coastal Escape',
      destination: 'Goa',
      origin: 'Mumbai',
      budget: 25000,
      currency: 'INR',
      travelers: 2,
      travelStyle: 'balanced',
      accommodationType: 'mid-range',
      interests: ['Beaches', 'Adventure', 'Local Food', 'Hidden Gems'],
      foodPreferences: ['Local Specialties', 'Seafood'],
    },
    {
      name: 'Tokyo Culture Tour',
      destination: 'Tokyo',
      origin: 'Delhi',
      budget: 180000,
      currency: 'INR',
      travelers: 2,
      travelStyle: 'balanced',
      accommodationType: 'mid-range',
      interests: ['Sightseeing', 'Cultural', 'Local Food', 'Museums'],
      foodPreferences: ['Local Specialties', 'Authentic Street Food'],
    },
    {
      name: 'Interlaken Alps Trail',
      destination: 'Interlaken',
      origin: 'Zurich',
      budget: 150000,
      currency: 'INR',
      travelers: 2,
      travelStyle: 'adventure',
      accommodationType: 'mid-range',
      interests: ['Nature', 'Adventure', 'Sightseeing'],
      foodPreferences: ['Local Specialties', 'Fine Dining'],
    },
  ];

  const handleInterestToggle = (interest: string) => {
    const current = formData.interests || [];
    const updated = current.includes(interest)
      ? current.filter(i => i !== interest)
      : [...current, interest];
    onChange({ ...formData, interests: updated });
  };

  const handleFoodToggle = (item: string) => {
    const current = formData.foodPreferences || [];
    const updated = current.includes(item)
      ? current.filter(f => f !== item)
      : [...current, item];
    onChange({ ...formData, foodPreferences: updated });
  };

  const handleTransportToggle = (type: TransportType) => {
    const current = formData.transportationPreference || [];
    if (current.includes(type)) {
      if (current.length === 1) return; // keep at least one
      onChange({ ...formData, transportationPreference: current.filter(t => t !== type) });
    } else {
      onChange({ ...formData, transportationPreference: [...current, type] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Strict validation
    if (!formData.destination.trim()) {
      setValidationError('Please specify a destination.');
      return;
    }
    if (!formData.origin.trim()) {
      setValidationError('Please specify your starting location.');
      return;
    }
    if (formData.budget <= 0) {
      setValidationError('Budget must be greater than 0.');
      return;
    }
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      setValidationError('End date must be later than start date.');
      return;
    }

    onSubmit(formData);
  };

  const applyPreset = (preset: typeof presets[0]) => {
    onChange({
      ...formData,
      destination: preset.destination,
      origin: preset.origin,
      budget: preset.budget,
      currency: preset.currency,
      travelers: preset.travelers,
      travelStyle: preset.travelStyle,
      accommodationType: preset.accommodationType,
      interests: preset.interests,
      foodPreferences: preset.foodPreferences,
    });
  };

  return (
    <form id="planning-form" onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
      {/* Preset Quick Loader */}
      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="font-semibold">Quick Presets:</span>
          <span className="text-slate-500 hidden md:inline">Auto-fills proven multi-agent configurations</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {presets.map((p) => (
            <button
              type="button"
              key={p.name}
              onClick={() => applyPreset(p)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 text-[11px] text-slate-300 hover:text-white hover:border-amber-400/60 transition-colors cursor-pointer"
            >
              {p.destination} ({p.currency} {p.budget.toLocaleString()})
            </button>
          ))}
        </div>
      </div>

      {validationError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Grid 1: Origin, Destination, Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Origin */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            Starting Location
          </label>
          <input
            type="text"
            required
            value={formData.origin}
            onChange={(e) => onChange({ ...formData, origin: e.target.value })}
            placeholder="e.g. Mumbai, New York, Delhi"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
          />
        </div>

        {/* Destination */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-orange-400" />
            Destination
          </label>
          <input
            type="text"
            required
            value={formData.destination}
            onChange={(e) => onChange({ ...formData, destination: e.target.value })}
            placeholder="e.g. Goa, Tokyo, Paris"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
          />
        </div>

        {/* Start Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            Departure Date
          </label>
          <input
            type="date"
            required
            value={formData.startDate}
            onChange={(e) => onChange({ ...formData, startDate: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-amber-400 transition-all"
          />
        </div>

        {/* End Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            Return Date
          </label>
          <input
            type="date"
            required
            value={formData.endDate}
            onChange={(e) => onChange({ ...formData, endDate: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-amber-400 transition-all"
          />
        </div>
      </div>

      {/* Grid 2: Travelers, Budget, Currency, Travel Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Travelers */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            Travelers
          </label>
          <input
            type="number"
            min={1}
            max={20}
            required
            value={formData.travelers}
            onChange={(e) => onChange({ ...formData, travelers: parseInt(e.target.value) || 1 })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-amber-400 transition-all"
          />
        </div>

        {/* Total Budget */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            Total Budget
          </label>
          <div className="relative">
            <input
              type="number"
              min={100}
              step={500}
              required
              value={formData.budget}
              onChange={(e) => onChange({ ...formData, budget: parseFloat(e.target.value) || 0 })}
              className="w-full pl-3.5 pr-14 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-amber-400 transition-all"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 font-mono">
              {formData.currency}
            </span>
          </div>
        </div>

        {/* Currency Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">
            Currency
          </label>
          <select
            value={formData.currency}
            onChange={(e) => onChange({ ...formData, currency: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-amber-400 transition-all"
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="JPY">JPY (¥)</option>
          </select>
        </div>

        {/* Travel Style */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">
            Travel Style
          </label>
          <select
            value={formData.travelStyle}
            onChange={(e) => onChange({ ...formData, travelStyle: e.target.value as TravelStyle })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-amber-400 transition-all capitalize"
          >
            <option value="balanced">Balanced (Culture & Leisure)</option>
            <option value="relaxed">Relaxed (Slow & Scenic)</option>
            <option value="fast-paced">Fast-Paced (High Sightseeing)</option>
            <option value="adventure">Adventure (Outdoor & Active)</option>
            <option value="budget">Strict Budget (Cost-saver)</option>
            <option value="luxury">Luxury (Premium Stays)</option>
          </select>
        </div>
      </div>

      {/* Grid 3: Accommodation Type & Crowd Preference */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Accommodation Preference */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">
            Accommodation Preference
          </label>
          <select
            value={formData.accommodationType}
            onChange={(e) => onChange({ ...formData, accommodationType: e.target.value as AccommodationType })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-amber-400 transition-all"
          >
            <option value="mid-range">Mid-Range Hotel / Boutique Stay</option>
            <option value="budget_hotel">Budget Hotel / Guest House</option>
            <option value="hostel">Hostel & Social Pods</option>
            <option value="luxury_resort">Luxury Seaside Resort & Spa</option>
            <option value="homestay">Authentic Heritage Homestay</option>
            <option value="villa">Private Beach Villa</option>
          </select>
        </div>

        {/* Crowd Preference */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">
            Crowd Density Preference
          </label>
          <select
            value={formData.crowdPreference}
            onChange={(e) => onChange({ ...formData, crowdPreference: e.target.value as CrowdPreference })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-amber-400 transition-all"
          >
            <option value="avoid_crowded">Avoid Crowded Hotspots (Secret / Hidden Gems)</option>
            <option value="balanced">Balanced Mix of Iconic Landmarks & Quiet Spots</option>
            <option value="popular_hotspots">Popular Mainstream Attractions & Lively Hubs</option>
          </select>
        </div>
      </div>

      {/* Transportation Preferences (Segmented multi-select) */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300">
          Transportation Modes Considered
        </label>
        <div className="flex flex-wrap gap-2">
          {(['flight', 'train', 'bus'] as TransportType[]).map((t) => {
            const isSelected = formData.transportationPreference.includes(t);
            return (
              <button
                type="button"
                key={t}
                onClick={() => handleTransportToggle(t)}
                className={`px-4 py-2 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-amber-500/60 bg-amber-500/10 text-amber-200'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                {t === 'flight' && <Plane className="w-3.5 h-3.5" />}
                {t === 'train' && <Train className="w-3.5 h-3.5" />}
                {t === 'bus' && <Bus className="w-3.5 h-3.5" />}
                <span className="capitalize">{t}</span>
                {isSelected && <Check className="w-3 h-3 text-amber-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interests & Activities Selection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-rose-400" />
          Interests & Planned Activities
        </label>
        <div className="flex flex-wrap gap-2">
          {interestOptions.map((item) => {
            const isSelected = (formData.interests || []).includes(item);
            return (
              <button
                type="button"
                key={item}
                onClick={() => handleInterestToggle(item)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-200 font-semibold'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {/* Food Preferences */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Utensils className="w-3.5 h-3.5 text-amber-400" />
          Food & Dining Preferences
        </label>
        <div className="flex flex-wrap gap-2">
          {foodOptions.map((item) => {
            const isSelected = (formData.foodPreferences || []).includes(item);
            return (
              <button
                type="button"
                key={item}
                onClick={() => handleFoodToggle(item)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-200 font-semibold'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {/* Additional Requirements */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300">
          Additional Requirements / Notes
        </label>
        <textarea
          rows={2}
          value={formData.additionalRequirements || ''}
          onChange={(e) => onChange({ ...formData, additionalRequirements: e.target.value })}
          placeholder="e.g. Avoid crowded tourist places. Prefer sunset ocean spots and authentic coastal dining."
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 transition-all resize-none"
        />
      </div>

      {/* Submit & Navigation Triggers */}
      <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Orchestrating Agents...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Deploy Agents & Plan My Trip</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};
