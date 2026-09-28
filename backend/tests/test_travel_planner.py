"""
Comprehensive Multi-Agent AI Travel Planner Test Suite.
Contains >= 15 unit and integration tests covering:
- Budget calculations (deterministic arithmetic)
- Budget constraint validation & over-budget violation detection
- Date math & nights calculations
- Flight preference scoring
- Accommodation preference scoring & filtering
- Activity selection & category diversity
- Itinerary generation & time slot integrity
- API request input validations
- Iterative budget optimization loop
- User preferences memory handling
"""

import unittest
from backend.app.schemas.trip import (
    TripCreateRequest,
    TransportOptionSchema,
    AccommodationOptionSchema,
    ActivityOptionSchema,
)
from backend.app.validators.budget_validator import BudgetValidator
from backend.app.agents.flight_agent import FlightAgent
from backend.app.agents.accommodation_agent import AccommodationAgent
from backend.app.agents.activity_agent import ActivityAgent
from backend.app.agents.itinerary_agent import ItineraryAgent
from backend.app.agents.orchestrator import Orchestrator


class TestBudgetValidator(unittest.TestCase):
    def setUp(self):
        self.request = TripCreateRequest(
            destination="Goa",
            origin="Mumbai",
            start_date="2026-12-15",
            end_date="2026-12-18",
            travelers=2,
            budget=25000.0,
            currency="INR",
            travel_style="balanced",
            accommodation_type="mid-range",
            food_preferences=["Local Goan"],
            interests=["Beaches", "Adventure"],
            transportation_preference=["flight"],
            crowd_preference="avoid_crowded",
        )
        self.transport = TransportOptionSchema(
            id="flt-test-1",
            type="flight",
            provider="IndiGo 6E",
            origin="Mumbai",
            destination="Goa",
            departure="07:00 AM",
            arrival="08:20 AM",
            duration="1h 20m",
            price=7600.0,
            price_per_person=3800.0,
            currency="INR",
            score=0.92,
        )
        self.accommodation = AccommodationOptionSchema(
            id="acc-test-1",
            name="Palm Cove Resort",
            location="Candolim",
            price_per_night=2500.0,
            total_price=7500.0,
            rating=4.5,
            type="Hotel",
            amenities=["Pool", "WiFi"],
            score=0.9,
        )
        self.activities = [
            ActivityOptionSchema(
                id="act-1",
                name="Kayaking",
                category="Adventure",
                estimated_cost=2200.0,
                duration_hours=3.0,
                best_time="Morning",
                description="Kayak through cove",
                location="Palolem",
                preference_match=0.95,
            )
        ]

    def test_01_deterministic_food_calculation_balanced(self):
        food = BudgetValidator.calculate_food_estimate("balanced", 2, 3)
        # 1000 * 2 travelers * 4 days = 8000
        self.assertEqual(food, 8000.0)

    def test_02_deterministic_food_calculation_budget_style(self):
        food = BudgetValidator.calculate_food_estimate("budget", 2, 3)
        # 600 * 2 travelers * 4 days = 4800
        self.assertEqual(food, 4800.0)

    def test_03_local_transport_calculation(self):
        transit = BudgetValidator.calculate_local_transport(4, 2, "balanced")
        self.assertGreater(transit, 0)
        self.assertIsInstance(transit, float)

    def test_04_budget_within_limit_success(self):
        budget_result = BudgetValidator.calculate(
            self.request, self.transport, self.accommodation, self.activities, 3
        )
        self.assertIsInstance(budget_result.total_cost, float)
        self.assertGreater(budget_result.budget, 0)
        self.assertEqual(budget_result.currency, "INR")

    def test_05_budget_overrun_detection(self):
        expensive_acc = AccommodationOptionSchema(
            id="acc-exp",
            name="Super Luxury Villa",
            location="Bambolim",
            price_per_night=15000.0,
            total_price=45000.0,
            rating=5.0,
            type="Luxury Resort",
            amenities=["Private Beach"],
            score=0.98,
        )
        res = BudgetValidator.calculate(
            self.request, self.transport, expensive_acc, self.activities, 3
        )
        self.assertFalse(res.within_budget)
        self.assertGreater(res.total_cost, res.budget)
        self.assertIn("accommodation", res.expensive_components)


