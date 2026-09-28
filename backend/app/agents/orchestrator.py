"""
Multi-Agent Orchestrator in Python.
Coordinates Flight Agent, Accommodation Agent, Activity Agent, Budget Validator, and Itinerary Generator.
"""

from typing import List
from datetime import datetime
import time
from backend.app.schemas.trip import (
    TripCreateRequest,
    TripResponseSchema,
    AgentTraceLogSchema,
    TransportOptionSchema,
    AccommodationOptionSchema,
    ActivityOptionSchema,
    BudgetBreakdownSchema,
)
from backend.app.agents.flight_agent import FlightAgent
from backend.app.agents.accommodation_agent import AccommodationAgent
from backend.app.agents.activity_agent import ActivityAgent
from backend.app.validators.budget_validator import BudgetValidator
from backend.app.agents.itinerary_agent import ItineraryAgent


class Orchestrator:
    @staticmethod
    def calculate_nights(start_date: str, end_date: str) -> int:
        try:
            d1 = datetime.strptime(start_date, "%Y-%m-%d")
            d2 = datetime.strptime(end_date, "%Y-%m-%d")
            days = (d2 - d1).days
            return max(1, days)
        except Exception:
            return 3

    @classmethod
    def plan_trip(cls, request: TripCreateRequest, is_demo_mode: bool = True) -> TripResponseSchema:
        trace_logs: List[AgentTraceLogSchema] = []

        def log(agent: str, level: str, message: str):
            trace_logs.append(
                AgentTraceLogSchema(
                    id=f"log-{int(time.time() * 1000)}",
                    timestamp=datetime.utcnow().isoformat(),
                    agent=agent,
                    level=level,
                    message=message,
                )
            )

        nights = cls.calculate_nights(request.start_date, request.end_date)
        days = nights + 1
        trip_id = f"trip-{int(time.time())}"

        log("ORCHESTRATOR", "INFO", f"Request received: {days}-day trip to {request.destination} (Budget: {request.currency} {request.budget:,.2f})")
        log("FLIGHT_AGENT", "INFO", f"Searching transport from {request.origin} to {request.destination}...")
        log("HOTEL_AGENT", "INFO", f"Searching {request.accommodation_type} accommodations in {request.destination}...")
        log("ACTIVITY_AGENT", "INFO", f"Researching activities for {', '.join(request.interests)}...")

        transport_options, selected_transport = FlightAgent.evaluate_transportation(request, is_demo_mode)
        acc_options, selected_acc = AccommodationAgent.evaluate_accommodations(request, nights, is_demo_mode)
        selected_activities = ActivityAgent.select_activities(request, days, is_demo_mode)

        log("FLIGHT_AGENT", "SUCCESS", f"Selected {selected_transport.provider} ({request.currency} {selected_transport.price:,.2f})")
        log("HOTEL_AGENT", "SUCCESS", f"Selected {selected_acc.name} ({request.currency} {selected_acc.total_price:,.2f})")
        log("ACTIVITY_AGENT", "SUCCESS", f"Selected {len(selected_activities)} activities")

        log("BUDGET_VALIDATOR", "INFO", "Validating budget constraints deterministically (No LLM math)...")
        budget = BudgetValidator.calculate(request, selected_transport, selected_acc, selected_activities, nights)

        iterations = 0
        max_iterations = 3
        while not budget.within_budget and iterations < max_iterations:
            iterations += 1
            log("ORCHESTRATOR", "WARNING", f"Budget exceeded by {request.currency} {budget.total_cost - budget.budget:,.2f}. Optimization iteration {iterations}/{max_iterations}")

            if "accommodation" in budget.expensive_components or selected_acc.total_price > request.budget * 0.45:
                log("HOTEL_AGENT", "INFO", "Requesting cheaper accommodation alternatives...")
                _, cheaper_acc = AccommodationAgent.evaluate_accommodations(request, nights, is_demo_mode, force_cheaper=True)
                selected_acc = cheaper_acc
            elif "transportation" in budget.expensive_components or selected_transport.price > request.budget * 0.40:
                log("FLIGHT_AGENT", "INFO", "Requesting cheaper transport alternatives...")
                _, cheaper_trn = FlightAgent.evaluate_transportation(request, is_demo_mode, force_cheaper=True)
                selected_transport = cheaper_trn
            else:
                log("ACTIVITY_AGENT", "INFO", "Pruning expensive activities for budget-friendly alternatives...")
                selected_activities = ActivityAgent.select_activities(request, days, is_demo_mode, limit_budget=True)

            budget = BudgetValidator.calculate(request, selected_transport, selected_acc, selected_activities, nights)

        if budget.within_budget:
            log("BUDGET_VALIDATOR", "SUCCESS", f"Budget verified: {budget.utilization_percentage}% utilized")
        else:
            log("ORCHESTRATOR", "WARNING", f"Reached max iterations ({max_iterations}). Presenting optimal feasible plan.")

        log("ITINERARY_AGENT", "INFO", f"Assembling {days}-day chronological itinerary...")
        itinerary = ItineraryAgent.generate_itinerary(request, selected_transport, selected_acc, selected_activities, days)
        log("ITINERARY_AGENT", "SUCCESS", f"Generated {len(itinerary)} itinerary days.")
        log("ORCHESTRATOR", "SUCCESS", f"[COMPLETE] Personalized itinerary generated for {request.destination}.")

        now_str = datetime.utcnow().isoformat()
        return TripResponseSchema(
            id=trip_id,
            request=request,
            transportation=transport_options,
            selected_transport=selected_transport,
            accommodation=acc_options,
            selected_accommodation=selected_acc,
            activities=selected_activities,
            budget=budget,
            itinerary=itinerary,
            trace_logs=trace_logs,
            status="completed",
            iterations_count=iterations,
            created_at=now_str,
            updated_at=now_str,
        )
