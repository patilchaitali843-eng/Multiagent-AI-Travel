/**
 * Activity Agent
 * Researches attractions and experiences, ensures category diversity and crowd alignment.
 */

import { ActivityProvider } from '../services/activityProvider.ts';
import { ActivityOption, TripRequest } from '../../shared/types.ts';

export class ActivityAgent {
  public static async selectActivities(
    request: TripRequest,
    days: number,
    isDemoMode: boolean = true,
    filterCategory?: string,
    limitBudget: boolean = false
  ): Promise<ActivityOption[]> {
    const rawActivities = await ActivityProvider.searchActivities(request, isDemoMode);

    let filtered = rawActivities;
    if (filterCategory) {
      filtered = rawActivities.filter(a => a.category.toLowerCase().includes(filterCategory.toLowerCase()));
      if (filtered.length === 0) filtered = rawActivities; // fallback
    }

    if (limitBudget) {
      // Prioritize free or low-cost activities
      filtered = [...filtered].sort((a, b) => a.estimatedCost - b.estimatedCost);
    } else {
      filtered = [...filtered].sort((a, b) => b.preferenceMatch - a.preferenceMatch);
    }

    // Select enough diverse activities to cover the trip days (typically 2-3 per day)
    const targetCount = Math.min(filtered.length, Math.max(3, days * 2));
    const selected: ActivityOption[] = [];
    const usedCategories = new Set<string>();

    // Pass 1: Try diverse categories
    for (const act of filtered) {
      if (selected.length >= targetCount) break;
      if (!usedCategories.has(act.category)) {
        selected.push(act);
        usedCategories.add(act.category);
      }
    }

    // Pass 2: Fill remaining slots with highest scoring
    for (const act of filtered) {
      if (selected.length >= targetCount) break;
      if (!selected.some(s => s.id === act.id)) {
        selected.push(act);
      }
    }

    return selected;
  }
}
