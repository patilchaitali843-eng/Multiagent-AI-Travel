/**
 * Activity & Experiences Provider Abstraction Layer
 * Multi-category attractions and local experiences catalog.
 */

import { ActivityOption, TripRequest } from '../../shared/types.ts';

export class ActivityProvider {
  /**
   * Search activities matching destination, travel style, crowd preference, and interests.
   */
  public static async searchActivities(
    request: TripRequest,
    isDemoMode: boolean = true
  ): Promise<ActivityOption[]> {
    const destination = request.destination.trim();
    const travelers = request.travelers || 1;
    const userInterests = (request.interests || []).map(i => i.toLowerCase());
    const avoidCrowds = request.crowdPreference === 'avoid_crowded';

    const catalog: Array<Omit<ActivityOption, 'id' | 'isDemoData'>> = [
      {
        name: 'Secret Butterfly Beach & Dolphin Kayaking at Sunrise',
        category: 'Adventure',
        estimatedCost: 1100 * travelers,
        durationHours: 3.5,
        bestTime: 'Morning',
        description: 'Paddle through crystal clear turquoise inlets into secluded cove unreachable by highway. Spot playful Pacific humpback dolphins.',
        location: `${destination} (Palolem Cove)`,
        preferenceMatch: 0.95,
        crowdLevel: 'Low',
      },
      {
        name: 'Fontainhas Heritage Walk & Artisanal Bakery Tasting',
        category: 'Cultural',
        estimatedCost: 450 * travelers,
        durationHours: 2.5,
        bestTime: 'Morning',
        description: 'Explore pastel-colored Portuguese villas, traditional azulejos tile craft, and sample freshly baked warm bebinca and poee.',
        location: `${destination} (Latin Quarter, Panjim)`,
        preferenceMatch: 0.91,
        crowdLevel: 'Low',
      },
      {
        name: 'Dudhsagar Jungle Trek & Freshwater Natural Pool Dip',
        category: 'Nature',
        estimatedCost: 950 * travelers,
        durationHours: 5,
        bestTime: 'Morning',
        description: 'Venture through Bhagwan Mahavir Wildlife Sanctuary to the majestic four-tiered milky waterfall cascading through Western Ghats.',
        location: `${destination} (Western Ghats Foothills)`,
        preferenceMatch: 0.88,
        crowdLevel: 'Moderate',
      },
      {
        name: 'Authentic Spice Plantation Tour with Traditional Konkani Thali',
        category: 'Food & Culinary',
        estimatedCost: 750 * travelers,
        durationHours: 3,
        bestTime: 'Afternoon',
        description: 'Sensory journey amidst vanilla, cardamom, and cinnamon groves followed by an authentic earthen-pot Konkani lunch on banana leaves.',
        location: `${destination} (Ponda Organic Forest)`,
        preferenceMatch: 0.94,
        crowdLevel: 'Low',
      },
      {
        name: 'Sunset Oceanfront Cliff Walk at Cabo de Rama Fort',
        category: 'Hidden Gem',
        estimatedCost: 0,
        durationHours: 2,
        bestTime: 'Evening',
        description: 'Ancient cliffside ruins overlooking panoramic 180-degree Arabian Sea sunsets far away from tourist hordes.',
        location: `${destination} (Canacona Cliffs)`,
        preferenceMatch: 0.96,
        crowdLevel: 'Low',
      },
      {
        name: 'Morjim & Ashvem Olive Ridley Turtle Conservation Beach Visit',
        category: 'Beaches',
        estimatedCost: 200 * travelers,
        durationHours: 3,
        bestTime: 'Afternoon',
        description: 'Pristine, peaceful white sand stretch protected for endangered nesting turtles, ideal for quiet reading and tidal walks.',
        location: `${destination} (North Shore Nature Reserve)`,
        preferenceMatch: 0.93,
        crowdLevel: 'Low',
      },
      {
        name: 'Anjuna Flea Market & Live Acoustic Bohemian Sunset Session',
        category: 'Nightlife',
        estimatedCost: 500 * travelers,
        durationHours: 3.5,
        bestTime: 'Evening',
        description: 'Lively beachfront artisan bazaar featuring handmade jewelry, indie fashion, acoustic musicians, and ocean breeze mocktails.',
        location: `${destination} (Anjuna Beachfront)`,
        preferenceMatch: 0.79,
        crowdLevel: 'High',
      },
      {
        name: 'Scuba Diving Discovery & Coral Reef Exploration at Grande Island',
        category: 'Adventure',
        estimatedCost: 2400 * travelers,
        durationHours: 4.5,
        bestTime: 'Morning',
        description: 'Guided PADI certified discovery dive featuring exotic marine fauna, reef fish, and underwater ship wreck visibility.',
        location: `${destination} (Grande Island)`,
        preferenceMatch: 0.89,
        crowdLevel: 'Moderate',
      }
    ];

    // Score and filter based on user interests and crowd preference
    return catalog.map((item, idx) => {
      let match = item.preferenceMatch;
      // boost if category matches interests
      const catLower = item.category.toLowerCase();
      if (userInterests.some(i => catLower.includes(i) || i.includes(catLower))) {
        match = Math.min(0.99, match + 0.08);
      }
      // penalize high crowd if avoidCrowds
      if (avoidCrowds && item.crowdLevel === 'High') {
        match = Math.max(0.4, match - 0.25);
      }
      if (avoidCrowds && item.crowdLevel === 'Low') {
        match = Math.min(0.99, match + 0.05);
      }

      return {
        ...item,
        id: `act-${idx + 1}-${Date.now()}`,
        preferenceMatch: Number(match.toFixed(2)),
        isDemoData: true,
      };
    }).sort((a, b) => b.preferenceMatch - a.preferenceMatch);
  }
}
