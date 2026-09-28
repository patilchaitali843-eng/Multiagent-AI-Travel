/**
 * Itinerary Generator Agent
 * Structures validated activities and meals into chronologically consistent daily schedules.
 */

import { ActivityOption, AccommodationOption, TransportOption, ItineraryDay, ItinerarySlot, TripRequest } from '../../shared/types.ts';

export class ItineraryAgent {
  /**
   * Calculate date string for given day index.
   */
  private static getDayDate(startDateStr: string, dayIndex: number): string {
    try {
      const date = new Date(startDateStr);
      if (isNaN(date.getTime())) {
        return `Day ${dayIndex + 1}`;
      }
      date.setDate(date.getDate() + dayIndex);
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return `Day ${dayIndex + 1}`;
    }
  }

  /**
   * Generate complete day-by-day itinerary.
   */
  public static generateItinerary(
    request: TripRequest,
    transport: TransportOption,
    accommodation: AccommodationOption,
    activities: ActivityOption[],
    days: number
  ): ItineraryDay[] {
    const itinerary: ItineraryDay[] = [];
    const activitiesPool = [...activities];

    for (let day = 0; day < days; day++) {
      const isFirstDay = day === 0;
      const isLastDay = day === days - 1;
      const dayDate = this.getDayDate(request.startDate, day);

      const morningSlots: ItinerarySlot[] = [];
      const afternoonSlots: ItinerarySlot[] = [];
      const eveningSlots: ItinerarySlot[] = [];

      // Day 1 Arrival Logic
      if (isFirstDay) {
        morningSlots.push({
          time: '08:00 AM - 10:30 AM',
          title: `Transit & Arrival via ${transport.provider}`,
          description: `Depart from ${transport.origin}. Arrive at ${transport.destination} (${transport.arrival}).`,
          location: transport.destination,
          cost: 0,
          type: 'transit',
        });
        morningSlots.push({
          time: '11:00 AM - 12:30 PM',
          title: `Check-in & Freshen Up at ${accommodation.name}`,
          description: `Check into room, settle luggage, and review neighborhood map with front desk concierge.`,
          location: accommodation.location,
          cost: 0,
          type: 'rest',
        });
      } else {
        // Regular morning activity
        const act1 = activitiesPool.shift() || {
          id: `walk-${day}`,
          name: 'Morning Coastal Stroll & Local Cafe Culture',
          category: 'Cultural' as const,
          estimatedCost: 200 * request.travelers,
          durationHours: 2,
          bestTime: 'Morning' as const,
          description: 'Soak in the gentle morning breeze and savor artisanal freshly brewed filter coffee and baked snacks.',
          location: accommodation.location,
          preferenceMatch: 0.9,
          crowdLevel: 'Low' as const,
          isDemoData: true,
        };

        morningSlots.push({
          time: '08:30 AM - 11:30 AM',
          title: act1.name,
          description: act1.description,
          location: act1.location,
          cost: act1.estimatedCost,
          type: 'activity',
        });
      }

      // Afternoon activity
      const act2 = activitiesPool.shift() || {
        id: `aft-${day}`,
        name: 'Heritage Quarter & Spice Exploration',
        category: 'Food & Culinary' as const,
        estimatedCost: 350 * request.travelers,
        durationHours: 2.5,
        bestTime: 'Afternoon' as const,
        description: 'Venture into historic lanes, browse local handicraft boutiques and savor spiced chai.',
        location: `${request.destination} Central`,
        preferenceMatch: 0.88,
        crowdLevel: 'Low' as const,
        isDemoData: true,
      };

      afternoonSlots.push({
        time: '02:30 PM - 05:00 PM',
        title: act2.name,
        description: act2.description,
        location: act2.location,
        cost: act2.estimatedCost,
        type: 'activity',
      });

      // Evening activity / departure
      if (isLastDay) {
        eveningSlots.push({
          time: '05:30 PM - 07:00 PM',
          title: 'Sunset Farewell & Souvenir Keepsakes',
          description: 'Pick up local delicacies, cashew feni/spices, and capture sunset memories before departure.',
          location: accommodation.location,
          cost: 400 * request.travelers,
          type: 'activity',
        });
        eveningSlots.push({
          time: '07:30 PM - 09:30 PM',
          title: `Return Departure via ${transport.provider}`,
          description: `Transfer to transit terminal for return journey to ${transport.origin}.`,
          location: transport.destination,
          cost: 0,
          type: 'transit',
        });
      } else {
        const act3 = activitiesPool.shift() || {
          id: `eve-${day}`,
          name: 'Scenic Sunset Vantage & Evening Atmosphere',
          category: 'Hidden Gem' as const,
          estimatedCost: 150 * request.travelers,
          durationHours: 2,
          bestTime: 'Evening' as const,
          description: 'Relax at a quiet cliffside or riverfront view while watching vibrant sunset skies.',
          location: `${request.destination} Coastline`,
          preferenceMatch: 0.94,
          crowdLevel: 'Low' as const,
          isDemoData: true,
        };

        eveningSlots.push({
          time: '06:00 PM - 08:30 PM',
          title: act3.name,
          description: act3.description,
          location: act3.location,
          cost: act3.estimatedCost,
          type: 'activity',
        });
      }

      // Meal recommendations aligned with food preferences
      const isVeg = request.foodPreferences.some(f => f.toLowerCase().includes('veg'));
      const meals = {
        breakfast: isVeg 
          ? 'South Indian Poha, Steamed Idlis & Fresh Coconut Chutney' 
          : 'Traditional Portuguese Poee Bread with Goan Chourico / Mushroom Omelette',
        lunch: isVeg
          ? 'Traditional Saraswat Kokum Kadi, Ambotik Mushroom Curry & Steamed Rice'
          : 'Fresh Kingfish Rava Fry, Prawn Curry Rice & Sol Kadi',
        dinner: isVeg
          ? 'Goan Vegetable Caldin Stew with Appams & Bebinca Dessert'
          : 'Claypot Crab Xacuti, Garlic Butter Poi & Feni-infused Mocktail',
      };

      const dailyCost = morningSlots.reduce((a, s) => a + s.cost, 0)
        + afternoonSlots.reduce((a, s) => a + s.cost, 0)
        + eveningSlots.reduce((a, s) => a + s.cost, 0)
        + Math.round(900 * request.travelers); // Estimated meals & incidentals

      itinerary.push({
        dayNumber: day + 1,
        date: dayDate,
        morning: morningSlots,
        afternoon: afternoonSlots,
        evening: eveningSlots,
        meals: meals,
        dailyEstimatedCost: dailyCost,
        notes: day === 0 ? 'Light pacing recommended to recover from transit.' : 'Remember to carry sunscreen and stay hydrated.',
      });
    }

    return itinerary;
  }

