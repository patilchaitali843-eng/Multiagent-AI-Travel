"""
Accommodation Agent in Python.
"""

from typing import Tuple, List
from backend.app.schemas.trip import AccommodationOptionSchema, TripCreateRequest
from backend.app.services.accommodation_provider import AccommodationProvider


class AccommodationAgent:
    @classmethod
    def evaluate_accommodations(
        cls, request: TripCreateRequest, nights: int, is_demo_mode: bool = True, force_cheaper: bool = False
    ) -> Tuple[List[AccommodationOptionSchema], AccommodationOptionSchema]:
        options = AccommodationProvider.search_accommodations(request, nights, is_demo_mode)
        if not options:
            raise ValueError(f"No accommodations found for {request.destination}")

        target_per_night = (request.budget * 0.40) / max(1, nights)
        for opt in options:
            budget_score = 0.95 if opt.price_per_night <= target_per_night else max(0.1, 1.0 - (opt.price_per_night - target_per_night) / target_per_night)
            rating_score = opt.rating / 5.0
            style_score = 0.95 if request.accommodation_type in opt.type.lower() else 0.80

            if force_cheaper:
                final_score = budget_score * 0.70 + rating_score * 0.20 + style_score * 0.10
            else:
                final_score = budget_score * 0.35 + rating_score * 0.40 + style_score * 0.25
            opt.score = round(min(0.99, max(0.1, final_score)), 2)

        sorted_options = sorted(options, key=lambda x: x.total_price if force_cheaper else -x.score)
        return sorted_options, sorted_options[0]
