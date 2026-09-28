/**
 * Accommodation Agent
 * Researches stays, weights ratings vs distance vs price, enforces structured results.
 */

import { AccommodationProvider } from '../services/accommodationProvider.ts';
import { AccommodationOption, TripRequest } from '../../shared/types.ts';

export class AccommodationAgent {
  public static async evaluateAccommodations(
    request: TripRequest,
    nights: number,
    isDemoMode: boolean = true,
    forceCheaper: boolean = false
  ): Promise<{ options: AccommodationOption[]; selected: AccommodationOption }> {
    const rawOptions = await AccommodationProvider.searchAccommodations(request, nights, isDemoMode);

    if (rawOptions.length === 0) {
      throw new Error(`No accommodations found for destination ${request.destination}`);
    }

    const scored = rawOptions.map(opt => {
      // 1. Budget fit: desired max per night
      const targetPerNight = (request.budget * 0.40) / Math.max(1, nights);
      const budgetScore = opt.pricePerNight <= targetPerNight
        ? 0.95
        : Math.max(0.1, 1 - (opt.pricePerNight - targetPerNight) / targetPerNight);

      // 2. Rating score (0 to 1 based on 5 star rating)
      const ratingScore = opt.rating / 5.0;

      // 3. Location / convenience (closer is better)
      const locationScore = Math.max(0.4, 1 - opt.distanceFromCenterKm / 15);

      // 4. Style match
      let styleScore = 0.75;
      const typeLower = opt.type.toLowerCase();
      if (request.accommodationType === 'luxury_resort' && typeLower.includes('resort')) styleScore = 0.98;
      if (request.accommodationType === 'mid-range' && (typeLower.includes('hotel') || typeLower.includes('resort') || typeLower.includes('cottage'))) styleScore = 0.95;
      if (request.accommodationType === 'hostel' && typeLower.includes('hostel')) styleScore = 0.98;
      if (request.accommodationType === 'homestay' && typeLower.includes('homestay')) styleScore = 0.98;

      const finalScore = forceCheaper
        ? (budgetScore * 0.65 + ratingScore * 0.20 + locationScore * 0.15)
        : (budgetScore * 0.30 + ratingScore * 0.35 + locationScore * 0.15 + styleScore * 0.20);

      return {
        ...opt,
        score: Number(Math.min(0.99, Math.max(0.1, finalScore)).toFixed(2)),
      };
    });

    const sorted = forceCheaper
      ? [...scored].sort((a, b) => a.totalPrice - b.totalPrice)
      : [...scored].sort((a, b) => b.score - a.score);

    return {
      options: sorted,
      selected: sorted[0],
    };
  }
}
