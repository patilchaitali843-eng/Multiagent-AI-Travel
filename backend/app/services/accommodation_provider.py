"""
Accommodation Provider for FastAPI backend.
"""

from typing import List
import time
from backend.app.schemas.trip import AccommodationOptionSchema, TripCreateRequest


class AccommodationProvider:
    @staticmethod
    def search_accommodations(
        request: TripCreateRequest, nights: int, is_demo_mode: bool = True
    ) -> List[AccommodationOptionSchema]:
        dest = request.destination.strip()
        nights = max(1, nights)

        return [
            AccommodationOptionSchema(
                id=f"acc-1-{int(time.time())}",
                name="The Heritage Palm Cove & Boutique Resort",
                location=f"{dest} (Candolim Coast)",
                price_per_night=2600.0,
                total_price=2600.0 * nights,
                rating=4.6,
                type="Boutique Resort",
                amenities=["Pool", "High-Speed WiFi", "Breakfast Included", "Beach Access"],
                score=0.92,
                image_url="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
                is_demo_data=True,
            ),
            AccommodationOptionSchema(
                id=f"acc-2-{int(time.time())}",
                name="Sol de Riverfront Eco Hotel",
                location=f"{dest} (Nerul Riverfront)",
                price_per_night=2100.0,
                total_price=2100.0 * nights,
                rating=4.4,
                type="Mid-range Hotel",
                amenities=["River View Balcony", "Pool", "Free WiFi", "Scooter Rental Desk"],
                score=0.88,
                image_url="https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80",
                is_demo_data=True,
            ),
            AccommodationOptionSchema(
                id=f"acc-3-{int(time.time())}",
                name="Agonda Serenity Beach Cottages",
                location=f"{dest} (South Shore Nature Bay)",
                price_per_night=1900.0,
                total_price=1900.0 * nights,
                rating=4.7,
                type="Beach Cottage",
                amenities=["Ocean View", "Direct Beach Front", "Artisanal Cafe"],
                score=0.94,
                image_url="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80",
                is_demo_data=True,
            ),
            AccommodationOptionSchema(
                id=f"acc-4-{int(time.time())}",
                name="Zostel Plus Vibrant Social Hostel",
                location=f"{dest} (Anjuna Cliffs)",
                price_per_night=1100.0,
                total_price=1100.0 * nights,
                rating=4.5,
                type="Hostel Pods",
                amenities=["Coworking Space", "Rooftop Cafe", "Social Events"],
                score=0.82,
                image_url="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80",
                is_demo_data=True,
            ),
        ]