  /**
   * Regenerate a single specific day with fresh activities.
   */
  public static regenerateDay(
    existingDay: ItineraryDay,
    request: TripRequest,
    activities: ActivityOption[]
  ): ItineraryDay {
    // Select alternative activities not currently in that day
    const currentTitles = new Set([
      ...existingDay.morning.map(s => s.title),
      ...existingDay.afternoon.map(s => s.title),
      ...existingDay.evening.map(s => s.title),
    ]);

    const alternatives = activities.filter(a => !currentTitles.has(a.name));
    const alt1 = alternatives[0] || activities[0];
    const alt2 = alternatives[1] || activities[1] || activities[0];

    const newMorning = existingDay.morning.map(slot => {
      if (slot.type === 'activity' && alt1) {
        return {
          ...slot,
          title: alt1.name,
          description: alt1.description,
          location: alt1.location,
          cost: alt1.estimatedCost,
        };
      }
      return slot;
    });

    const newAfternoon = existingDay.afternoon.map(slot => {
      if (slot.type === 'activity' && alt2) {
        return {
          ...slot,
          title: alt2.name,
          description: alt2.description,
          location: alt2.location,
          cost: alt2.estimatedCost,
        };
      }
      return slot;
    });

    const dailyCost = newMorning.reduce((a, s) => a + s.cost, 0)
      + newAfternoon.reduce((a, s) => a + s.cost, 0)
      + existingDay.evening.reduce((a, s) => a + s.cost, 0)
      + Math.round(900 * request.travelers);

    return {
      ...existingDay,
      morning: newMorning,
      afternoon: newAfternoon,
      dailyEstimatedCost: dailyCost,
      notes: 'Day schedule updated with tailored alternative activities.',
    };
  }
}
