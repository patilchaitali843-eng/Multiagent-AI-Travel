/**
 * Multi-Agent AI Travel Planner - Shared Type Definitions
 */

export type TravelStyle = 'relaxed' | 'fast-paced' | 'balanced' | 'adventure' | 'luxury' | 'budget';
export type AccommodationType = 'hostel' | 'budget_hotel' | 'mid-range' | 'luxury_resort' | 'villa' | 'homestay';
export type TransportType = 'flight' | 'train' | 'bus' | 'rental_car';
export type CrowdPreference = 'avoid_crowded' | 'popular_hotspots' | 'balanced';

export interface TripRequest {
  id?: string;
  destination: string;
  origin: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: number;
  currency: string;
  travelStyle: TravelStyle;
  accommodationType: AccommodationType;
  foodPreferences: string[];
  interests: string[];
  transportationPreference: TransportType[];
  crowdPreference: CrowdPreference;
  additionalRequirements?: string;
  createdAt?: string;
}

export interface TransportOption {
  id: string;
  type: TransportType;
  provider: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  duration: string;
  price: number; // Total for all travelers
  pricePerPerson: number;
  currency: string;
  score: number; // 0 to 1
  co2Kg?: number;
  stops: number;
  isDemoData: boolean;
}

export interface AccommodationOption {
  id: string;
  name: string;
  location: string;
  pricePerNight: number;
  totalPrice: number; // pricePerNight * nights
  rating: number;
  type: string;
  amenities: string[];
  distanceFromCenterKm: number;
  score: number; // 0 to 1
  imageUrl?: string;
  isDemoData: boolean;
}

export interface ActivityOption {
  id: string;
  name: string;
  category: 'Sightseeing' | 'Beaches' | 'Adventure' | 'Museums' | 'Nature' | 'Food & Culinary' | 'Nightlife' | 'Cultural' | 'Hidden Gem';
  estimatedCost: number; // Total for all travelers
  durationHours: number;
  bestTime: 'Morning' | 'Afternoon' | 'Evening' | 'Full Day';
  description: string;
  location: string;
  preferenceMatch: number; // 0 to 1
  crowdLevel: 'Low' | 'Moderate' | 'High';
  isDemoData: boolean;
}

export interface BudgetBreakdown {
  transportation: number;
  accommodation: number;
  food: number;
  activities: number;
  localTransport: number;
  miscellaneous: number;
  contingency: number;
  totalCost: number;
  budget: number;
  remaining: number;
  utilizationPercentage: number;
  withinBudget: boolean;
  currency: string;
  expensiveComponents: string[];
  optimizationNotes?: string[];
}

export interface ItinerarySlot {
  time: string;
  title: string;
  description: string;
  location: string;
  cost: number;
  type: 'activity' | 'meal' | 'transit' | 'rest';
}

export interface ItineraryDay {
  dayNumber: number;
  date: string;
  morning: ItinerarySlot[];
  afternoon: ItinerarySlot[];
  evening: ItinerarySlot[];
  meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  dailyEstimatedCost: number;
  notes?: string;
}

export interface AgentTraceLog {
  id: string;
  timestamp: string;
  agent: 'ORCHESTRATOR' | 'FLIGHT_AGENT' | 'HOTEL_AGENT' | 'ACTIVITY_AGENT' | 'BUDGET_VALIDATOR' | 'ITINERARY_AGENT';
  level: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  message: string;
  details?: Record<string, any>;
}

export interface UserPreferences {
  preferredAccommodation: AccommodationType;
  preferredActivities: string[];
  foodPreferences: string[];
  travelStyle: TravelStyle;
  preferredTransport: TransportType[];
  crowdPreference: CrowdPreference;
  currency: string;
}

export interface TripPlan {
  id: string;
  request: TripRequest;
  transportation: TransportOption[];
  selectedTransport: TransportOption;
  accommodation: AccommodationOption[];
  selectedAccommodation: AccommodationOption;
  activities: ActivityOption[];
  budget: BudgetBreakdown;
  itinerary: ItineraryDay[];
  traceLogs: AgentTraceLog[];
  status: 'planning' | 'optimizing' | 'completed' | 'failed';
  errorMessage?: string;
  iterationsCount: number;
  createdAt: string;
  updatedAt: string;
}
