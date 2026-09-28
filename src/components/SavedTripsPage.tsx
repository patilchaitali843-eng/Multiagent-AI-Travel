import React, { useEffect, useState } from 'react';
import { BookmarkCheck, Calendar, MapPin, Users, Wallet, ArrowRight, Trash2, Plus, Download } from 'lucide-react';
import { TripPlan } from '../../shared/types.ts';

interface SavedTripsPageProps {
  onLoadTrip: (plan: TripPlan) => void;
  onNewTrip: () => void;
}

export const SavedTripsPage: React.FC<SavedTripsPageProps> = ({ onLoadTrip, onNewTrip }) => {
  const [trips, setTrips] = useState<TripPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTrips = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch from server
      const res = await fetch('/api/trips');
      let serverTrips: TripPlan[] = [];
      if (res.ok) {
        serverTrips = await res.json();
      }

      // 2. Fetch from localStorage backup
      const localStr = localStorage.getItem('saved_trips_store');
      const localTrips: TripPlan[] = localStr ? JSON.parse(localStr) : [];

      // Combine unique by id
      const map = new Map<string, TripPlan>();
      localTrips.forEach(t => map.set(t.id, t));
      serverTrips.forEach(t => map.set(t.id, t));

      setTrips(Array.from(map.values()));
    } catch (e) {
      console.warn('Failed to load trips list', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleDelete = (tripId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = trips.filter(t => t.id !== tripId);
    setTrips(updated);
    localStorage.setItem('saved_trips_store', JSON.stringify(updated));
  };

  const handleExport = (trip: TripPlan, e: React.MouseEvent) => {
    e.stopPropagation();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(trip, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `${trip.request.destination}-itinerary.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
            <BookmarkCheck className="w-4 h-4" />
            <span>Persisted Itineraries</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Saved Trips & Itineraries
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Revisit your multi-agent planned vacations, export schedules, or make adjustments.
          </p>
        </div>

        <button
          onClick={onNewTrip}
          className="px-4 py-2.5 rounded-xl font-bold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center gap-2 shadow-lg shadow-amber-400/20 cursor-pointer self-start sm:self-auto transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Plan a New Trip</span>
        </button>
      </div>

      {/* Trips List */}
      {isLoading ? (
        <div className="text-center py-16 text-slate-500 font-mono text-xs">
          Loading saved itineraries...
        </div>
      ) : trips.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <BookmarkCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Saved Trips Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Plan your first vacation with our multi-agent AI to automatically save itineraries to your collection.
          </p>
          <button
            onClick={onNewTrip}
            className="px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-colors cursor-pointer"
          >
            Start Planning Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trips.map((t) => (
            <div
              key={t.id}
              onClick={() => onLoadTrip(t)}
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 transition-all cursor-pointer flex flex-col justify-between group space-y-4"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
                  <span className="text-amber-400 font-semibold">{t.itinerary.length} Days</span>
                  <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                  {t.request.destination}
                </h3>

                <div className="mt-2 space-y-1 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>From {t.request.origin}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t.request.startDate} to {t.request.endDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-mono">{t.budget.currency} {t.budget.totalCost.toLocaleString()} spent of {t.budget.currency} {t.budget.budget.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleExport(t, e)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Export JSON"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(t.id, e)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Delete Saved Trip"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1 text-xs font-semibold text-amber-400 group-hover:translate-x-0.5 transition-transform">
                  <span>Open Trip</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
