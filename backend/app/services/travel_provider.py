"""
Transportation Provider Abstraction Layer for FastAPI backend.
"""

from typing import List
import time
from backend.app.schemas.trip import TransportOptionSchema, TripCreateRequest


class TravelProvider:
    @staticmethod
    def search_transportation(
        request: TripCreateRequest, is_demo_mode: bool = True
    ) -> List[TransportOptionSchema]:
        origin = request.origin.strip()
        dest = request.destination.strip()
        travelers = request.travelers or 1
        prefs = request.transportation_preference or ["flight", "train"]

        options: List[TransportOptionSchema] = []

        if "flight" in prefs:
            f1_per_p = 3800.0 if request.budget <= 35000 else 5200.0
            options.append(
                TransportOptionSchema(
                    id=f"flt-1-{int(time.time())}",
                    type="flight",
                    provider="IndiGo 6E-241",
                    origin=f"{origin} International",
                    destination=f"{dest} Airport",
                    departure="07:15 AM",
                    arrival="08:35 AM",
                    duration="1h 20m",
                    price_per_person=f1_per_p,
                    price=f1_per_p * travelers,
                    currency=request.currency,
                    score=0.94,
                    stops=0,
                    is_demo_data=True,
                )
            )
            f2_per_p = 3200.0 if request.budget <= 35000 else 4400.0
            options.append(
                TransportOptionSchema(
                    id=f"flt-2-{int(time.time())}",
                    type="flight",
                    provider="Air India Express IX-182",
                    origin=f"{origin} Domestic T1",
                    destination=f"{dest} Dabolim",
                    departure="12:40 PM",
                    arrival="02:05 PM",
                    duration="1h 25m",
                    price_per_person=f2_per_p,
                    price=f2_per_p * travelers,
                    currency=request.currency,
                    score=0.88,
                    stops=0,
                    is_demo_data=True,
                )
            )

        if "train" in prefs or request.travel_style in ["budget", "relaxed"]:
            t_price = 1650.0
            options.append(
                TransportOptionSchema(
                    id=f"trn-1-{int(time.time())}",
                    type="train",
                    provider="Vande Bharat Express (22229)",
                    origin=f"{origin} CSMT",
                    destination=f"{dest} Madgaon",
                    departure="05:25 AM",
                    arrival="01:10 PM",
                    duration="7h 45m",
                    price_per_person=t_price,
                    price=t_price * travelers,
                    currency=request.currency,
                    score=0.86,
                    stops=4,
                    is_demo_data=True,
                )
            )

        if "bus" in prefs or request.travel_style == "budget":
            b_price = 1200.0
            options.append(
                TransportOptionSchema(
                    id=f"bus-1-{int(time.time())}",
                    type="bus",
                    provider="KTC Luxury Multi-Axle Volvo AC Sleeper",
                    origin=f"{origin} Central",
                    destination=f"{dest} Bus Stand",
                    departure="08:30 PM",
                    arrival="07:45 AM (+1d)",
                    duration="11h 15m",
                    price_per_person=b_price,
                    price=b_price * travelers,
                    currency=request.currency,
                    score=0.74,
                    stops=2,
                    is_demo_data=True,
                )
            )

        return options
