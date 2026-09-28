/**
 * Flight & Transportation Agent
 * Evaluates transport options, computes preference scores, and selects optimal travel modes.
 */

import { TravelProvider } from '../services/travelProvider.ts';
import { TransportOption, TripRequest } from '../../shared/types.ts';

export class FlightAgent {
  public static async evaluateTransportation(
    request: TripRequest,
    isDemoMode: boolean = true,
    forceCheaper: boolean = false
  ): Promise<{ options: TransportOption[]; selected: TransportOption }> {
    const rawOptions = await TravelProvider.searchTransportation(request, isDemoMode);
    
    if (rawOptions.length === 0) {
      throw new Error(`No transportation routes found between ${request.origin} and ${request.destination}`);
    }

    // Deterministic preference scoring
    const scored = rawOptions.map(opt => {
      // 1. Budget efficiency score (lower price = higher score if on budget)
      const maxBudgetForTransport = request.budget * 0.35;
      const budgetScore = opt.price <= maxBudgetForTransport 
        ? 0.95 
        : Math.max(0.2, 1 - (opt.price - maxBudgetForTransport) / maxBudgetForTransport);

      // 2. Duration / convenience score
      let durationScore = 0.8;
      if (opt.type === 'flight') durationScore = 0.96;
      else if (opt.type === 'train') durationScore = 0.82;
      else if (opt.type === 'bus') durationScore = 0.65;

      // 3. User preference match
      let prefScore = 0.7;
      if (request.transportationPreference.includes(opt.type)) {
        prefScore = 0.98;
      }

      // Weight based on travel style
      const finalScore = forceCheaper
        ? (budgetScore * 0.70 + durationScore * 0.15 + prefScore * 0.15)
        : (budgetScore * 0.35 + durationScore * 0.40 + prefScore * 0.25);

      return {
        ...opt,
        score: Number(Math.min(0.99, Math.max(0.1, finalScore)).toFixed(2))
      };
    });

    // Sort by final score descending (or price ascending if forceCheaper)
    const sorted = forceCheaper
      ? [...scored].sort((a, b) => a.price - b.price)
      : [...scored].sort((a, b) => b.score - a.score);

    return {
      options: sorted,
      selected: sorted[0],
    };
  }
}
