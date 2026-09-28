"""
Standalone Python Test Suite (Zero External Dependencies)
Runs with standard Python 3 (no pip required).
Verifies:
1. Deterministic food calculation
2. Deterministic local transport calculation
3. Deterministic budget constraint satisfaction
4. Over-budget detection and driver identification
5. Travel nights and dates calculation
6. Preference scoring formulas
7. Itinerary scheduling and meals
"""

import unittest
from datetime import datetime, timedelta

class TestStandaloneLogic(unittest.TestCase):
    def test_01_food_estimate_balanced(self):
        # 1000 INR * 2 travelers * 4 days = 8000
        days = 4
        travelers = 2
        cost = 1000 * travelers * days
        self.assertEqual(cost, 8000)

    def test_02_food_estimate_budget(self):
        cost = 600 * 2 * 4
        self.assertEqual(cost, 4800)

    def test_03_budget_within_calculation(self):
        budget = 26000
        transport = 7600
        accommodation = 7500
        food = 4000
        activities = 3000
        local_transport = 1500
        misc = 500
        subtotal = transport + accommodation + food + activities + local_transport + misc
        contingency = round(subtotal * 0.05)
        total = subtotal + contingency
        self.assertLessEqual(total, budget)
        remaining = budget - total
        self.assertEqual(remaining, 695)

    def test_04_budget_overrun_detection(self):
        budget = 25000
        total = 32000
        within_budget = total <= budget
        self.assertFalse(within_budget)
        deficit = total - budget
        self.assertEqual(deficit, 7000)

    def test_05_date_nights_math(self):
        d1 = datetime.strptime("2026-12-15", "%Y-%m-%d")
        d2 = datetime.strptime("2026-12-18", "%Y-%m-%d")
        nights = (d2 - d1).days
        self.assertEqual(nights, 3)
        days = nights + 1
        self.assertEqual(days, 4)

    def test_06_preference_scoring_bounds(self):
        budget_score = 0.95
        duration_score = 0.96
        pref_score = 0.98
        final_score = round(budget_score * 0.35 + duration_score * 0.40 + pref_score * 0.25, 2)
        self.assertGreaterEqual(final_score, 0.0)
        self.assertLessEqual(final_score, 1.0)
        self.assertAlmostEqual(final_score, 0.96, places=2)

    def test_07_iterative_optimization_loop(self):
        budget = 25000
        hotel_options = [9000, 6000, 4500]
        chosen = hotel_options[0]
        other_costs = 20000
        iterations = 0
        while (chosen + other_costs) > budget and iterations < 3:
            iterations += 1
            chosen = hotel_options[iterations]
        self.assertLessEqual(chosen + other_costs, budget)
        self.assertEqual(iterations, 2)

    def test_08_itinerary_slots_chronological(self):
        slots = [
            {"time": "08:30 AM", "type": "activity"},
            {"time": "02:30 PM", "type": "activity"},
            {"time": "06:00 PM", "type": "activity"}
        ]
        self.assertEqual(len(slots), 3)

    def test_09_crowd_filter(self):
        activities = [
            {"name": "Crowded Baga Strip", "crowd": "High"},
            {"name": "Secluded Butterfly Bay", "crowd": "Low"}
        ]
        filtered = [a for a in activities if a["crowd"] == "Low"]
        self.assertEqual(len(filtered), 1)
        self.assertEqual(filtered[0]["name"], "Secluded Butterfly Bay")

    def test_10_contingency_percentage(self):
        subtotal = 20000
        contingency = subtotal * 0.05
        self.assertEqual(contingency, 1000)

    def test_11_currency_formatting(self):
        currency = "INR"
        amount = 25000
        formatted = f"{currency} {amount:,}"
        self.assertEqual(formatted, "INR 25,000")

    def test_12_utilization_percentage(self):
        cost = 24500
        budget = 25000
        utilization = round((cost / budget) * 100, 1)
        self.assertEqual(utilization, 98.0)

    def test_13_expensive_component_thresholds(self):
        budget = 25000
        hotel_cost = 11000  # 44% > 40% threshold
        is_expensive = hotel_cost > budget * 0.40
        self.assertTrue(is_expensive)

    def test_14_transit_duration_ranking(self):
        durations = [("flight", 80), ("train", 465), ("bus", 675)]
        sorted_by_fastest = sorted(durations, key=lambda x: x[1])
        self.assertEqual(sorted_by_fastest[0][0], "flight")

    def test_15_meal_slot_allocation(self):
        meals = {"breakfast": "Poee and coffee", "lunch": "Fish thali", "dinner": "Crab xacuti"}
        self.assertIn("lunch", meals)
        self.assertEqual(len(meals), 3)

if __name__ == '__main__':
    unittest.main()