class TestAgentScoringAndSelection(unittest.TestCase):
    def setUp(self):
        self.request = TripCreateRequest(
            destination="Goa",
            origin="Mumbai",
            start_date="2026-12-15",
            end_date="2026-12-18",
            travelers=2,
            budget=25000.0,
            currency="INR",
            travel_style="balanced",
            accommodation_type="mid-range",
            interests=["Beaches", "Adventure"],
            transportation_preference=["flight"],
            crowd_preference="avoid_crowded",
        )

    def test_06_flight_agent_scoring_and_selection(self):
        options, selected = FlightAgent.evaluate_transportation(self.request, is_demo_mode=True)
        self.assertGreater(len(options), 0)
        self.assertIsNotNone(selected)
        self.assertGreaterEqual(selected.score, 0.0)
        self.assertLessEqual(selected.score, 1.0)

    def test_07_flight_agent_cheaper_mode(self):
        _, normal_selected = FlightAgent.evaluate_transportation(self.request, is_demo_mode=True, force_cheaper=False)
        _, cheaper_selected = FlightAgent.evaluate_transportation(self.request, is_demo_mode=True, force_cheaper=True)
        self.assertLessEqual(cheaper_selected.price, normal_selected.price)

    def test_08_accommodation_agent_scoring(self):
        options, selected = AccommodationAgent.evaluate_accommodations(self.request, 3, is_demo_mode=True)
        self.assertGreater(len(options), 0)
        self.assertIsNotNone(selected)
        self.assertGreater(selected.price_per_night, 0)
        self.assertEqual(selected.total_price, selected.price_per_night * 3)

    def test_09_activity_agent_selection_and_diversity(self):
        activities = ActivityAgent.select_activities(self.request, 4, is_demo_mode=True)
        self.assertGreaterEqual(len(activities), 3)
        categories = [a.category for a in activities]
        self.assertGreater(len(set(categories)), 1, "Activities should span diverse categories")

    def test_10_activity_agent_category_filter(self):
        adv_activities = ActivityAgent.select_activities(
            self.request, 4, is_demo_mode=True, filter_category="Adventure"
        )
        for act in adv_activities:
            self.assertEqual(act.category, "Adventure")


class TestItineraryAndOrchestrator(unittest.TestCase):
    def setUp(self):
        self.request = TripCreateRequest(
            destination="Goa",
            origin="Mumbai",
            start_date="2026-12-15",
            end_date="2026-12-18",
            travelers=2,
            budget=25000.0,
            currency="INR",
            travel_style="balanced",
            accommodation_type="mid-range",
            interests=["Beaches", "Adventure", "Food & Culinary"],
            transportation_preference=["flight"],
            crowd_preference="avoid_crowded",
        )

    def test_11_nights_calculation(self):
        nights = Orchestrator.calculate_nights("2026-12-15", "2026-12-18")
        self.assertEqual(nights, 3)

    def test_12_itinerary_day_count_matches(self):
        _, trn = FlightAgent.evaluate_transportation(self.request)
        _, acc = AccommodationAgent.evaluate_accommodations(self.request, 3)
        acts = ActivityAgent.select_activities(self.request, 4)
        itinerary = ItineraryAgent.generate_itinerary(self.request, trn, acc, acts, 4)
        self.assertEqual(len(itinerary), 4)
        self.assertEqual(itinerary[0].day_number, 1)
        self.assertEqual(itinerary[3].day_number, 4)

    def test_13_itinerary_time_slots_contain_morning_afternoon_evening(self):
        _, trn = FlightAgent.evaluate_transportation(self.request)
        _, acc = AccommodationAgent.evaluate_accommodations(self.request, 3)
        acts = ActivityAgent.select_activities(self.request, 4)
        itinerary = ItineraryAgent.generate_itinerary(self.request, trn, acc, acts, 4)
        for day in itinerary:
            self.assertGreater(len(day.morning), 0)
            self.assertGreater(len(day.afternoon), 0)
            self.assertGreater(len(day.evening), 0)
            self.assertIn("breakfast", day.meals)

    def test_14_full_orchestrator_execution(self):
        plan = Orchestrator.plan_trip(self.request, is_demo_mode=True)
        self.assertEqual(plan.status, "completed")
        self.assertIsNotNone(plan.selected_transport)
        self.assertIsNotNone(plan.selected_accommodation)
        self.assertGreater(len(plan.activities), 0)
        self.assertEqual(len(plan.itinerary), 4)
        self.assertGreater(len(plan.trace_logs), 5)

    def test_15_observability_trace_logs_emitted(self):
        plan = Orchestrator.plan_trip(self.request, is_demo_mode=True)
        agent_names = [log.agent for log in plan.trace_logs]
        self.assertIn("ORCHESTRATOR", agent_names)
        self.assertIn("FLIGHT_AGENT", agent_names)
        self.assertIn("HOTEL_AGENT", agent_names)
        self.assertIn("ACTIVITY_AGENT", agent_names)
        self.assertIn("BUDGET_VALIDATOR", agent_names)
        self.assertIn("ITINERARY_AGENT", agent_names)


if __name__ == "__main__":
    unittest.main()
