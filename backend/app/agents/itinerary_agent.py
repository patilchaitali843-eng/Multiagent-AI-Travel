"""
Itinerary Generator Agent in Python.
"""

from typing import List
from datetime import datetime, timedelta
from backend.app.schemas.trip import (
    ItineraryDaySchema,
    ItinerarySlotSchema,
    TripCreateRequest,
    TransportOptionSchema,
    AccommodationOptionSchema,
    ActivityOptionSchema,
)


class ItineraryAgent:
    @staticmethod
    def format_date(start_date: str, day_index: int) -> str:
        try:
            dt = datetime.strptime(start_date, "%Y-%m-%d")
            cur = dt + timedelta(days=day_index)
            return cur.strftime("%a, %b %d, %Y")
        except Exception:
            return f"Day {day_index + 1}"

    @classmethod
    def generate_itinerary(
        cls,
        request: TripCreateRequest,
        transport: TransportOptionSchema,
        accommodation: AccommodationOptionSchema,
        activities: List[ActivityOptionSchema],
        days: int,
    ) -> List[ItineraryDaySchema]:
        itinerary: List[ItineraryDaySchema] = []
        pool = list(activities)

        for day in range(days):
            date_str = cls.format_date(request.start_date, day)
            morning: List[ItinerarySlotSchema] = []
            afternoon: List[ItinerarySlotSchema] = []
            evening: List[ItinerarySlotSchema] = []

            if day == 0:
                morning.append(
                    ItinerarySlotSchema(
                        time="08:00 AM - 10:30 AM",
                        title=f"Transit via {transport.provider}",
                        description=f"Depart from {transport.origin}. Arrive {transport.destination} ({transport.arrival}).",
                        location=transport.destination,
                        cost=0.0,
                        type="transit",
                    )
                )
                morning.append(
                    ItinerarySlotSchema(
                        time="11:00 AM - 12:30 PM",
                        title=f"Check-in at {accommodation.name}",
                        description="Check in, settle luggage, freshen up.",
                        location=accommodation.location,
                        cost=0.0,
                        type="rest",
                    )
                )
            else:
                act = pool.pop(0) if pool else activities[0]
                morning.append(
                    ItinerarySlotSchema(
                        time="08:30 AM - 11:30 AM",
                        title=act.name,
                        description=act.description,
                        location=act.location,
                        cost=act.estimated_cost,
                        type="activity",
                    )
                )

            act2 = pool.pop(0) if pool else (activities[1] if len(activities) > 1 else activities[0])
            afternoon.append(
                ItinerarySlotSchema(
                    time="02:30 PM - 05:00 PM",
                    title=act2.name,
                    description=act2.description,
                    location=act2.location,
                    cost=act2.estimated_cost,
                    type="activity",
                )
            )

            if day == days - 1:
                evening.append(
                    ItinerarySlotSchema(
                        time="05:30 PM - 07:00 PM",
                        title="Sunset Souvenirs & Beach Walk",
                        description="Pack, pick up local specialties and cashew feni.",
                        location=accommodation.location,
                        cost=400.0 * (request.travelers or 1),
                        type="activity",
                    )
                )
                evening.append(
                    ItinerarySlotSchema(
                        time="07:30 PM - 09:30 PM",
                        title=f"Return Departure via {transport.provider}",
                        description=f"Transfer to terminal for return travel to {transport.origin}.",
                        location=transport.destination,
                        cost=0.0,
                        type="transit",
                    )
                )
            else:
                act3 = pool.pop(0) if pool else (activities[2] if len(activities) > 2 else activities[0])
                evening.append(
                    ItinerarySlotSchema(
                        time="06:00 PM - 08:30 PM",
                        title=act3.name,
                        description=act3.description,
                        location=act3.location,
                        cost=act3.estimated_cost,
                        type="activity",
                    )
                )

            meals = {
                "breakfast": "Artisanal bakery and coastal breakfast",
                "lunch": "Authentic regional thali experience",
                "dinner": "Seaside candlelit dinner with local cuisine",
            }
            daily_cost = (
                sum(s.cost for s in morning)
                + sum(s.cost for s in afternoon)
                + sum(s.cost for s in evening)
                + 900.0 * (request.travelers or 1)
            )

            itinerary.append(
                ItineraryDaySchema(
                    day_number=day + 1,
                    date=date_str,
                    morning=morning,
                    afternoon=afternoon,
                    evening=evening,
                    meals=meals,
                    daily_estimated_cost=round(daily_cost, 2),
                    notes="Relaxed pacing aligned with travel preferences.",
                )
            )

        return itinerary
