"""
Activity Agent in Python.
"""

from typing import List, Optional
from backend.app.schemas.trip import ActivityOptionSchema, TripCreateRequest
from backend.app.services.activity_provider import ActivityProvider


class ActivityAgent:
    @classmethod
    def select_activities(
        cls,
        request: TripCreateRequest,
        days: int,
        is_demo_mode: bool = True,
        filter_category: Optional[str] = None,
        limit_budget: bool = False,
    ) -> List[ActivityOptionSchema]:
        raw_list = ActivityProvider.search_activities(request, is_demo_mode)
        filtered = raw_list

        if filter_category:
            matched = [a for a in raw_list if filter_category.lower() in a.category.lower()]
            if matched:
                filtered = matched

        if limit_budget:
            filtered = sorted(filtered, key=lambda a: a.estimated_cost)
        else:
            filtered = sorted(filtered, key=lambda a: -a.preference_match)

        target_count = min(len(filtered), max(3, days * 2))
        selected: List[ActivityOptionSchema] = []
        used_categories = set()

        for item in filtered:
            if len(selected) >= target_count:
                break
            if item.category not in used_categories:
                selected.append(item)
                used_categories.add(item.category)

        for item in filtered:
            if len(selected) >= target_count:
                break
            if not any(s.id == item.id for s in selected):
                selected.append(item)

        return selected
