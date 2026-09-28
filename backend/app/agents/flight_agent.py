"""
Flight and Transportation Agent in Python.
"""

from typing import Tuple, List
from backend.app.schemas.trip import TransportOptionSchema, TripCreateRequest
from backend.app.services.travel_provider import TravelProvider


class FlightAgent:
    @classmethod
    def evaluate_transportation(
        cls, request: TripCreateRequest, is_demo_mode: bool = True, force_cheaper: bool = False
    ) -> Tuple[List[TransportOptionSchema], TransportOptionSchema]:
        options = TravelProvider.search_transportation(request, is_demo_mode)
        if not options:
            raise ValueError(f"No transportation found from {request.origin} to {request.destination}")

        for opt in options:
            target_budget = request.budget * 0.35
            budget_score = 0.95 if opt.price <= target_budget else max(0.2, 1.0 - (opt.price - target_budget) / target_budget)
            duration_score = 0.96 if opt.type == "flight" else 0.82 if opt.type == "train" else 0.65
            pref_score = 0.98 if opt.type in (request.transportation_preference or []) else 0.70

            if force_cheaper:
                final_score = budget_score * 0.70 + duration_score * 0.15 + pref_score * 0.15
            else:
                final_score = budget_score * 0.35 + duration_score * 0.40 + pref_score * 0.25
            opt.score = round(min(0.99, max(0.1, final_score)), 2)

        sorted_options = sorted(options, key=lambda x: x.price if force_cheaper else -x.score)
        return sorted_options, sorted_options[0]
