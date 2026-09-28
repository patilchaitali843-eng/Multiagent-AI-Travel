/**
 * Deterministic Budget Calculation and Constraint Validation Engine
 * NOTE: Never uses LLM for arithmetic. Pure deterministic arithmetic calculations.
 */

import { BudgetBreakdown, TransportOption, AccommodationOption, ActivityOption, TripRequest } from '../../shared/types.ts';

export class BudgetValidator {
  /**
   * Calculate daily food estimate based on travel style and travelers.
   */
  private static calculateFoodEstimate(style: string, travelers: number, nights: number): number {
    let perPersonPerDay = 1200; // baseline INR equivalent
    switch (style) {
      case 'budget':
        perPersonPerDay = 600;
        break;
      case 'relaxed':
      case 'balanced':
        perPersonPerDay = 1000;
        break;
      case 'luxury':
        perPersonPerDay = 3000;
        break;
      default:
        perPersonPerDay = 1000;
    }
    const days = Math.max(1, nights + 1);
    return Math.round(perPersonPerDay * travelers * days);
  }

  /**
   * Calculate local transit estimate (cabs, rickshaws, metro).
   */
  private static calculateLocalTransport(days: number, travelers: number, style: string): number {
    const baseDaily = style === 'budget' ? 300 : style === 'luxury' ? 1500 : 600;
    return Math.round(baseDaily * days * (1 + (travelers - 1) * 0.3));
  }

  /**
   * Deterministically calculate the full budget breakdown.
   */
  public static calculate(
    request: TripRequest,
    transport: TransportOption,
    accommodation: AccommodationOption,
    activities: ActivityOption[],
    nights: number
  ): BudgetBreakdown {
    const days = Math.max(1, nights + 1);
    const transportCost = Math.round(transport.price);
    const accommodationCost = Math.round(accommodation.totalPrice);
    
    // Sum activities cost
    const activitiesCost = activities.reduce((acc, act) => acc + Math.round(act.estimatedCost), 0);
    
    // Deterministic food estimation
    const foodCost = this.calculateFoodEstimate(request.travelStyle, request.travelers, nights);
    
    // Local transport
    const localTransportCost = this.calculateLocalTransport(days, request.travelers, request.travelStyle);
    
    // Miscellaneous expenses (tips, emergency supplies, water)
    const miscellaneousCost = Math.round(days * request.travelers * 200);

    // Baseline subtotal before contingency
    const subtotal = transportCost + accommodationCost + foodCost + activitiesCost + localTransportCost + miscellaneousCost;

    // Contingency reserve: 5% of subtotal or remaining buffer
    const contingency = Math.round(subtotal * 0.05);

    const totalCost = subtotal + contingency;
    const budget = Math.round(request.budget);
    const remaining = budget - totalCost;
    const utilizationPercentage = Math.min(999, Math.round((totalCost / budget) * 100));
    const withinBudget = totalCost <= budget;

    // Detect expensive components
    const expensiveComponents: string[] = [];
    if (transportCost > budget * 0.40) expensiveComponents.push('transportation');
    if (accommodationCost > budget * 0.40) expensiveComponents.push('accommodation');
    if (activitiesCost > budget * 0.25) expensiveComponents.push('activities');
    if (foodCost > budget * 0.25) expensiveComponents.push('food');

    const optimizationNotes: string[] = [];
    if (!withinBudget) {
      const deficit = totalCost - budget;
      optimizationNotes.push(`Total cost exceeds budget by ${request.currency} ${deficit.toLocaleString()}.`);
      if (expensiveComponents.length > 0) {
        optimizationNotes.push(`Primary high-cost drivers identified: ${expensiveComponents.join(', ')}.`);
      }
    } else {
      optimizationNotes.push(`Plan is within budget with a comfortable reserve of ${request.currency} ${remaining.toLocaleString()} (${100 - utilizationPercentage}% unallocated buffer).`);
    }

    return {
      transportation: transportCost,
      accommodation: accommodationCost,
      food: foodCost,
      activities: activitiesCost,
      localTransport: localTransportCost,
      miscellaneous: miscellaneousCost,
      contingency: contingency,
      totalCost: totalCost,
      budget: budget,
      remaining: remaining,
      utilizationPercentage: utilizationPercentage,
      withinBudget: withinBudget,
      currency: request.currency || 'INR',
      expensiveComponents: expensiveComponents,
      optimizationNotes: optimizationNotes,
    };
  }
}
