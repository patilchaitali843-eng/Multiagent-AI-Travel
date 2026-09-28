"""
SQLAlchemy relational models for PostgreSQL / SQLite.
"""

from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    JSON,
)
from sqlalchemy.orm import relationship
from backend.app.database.session import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    trips = relationship("Trip", back_populates="user", cascade="all, delete-orphan")
    preference = relationship("TripPreference", back_populates="user", uselist=False)


class TripPreference(Base):
    __tablename__ = "trip_preferences"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    preferred_accommodation = Column(String, default="mid-range")
    preferred_activities = Column(JSON, default=list)
    food_preferences = Column(JSON, default=list)
    travel_style = Column(String, default="balanced")
    preferred_transport = Column(JSON, default=list)
    crowd_preference = Column(String, default="avoid_crowded")
    currency = Column(String, default="INR")

    user = relationship("User", back_populates="preference")


class Trip(Base):
    __tablename__ = "trips"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    destination = Column(String, nullable=False, index=True)
    origin = Column(String, nullable=False)
    start_date = Column(String, nullable=False)
    end_date = Column(String, nullable=False)
    travelers = Column(Integer, default=1)
    budget = Column(Float, nullable=False)
    currency = Column(String, default="INR")
    travel_style = Column(String, default="balanced")
    accommodation_type = Column(String, default="mid-range")
    food_preferences = Column(JSON, default=list)
    interests = Column(JSON, default=list)
    transport_preference = Column(JSON, default=list)
    crowd_preference = Column(String, default="avoid_crowded")
    additional_requirements = Column(Text, nullable=True)
    status = Column(String, default="created")  # created, optimizing, completed, failed
    iterations_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="trips")
    transport_options = relationship("TransportOptionModel", back_populates="trip", cascade="all, delete-orphan")
    accommodations = relationship("AccommodationModel", back_populates="trip", cascade="all, delete-orphan")
    activities = relationship("ActivityModel", back_populates="trip", cascade="all, delete-orphan")
    budget_breakdown = relationship("BudgetBreakdownModel", back_populates="trip", uselist=False, cascade="all, delete-orphan")
    itinerary_days = relationship("ItineraryDayModel", back_populates="trip", cascade="all, delete-orphan")


class TransportOptionModel(Base):
    __tablename__ = "transport_options"

    id = Column(String, primary_key=True, index=True)
    trip_id = Column(String, ForeignKey("trips.id"))
    type = Column(String, nullable=False)
    provider = Column(String, nullable=False)
    origin = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    departure = Column(String, nullable=False)
    arrival = Column(String, nullable=False)
    duration = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    currency = Column(String, default="INR")
    score = Column(Float, default=0.0)
    stops = Column(Integer, default=0)
    is_selected = Column(Boolean, default=False)

    trip = relationship("Trip", back_populates="transport_options")


class AccommodationModel(Base):
    __tablename__ = "accommodations"

    id = Column(String, primary_key=True, index=True)
    trip_id = Column(String, ForeignKey("trips.id"))
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    price_per_night = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    rating = Column(Float, default=4.0)
    type = Column(String, default="Hotel")
    amenities = Column(JSON, default=list)
    score = Column(Float, default=0.0)
    is_selected = Column(Boolean, default=False)

    trip = relationship("Trip", back_populates="accommodations")


class ActivityModel(Base):
    __tablename__ = "activities"

    id = Column(String, primary_key=True, index=True)
    trip_id = Column(String, ForeignKey("trips.id"))
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    estimated_cost = Column(Float, default=0.0)
    duration_hours = Column(Float, default=2.0)
    best_time = Column(String, default="Morning")
    description = Column(Text, default="")
    location = Column(String, default="")
    preference_match = Column(Float, default=0.8)
    crowd_level = Column(String, default="Moderate")

    trip = relationship("Trip", back_populates="activities")


class BudgetBreakdownModel(Base):
    __tablename__ = "budget_breakdowns"

    id = Column(String, primary_key=True, index=True)
    trip_id = Column(String, ForeignKey("trips.id"))
    transportation = Column(Float, default=0.0)
    accommodation = Column(Float, default=0.0)
    food = Column(Float, default=0.0)
    activities = Column(Float, default=0.0)
    local_transport = Column(Float, default=0.0)
    miscellaneous = Column(Float, default=0.0)
    contingency = Column(Float, default=0.0)
    total_cost = Column(Float, default=0.0)
    budget = Column(Float, default=0.0)
    remaining = Column(Float, default=0.0)
    utilization_percentage = Column(Float, default=0.0)
    within_budget = Column(Boolean, default=True)

    trip = relationship("Trip", back_populates="budget_breakdown")


class ItineraryDayModel(Base):
    __tablename__ = "itineraries"

    id = Column(String, primary_key=True, index=True)
    trip_id = Column(String, ForeignKey("trips.id"))
    day_number = Column(Integer, nullable=False)
    date = Column(String, nullable=False)
    morning_slots = Column(JSON, default=list)
    afternoon_slots = Column(JSON, default=list)
    evening_slots = Column(JSON, default=list)
    meals = Column(JSON, default=dict)
    daily_estimated_cost = Column(Float, default=0.0)

    trip = relationship("Trip", back_populates="itinerary_days")
