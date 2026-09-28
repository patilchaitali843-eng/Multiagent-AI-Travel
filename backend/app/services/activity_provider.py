"""
Activity Provider for FastAPI backend.
"""

from typing import List
import time
from backend.app.schemas.trip import ActivityOptionSchema, TripCreateRequest


class ActivityProvider:
    @staticmethod
    def search_activities(
        request: TripCreateRequest, is_demo_mode: bool = True
    ) -> List[ActivityOptionSchema]:
        dest = request.destination.strip()
        t = request.travelers or 1

        items = [
            ActivityOptionSchema(
                id=f"act-1-{int(time.time())}",
                name="Secret Butterfly Beach & Dolphin Kayaking at Sunrise",
                category="Adventure",
                estimated_cost=1100.0 * t,
                duration_hours=3.5,
                best_time="Morning",
                description="Paddle through calm turquoise inlets to a secluded beach unreachable by roadway.",
                location=f"{dest} (Palolem Cove)",
                preference_match=0.95,
                crowd_level="Low",
                is_demo_data=True,
            ),
            ActivityOptionSchema(
                id=f"act-2-{int(time.time())}",
                name="Fontainhas Latin Heritage Walk & Bakery Tasting",
                category="Cultural",
                estimated_cost=450.0 * t,
                duration_hours=2.5,
                best_time="Morning",
                description="Explore pastel villas, handpainted tiles, and authentic freshly baked bebinca.",
                location=f"{dest} (Panjim Latin Quarter)",
                preference_match=0.91,
                crowd_level="Low",
                is_demo_data=True,
            ),
            ActivityOptionSchema(
                id=f"act-3-{int(time.time())}",
                name="Organic Spice Plantation Tour & Traditional Konkani Thali",
                category="Food & Culinary",
                estimated_cost=750.0 * t,
                duration_hours=3.0,
                best_time="Afternoon",
                description="Guided botanical tour of vanilla and cardamom followed by earthen-pot lunch.",
                location=f"{dest} (Ponda Spices)",
                preference_match=0.94,
                crowd_level="Low",
                is_demo_data=True,
            ),
            ActivityOptionSchema(
                id=f"act-4-{int(time.time())}",
                name="Cabo de Rama Cliffside Sunset Panoramic View",
                category="Hidden Gem",
                estimated_cost=0.0,
                duration_hours=2.0,
                best_time="Evening",
                description="Historic sea-facing ramparts overlooking 180-degree ocean horizon with zero entrance fee.",
                location=f"{dest} (Canacona Cliffs)",
                preference_match=0.96,
                crowd_level="Low",
                is_demo_data=True,
            ),
            ActivityOptionSchema(
                id=f"act-5-{int(time.time())}",
                name="Ashvem Nature Conservation Coastline & Sunset Stroll",
                category="Beaches",
                estimated_cost=200.0 * t,
                duration_hours=3.0,
                best_time="Afternoon",
                description="Quiet stretch of pristine white sand ideal for peaceful sunsets away from noisy watercraft.",
                location=f"{dest} (Ashvem North)",
                preference_match=0.92,
                crowd_level="Low",
                is_demo_data=True,
            ),
        ]
        return items
