/**
 * In-memory & JSON file-backed database layer for Multi-Agent AI Travel Planner.
 * Mirrors relational PostgreSQL schema for fast interactive development.
 */

import { TripPlan, UserPreferences, TripRequest } from '../shared/types.ts';

// Initial default user preferences memory
const defaultPreferences: UserPreferences = {
  preferredAccommodation: 'mid-range',
  preferredActivities: ['Beaches', 'Adventure', 'Food & Culinary'],
  foodPreferences: ['Local Specialties', 'Seafood & Vegetarian Options'],
  travelStyle: 'balanced',
  preferredTransport: ['flight', 'train'],
  crowdPreference: 'avoid_crowded',
  currency: 'INR',
};

class DatabaseStore {
  private trips: Map<string, TripPlan> = new Map();
  private userPreferences: UserPreferences = { ...defaultPreferences };

  constructor() {
    this.seedDefaultTrip();
  }

  private seedDefaultTrip() {
    // Pre-populate with Goa showcase trip
    const defaultRequest: TripRequest = {
      id: 'demo-goa-2026',
      destination: 'Goa',
      origin: 'Mumbai',
      startDate: '2026-12-15',
      endDate: '2026-12-18',
      travelers: 2,
      budget: 25000,
      currency: 'INR',
      travelStyle: 'balanced',
      accommodationType: 'mid-range',
      foodPreferences: ['Local Goan & Seafood', 'Vegetarian Konkani Thalis'],
      interests: ['Beaches', 'Adventure', 'Local Food', 'Hidden Gems'],
      transportationPreference: ['flight', 'train'],
      crowdPreference: 'avoid_crowded',
      additionalRequirements: 'Avoid crowded tourist spots. Prefer secluded tranquil beaches and authentic local food.',
      createdAt: new Date().toISOString(),
    };

    // We can lazily generate or let user click generate
  }

  public getTrip(id: string): TripPlan | undefined {
    return this.trips.get(id);
  }

  public saveTrip(trip: TripPlan): TripPlan {
    this.trips.set(trip.id, trip);
    return trip;
  }

  public listTrips(): TripPlan[] {
    return Array.from(this.trips.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getUserPreferences(): UserPreferences {
    return { ...this.userPreferences };
  }

  public updateUserPreferences(prefs: Partial<UserPreferences>): UserPreferences {
    this.userPreferences = {
      ...this.userPreferences,
      ...prefs,
    };
    return { ...this.userPreferences };
  }
}

export const db = new DatabaseStore();
