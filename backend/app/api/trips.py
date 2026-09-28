"""
FastAPI REST routes for trip planning, multi-agent execution, and memory.
"""

from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends
from backend.app.schemas.trip import (
    TripCreateRequest,
    TripResponseSchema,
    UserPreferencesSchema,
    BudgetBreakdownSchema,
)
from backend.app.agents.orchestrator import Orchestrator

router = APIRouter(prefix="/trips", tags=["trips"])

# In-memory session database for rapid execution
TRIPS_DB: Dict[str, TripResponseSchema] = {}
PREFERENCES_DB = UserPreferencesSchema()


@router.post("", response_model=Dict[str, Any], status_code=201)
def create_trip(request: TripCreateRequest):
    if not request.destination.strip():
        raise HTTPException(status_code=400, detail="Destination is required")
    if not request.origin.strip():
        raise HTTPException(status_code=400, detail="Origin is required")
    if request.budget <= 0:
        raise HTTPException(status_code=400, detail="Budget must be greater than zero")

    trip_id = f"trip-{len(TRIPS_DB) + 1}"
    return {"id": trip_id, "status": "created", "request": request}


@router.get("/{trip_id}", response_model=TripResponseSchema)
def get_trip(trip_id: str):
    if trip_id not in TRIPS_DB:
        raise HTTPException(status_code=404, detail="Trip not found")
    return TRIPS_DB[trip_id]


@router.post("/{trip_id}/generate", response_model=TripResponseSchema)
def generate_trip(trip_id: str, request: TripCreateRequest):
    try:
        plan = Orchestrator.plan_trip(request, is_demo_mode=True)
        plan.id = trip_id
        TRIPS_DB[trip_id] = plan
        return plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent orchestration failed: {str(e)}")


@router.get("/{trip_id}/itinerary")
def get_trip_itinerary(trip_id: str):
    if trip_id not in TRIPS_DB:
        raise HTTPException(status_code=404, detail="Trip not found")
    return TRIPS_DB[trip_id].itinerary


@router.get("/{trip_id}/budget", response_model=BudgetBreakdownSchema)
def get_trip_budget(trip_id: str):
    if trip_id not in TRIPS_DB:
        raise HTTPException(status_code=404, detail="Trip not found")
    return TRIPS_DB[trip_id].budget


@router.post("/{trip_id}/optimize-budget", response_model=TripResponseSchema)
def optimize_budget(trip_id: str):
    if trip_id not in TRIPS_DB:
        raise HTTPException(status_code=404, detail="Trip not found")
    current = TRIPS_DB[trip_id]
    # Re-run plan with budget limit enforced
    optimized = Orchestrator.plan_trip(current.request, is_demo_mode=True)
    optimized.id = trip_id
    TRIPS_DB[trip_id] = optimized
    return optimized
