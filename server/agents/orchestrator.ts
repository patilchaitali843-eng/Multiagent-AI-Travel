/**
 * Multi-Agent Orchestrator
 * Master coordinator managing task delegation, constraint satisfaction,
 * iterative budget optimization, and structured itinerary assembly.
 */

import { TripPlan, TripRequest, AgentTraceLog, TransportOption, AccommodationOption, ActivityOption, BudgetBreakdown } from '../../shared/types.ts';
import { FlightAgent } from './flightAgent.ts';
import { AccommodationAgent } from './accommodationAgent.ts';
import { ActivityAgent } from './activityAgent.ts';
import { BudgetValidator } from '../validators/budgetValidator.ts';
import { ItineraryAgent } from './itineraryAgent.ts';

export class OrchestratorAgent {
  /**
   * Helper to calculate trip nights from dates.
   */
  public static calculateNights(startDateStr: string, endDateStr: string): number {
    try {
      const start = new Date(startDateStr);
      const end = new Date(endDateStr);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(1, isNaN(diffDays) ? 3 : diffDays);
    } catch {
      return 3;
    }
  }

  /**
   * Generate a complete personalized travel plan with multi-agent orchestration.
   */
  public static async planTrip(
    request: TripRequest,
    isDemoMode: boolean = true
  ): Promise<TripPlan> {
    const traceLogs: AgentTraceLog[] = [];
    const addLog = (
      agent: AgentTraceLog['agent'],
      level: AgentTraceLog['level'],
      message: string,
      details?: Record<string, any>
    ) => {
      traceLogs.push({
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        agent,
        level,
        message,
        details,
      });
      console.log(`[${agent}] ${message}`);
    };

    const tripId = request.id || `trip-${Date.now()}`;
    const nights = this.calculateNights(request.startDate, request.endDate);
    const days = nights + 1;

    addLog('ORCHESTRATOR', 'INFO', `Request received: Planning ${days}-day trip to ${request.destination} for ${request.travelers} traveler(s). Budget: ${request.currency} ${request.budget.toLocaleString()}.`);

    // 1. Parallel research phase: Flight, Hotel, Activity agents
    addLog('FLIGHT_AGENT', 'INFO', `Searching transportation from ${request.origin} to ${request.destination}...`);
    addLog('HOTEL_AGENT', 'INFO', `Searching accommodation matching '${request.accommodationType}' style in ${request.destination}...`);
    addLog('ACTIVITY_AGENT', 'INFO', `Researching activities matching interests: ${request.interests.join(', ')}...`);

    const [flightResult, hotelResult, activityList] = await Promise.all([
      FlightAgent.evaluateTransportation(request, isDemoMode),
      AccommodationAgent.evaluateAccommodations(request, nights, isDemoMode),
      ActivityAgent.selectActivities(request, days, isDemoMode),
    ]);

    let selectedTransport: TransportOption = flightResult.selected;
    const transportOptions: TransportOption[] = flightResult.options;

    let selectedAccommodation: AccommodationOption = hotelResult.selected;
    const accommodationOptions: AccommodationOption[] = hotelResult.options;

    let selectedActivities: ActivityOption[] = activityList;

    addLog('FLIGHT_AGENT', 'SUCCESS', `Selected best transport option: ${selectedTransport.provider} (${request.currency} ${selectedTransport.price.toLocaleString()}, score: ${selectedTransport.score}).`);
    addLog('HOTEL_AGENT', 'SUCCESS', `Selected best stay: ${selectedAccommodation.name} (${request.currency} ${selectedAccommodation.totalPrice.toLocaleString()} for ${nights} nights).`);
    addLog('ACTIVITY_AGENT', 'SUCCESS', `Curated ${selectedActivities.length} personalized activities (Average match score: ${(selectedActivities.reduce((a, s) => a + s.preferenceMatch, 0) / selectedActivities.length).toFixed(2)}).`);

    // 2. Budget Validation Phase
    addLog('BUDGET_VALIDATOR', 'INFO', `Validating budget constraints deterministically (No LLM arithmetic)...`);
    
    let budget: BudgetBreakdown = BudgetValidator.calculate(
      request,
      selectedTransport,
      selectedAccommodation,
      selectedActivities,
      nights
    );

    let iterationsCount = 0;
    const maxIterations = 3;

    // 3. Iterative Optimization Loop if budget exceeded
    while (!budget.withinBudget && iterationsCount < maxIterations) {
      iterationsCount++;
      addLog('ORCHESTRATOR', 'WARNING', `Budget exceeded by ${request.currency} ${(budget.totalCost - budget.budget).toLocaleString()}. Optimization pass ${iterationsCount}/${maxIterations} initiated.`);

      // Check primary cost driver
      if (budget.expensiveComponents.includes('accommodation') || selectedAccommodation.totalPrice > request.budget * 0.45) {
        addLog('HOTEL_AGENT', 'INFO', `Requesting cheaper accommodation alternatives...`);
        const cheaperHotels = await AccommodationAgent.evaluateAccommodations(request, nights, isDemoMode, true);
        if (cheaperHotels.selected && cheaperHotels.selected.id !== selectedAccommodation.id) {
          selectedAccommodation = cheaperHotels.selected;
          addLog('HOTEL_AGENT', 'SUCCESS', `Switched to cost-effective stay: ${selectedAccommodation.name} (${request.currency} ${selectedAccommodation.totalPrice.toLocaleString()}).`);
        }
      } else if (budget.expensiveComponents.includes('transportation') || selectedTransport.price > request.budget * 0.40) {
        addLog('FLIGHT_AGENT', 'INFO', `Requesting cheaper transportation alternatives...`);
        const cheaperTransport = await FlightAgent.evaluateTransportation(request, isDemoMode, true);
        if (cheaperTransport.selected && cheaperTransport.selected.id !== selectedTransport.id) {
          selectedTransport = cheaperTransport.selected;
          addLog('FLIGHT_AGENT', 'SUCCESS', `Switched to value transport: ${selectedTransport.provider} (${request.currency} ${selectedTransport.price.toLocaleString()}).`);
        }
      } else {
        // Optimize activities to free / low-cost alternatives
        addLog('ACTIVITY_AGENT', 'INFO', `Optimizing activities for high-value low-cost experiences...`);
        selectedActivities = await ActivityAgent.selectActivities(request, days, isDemoMode, undefined, true);
        addLog('ACTIVITY_AGENT', 'SUCCESS', `Adjusted activity roster to reduce total activity expenditure.`);
      }

      // Recalculate deterministically
      budget = BudgetValidator.calculate(
        request,
        selectedTransport,
        selectedAccommodation,
        selectedActivities,
        nights
      );

      addLog('BUDGET_VALIDATOR', 'INFO', `Post-optimization total: ${request.currency} ${budget.totalCost.toLocaleString()} (Budget: ${request.currency} ${budget.budget.toLocaleString()}, Remaining: ${request.currency} ${budget.remaining.toLocaleString()}).`);
    }

    if (budget.withinBudget) {
      addLog('BUDGET_VALIDATOR', 'SUCCESS', `Budget constraint validated successfully: ${budget.utilizationPercentage}% budget utilized.`);
    } else {
      addLog('ORCHESTRATOR', 'WARNING', `Reached max optimization passes (${maxIterations}). Presenting closest compliant configuration.`);
    }

    // 4. Daily Itinerary Construction
    addLog('ITINERARY_AGENT', 'INFO', `Constructing chronological ${days}-day itinerary with meal recommendations and realistic transit buffer...`);
    const itinerary = ItineraryAgent.generateItinerary(
      request,
      selectedTransport,
      selectedAccommodation,
      selectedActivities,
      days
    );
    addLog('ITINERARY_AGENT', 'SUCCESS', `Generated structured schedule across ${itinerary.length} days.`);

    addLog('ORCHESTRATOR', 'SUCCESS', `[COMPLETE] Trip generated successfully for ${request.destination}! Ready for traveler review.`);

    const now = new Date().toISOString();
    return {
      id: tripId,
      request,
      transportation: transportOptions,
      selectedTransport,
      accommodation: accommodationOptions,
      selectedAccommodation,
      activities: selectedActivities,
      budget,
      itinerary,
      traceLogs,
      status: 'completed',
      iterationsCount,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Regenerate a single specific section without discarding the entire trip.
   */
  public static async regenerateSection(
    currentPlan: TripPlan,
    section: 'transport' | 'accommodation' | 'activities' | 'budget_optimize' | 'day',
    params?: { targetDay?: number; promptModifier?: string }
  ): Promise<TripPlan> {
    const nights = this.calculateNights(currentPlan.request.startDate, currentPlan.request.endDate);
    const days = nights + 1;
    const plan = { ...currentPlan };

    const newLogs: AgentTraceLog[] = [...plan.traceLogs];
    const log = (agent: AgentTraceLog['agent'], msg: string) => {
      newLogs.push({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        agent,
        level: 'INFO',
        message: msg,
      });
    };

    if (section === 'accommodation') {
      log('HOTEL_AGENT', `Regenerating accommodation options based on user request: "${params?.promptModifier || 'Find alternatives'}"`);
      const forceCheaper = (params?.promptModifier || '').toLowerCase().includes('cheap');
      const stays = await AccommodationAgent.evaluateAccommodations(plan.request, nights, true, forceCheaper);
      // Pick next alternative if currently selected
      const nextStay = stays.options.find(o => o.id !== plan.selectedAccommodation.id) || stays.selected;
      plan.selectedAccommodation = nextStay;
      plan.accommodation = stays.options;
      log('HOTEL_AGENT', `Updated stay to ${nextStay.name}. Recalculating budget.`);
    } else if (section === 'transport') {
      log('FLIGHT_AGENT', `Regenerating transportation based on user request: "${params?.promptModifier || 'Find alternatives'}"`);
      const forceCheaper = (params?.promptModifier || '').toLowerCase().includes('cheap');
      const trn = await FlightAgent.evaluateTransportation(plan.request, true, forceCheaper);
      const nextTrn = trn.options.find(o => o.id !== plan.selectedTransport.id) || trn.selected;
      plan.selectedTransport = nextTrn;
      plan.transportation = trn.options;
      log('FLIGHT_AGENT', `Updated transportation to ${nextTrn.provider}. Recalculating budget.`);
    } else if (section === 'activities') {
      log('ACTIVITY_AGENT', `Regenerating activities based on user request: "${params?.promptModifier || 'More variety'}"`);
      const categoryFilter = params?.promptModifier?.toLowerCase().includes('adventure') 
        ? 'Adventure' 
        : params?.promptModifier?.toLowerCase().includes('food') 
        ? 'Food & Culinary' 
        : undefined;
      plan.activities = await ActivityAgent.selectActivities(plan.request, days, true, categoryFilter);
      log('ACTIVITY_AGENT', `Curated refreshed activity lineup. Recalculating budget.`);
    } else if (section === 'day' && params?.targetDay) {
      log('ITINERARY_AGENT', `Regenerating Day ${params.targetDay} specifically.`);
      const dayIndex = params.targetDay - 1;
      if (plan.itinerary[dayIndex]) {
        plan.itinerary[dayIndex] = ItineraryAgent.regenerateDay(
          plan.itinerary[dayIndex],
          plan.request,
          plan.activities
        );
      }
      log('ITINERARY_AGENT', `Day ${params.targetDay} schedule refreshed.`);
    } else if (section === 'budget_optimize') {
      log('BUDGET_VALIDATOR', 'Enforcing strict budget optimization pass.');
      const cheaperHotels = await AccommodationAgent.evaluateAccommodations(plan.request, nights, true, true);
      const cheaperTransport = await FlightAgent.evaluateTransportation(plan.request, true, true);
      plan.selectedAccommodation = cheaperHotels.selected;
      plan.selectedTransport = cheaperTransport.selected;
      plan.activities = await ActivityAgent.selectActivities(plan.request, days, true, undefined, true);
      log('BUDGET_VALIDATOR', 'Swapped all components to top value tiers.');
    }

    // Recompute deterministic budget
    plan.budget = BudgetValidator.calculate(
      plan.request,
      plan.selectedTransport,
      plan.selectedAccommodation,
      plan.activities,
      nights
    );

    // Reconstruct itinerary if transport or accommodation changed
    if (section !== 'day') {
      plan.itinerary = ItineraryAgent.generateItinerary(
        plan.request,
        plan.selectedTransport,
        plan.selectedAccommodation,
        plan.activities,
        days
      );
    }

    plan.traceLogs = newLogs;
    plan.updatedAt = new Date().toISOString();
    return plan;
  }
}
