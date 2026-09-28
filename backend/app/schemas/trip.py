"""
Pydantic schemas for data validation and structured agent outputs.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class TransportOptionSchema(BaseModel):
    id: str
    type: str = "flight"
    provider: str
    origin: str
    destination: str
    departure: str
    arrival: str
    duration: str
    price: float
    price_per_person: float
    currency: str = "INR"
    score: float = 0.85
    stops: int = 0
    is_demo_data: bool = True


class AccommodationOptionSchema(BaseModel):
    id: str
    name: str
    location: str
    price_per_night: float
    total_price: float
    rating: float
    type: str = "Hotel"
    amenities: List[str] = Field(default_factory=list)
    score: float = 0.89
    image_url: Optional[str] = None
    is_demo_data: bool = True


class ActivityOptionSchema(BaseModel):
    id: str
    name: str
    category: str
    estimated_cost: float
    duration_hours: float
    best_time: str
    description: str
    location: str
    preference_match: float
    crowd_level: str = "Moderate"
    is_demo_data: bool = True


class BudgetBreakdownSchema(BaseModel):
    transportation: float
    accommodation: float
    food: float
    activities: float
    local_transport: float
    miscellaneous: float
    contingency: float
    total_cost: float
    budget: float
    remaining: float
    utilization_percentage: float
    within_budget: bool
    currency: str = "INR"
    expensive_components: List[str] = Field(default_factory=list)
    optimization_notes: List[str] = Field(default_factory=list)


class ItinerarySlotSchema(BaseModel):
    time: str
    title: str
    description: str
    location: str
    cost: float
    type: str  # activity, meal, transit, rest


class ItineraryDaySchema(BaseModel):
    day_number: int
    date: str
    morning: List[ItinerarySlotSchema]
    afternoon: List[ItinerarySlotSchema]
    evening: List[ItinerarySlotSchema]
    meals: Dict[str, str]
    daily_estimated_cost: float
    notes: Optional[str] = None


class AgentTraceLogSchema(BaseModel):
    id: str
    timestamp: str
    agent: str
    level: str
    message: str
    details: Optional[Dict[str, Any]] = None


class TripCreateRequest(BaseModel):
    destination: str
    origin: str
    start_date: str
    end_date: str
    travelers: int = 1
    budget: float
    currency: str = "INR"
    travel_style: str = "balanced"
    accommodation_type: str = "mid-range"
    food_preferences: List[str] = Field(default_factory=list)
    interests: List[str] = Field(default_factory=list)
    transportation_preference: List[str] = Field(default_factory=lambda: ["flight"])
    crowd_preference: str = "avoid_crowded"
    additional_requirements: Optional[str] = None


class UserPreferencesSchema(BaseModel):
    preferred_accommodation: str = "mid-range"
    preferred_activities: List[str] = Field(default_factory=list)
    food_preferences: List[str] = Field(default_factory=list)
    travel_style: str = "balanced"
    preferred_transport: List[str] = Field(default_factory=list)
    crowd_preference: str = "avoid_crowded"
    currency: str = "INR"


class TripResponseSchema(BaseModel):
    id: str
    request: TripCreateRequest
    transportation: List[TransportOptionSchema]
    selected_transport: TransportOptionSchema
    accommodation: List[AccommodationOptionSchema]
    selected_accommodation: AccommodationOptionSchema
    activities: List[ActivityOptionSchema]
    budget: BudgetBreakdownSchema
    itinerary: List[ItineraryDaySchema]
    trace_logs: List[AgentTraceLogSchema]
    status: str
    iterations_count: int = 0
    created_at: str
    updated_at: str
