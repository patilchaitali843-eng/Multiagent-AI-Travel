"""
Deterministic Budget Validator in Python.
Calculates all budget components with standard deterministic math (no LLM arithmetic).
"""

from typing import List, Dict, Any
from backend.app.schemas.trip import (
    TripCreateRequest,
    TransportOptionSchema,
    AccommodationOptionSchema,
    ActivityOptionSchema,
    BudgetBreakdownSchema,
)


class BudgetValidator:
    @staticmethod
    def calculate_food_estimate(style: str, travelers: int, nights: int) -> float:
        style_rates = {
            "budget": 600.0,
            "relaxed": 1000.0,
            "balanced": 1000.0,
            "luxury": 3000.0,
        }
        per_person_day = style_rates.get(style.lower(), 1000.0)
        days = max(1, nights + 1)
        return round(per_person_day * travelers * days, 2)

    @staticmethod
    def calculate_local_transport(days: int, travelers: int, style: str) -> float:
        base_daily = 300.0 if style == "budget" else 1500.0 if style == "luxury" else 600.0
        return round(base_daily * days * (1.0 + (travelers - 1) * 0.3), 2)

    @classmethod
    def calculate(
        cls,
        request: TripCreateRequest,
        transport: TransportOptionSchema,
        accommodation: AccommodationOptionSchema,
        activities: List[ActivityOptionSchema],
        nights: int,
    ) -> BudgetBreakdownSchema:
        days = max(1, nights + 1)
        transport_cost = float(round(transport.price, 2))
        accommodation_cost = float(round(accommodation.total_price, 2))
        activities_cost = float(round(sum(a.estimated_cost for a in activities), 2))
        food_cost = cls.calculate_food_estimate(request.travel_style, request.travelers, nights)
        local_transport_cost = cls.calculate_local_transport(days, request.travelers, request.travel_style)
        miscellaneous_cost = float(round(days * request.travelers * 200.0, 2))

        subtotal = (
            transport_cost
            + accommodation_cost
            + activities_cost
            + food_cost
            + local_transport_cost
            + miscellaneous_cost
        )
        contingency = float(round(subtotal * 0.05, 2))
        total_cost = float(round(subtotal + contingency, 2))
        budget = float(round(request.budget, 2))
        remaining = float(round(budget - total_cost, 2))
        utilization = float(round((total_cost / budget) * 100.0, 1)) if budget > 0 else 100.0
        within_budget = total_cost <= budget

        expensive_components = []
        if transport_cost > budget * 0.40:
            expensive_components.append("transportation")
        if accommodation_cost > budget * 0.40:
            expensive_components.append("accommodation")
        if activities_cost > budget * 0.25:
            expensive_components.append("activities")
        if food_cost > budget * 0.25:
            expensive_components.append("food")

        notes = []
        if not within_budget:
            deficit = total_cost - budget
            notes.append(f"Budget exceeded by {request.currency} {deficit:,.2f}.")
            if expensive_components:
                notes.append(f"High cost drivers: {', '.join(expensive_components)}.")
        else:
            notes.append(
                f"Within budget with {request.currency} {remaining:,.2f} unallocated reserve ({100 - utilization:.1f}% safety cushion)."
            )

        return BudgetBreakdownSchema(
            transportation=transport_cost,
            accommodation=accommodation_cost,
            food=food_cost,
            activities=activities_cost,
            local_transport=local_transport_cost,
            miscellaneous=miscellaneous_cost,
            contingency=contingency,
            total_cost=total_cost,
            budget=budget,
            remaining=remaining,
            utilization_percentage=utilization,
            within_budget=within_budget,
            currency=request.currency,
            expensive_components=expensive_components,
            optimization_notes=notes,
        )
