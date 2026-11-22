from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class GeoPoint(BaseModel):
    lat: float
    lon: float
    name: Optional[str] = None
    address: Optional[str] = None

class StopModel(BaseModel):
    stop_id: str
    stop_name: str
    lat: float
    lon: float
    feed_key: str
    location_type: int = 0
    zone_id: Optional[str] = None
    wheelchair_boarding: int = 0

class JourneySearchRequest(BaseModel):
    origin: GeoPoint
    destination: GeoPoint
    departure_time: str = "08:30"  # HH:MM format
    travel_date: str = "2026-11-17"  # YYYY-MM-DD
    modes: List[str] = Field(default_factory=lambda: ["bus", "metro", "walk"])
    max_walking_distance_meters: int = 2000
    max_transfers: int = 3
    optimization_preference: str = "balanced"  # fastest, lowest_fare, fewest_transfers, least_walking, balanced
    accessible_only: bool = False
    schedule_data: Optional[Dict[str, Any]] = None  # Injected GTFS schedule subset from Node.js or embedded

class IntermediateStop(BaseModel):
    stop_id: str
    stop_name: str
    lat: float
    lon: float
    arrival_time: str
    departure_time: str

class JourneyLeg(BaseModel):
    leg_type: str  # "walk" or "transit"
    mode: str  # "walk", "bus", "metro"
    provider_name: Optional[str] = None
    feed_key: Optional[str] = None
    route_id: Optional[str] = None
    route_short_name: Optional[str] = None
    route_long_name: Optional[str] = None
    trip_id: Optional[str] = None
    headsign: Optional[str] = None
    from_stop_id: Optional[str] = None
    from_stop_name: str
    from_coords: GeoPoint
    to_stop_id: Optional[str] = None
    to_stop_name: str
    to_coords: GeoPoint
    departure_time: str
    arrival_time: str
    duration_seconds: int
    distance_meters: int
    fare: float = 0.0
    fare_currency: str = "INR"
    intermediate_stops: List[IntermediateStop] = Field(default_factory=list)
    polyline: List[List[float]] = Field(default_factory=list)  # [[lat, lon], ...]
    instructions: str = ""

class JourneyAlternative(BaseModel):
    id: str
    total_duration_seconds: int
    departure_time: str
    arrival_time: str
    walking_duration_seconds: int
    walking_distance_meters: int
    waiting_duration_seconds: int
    transfer_count: int
    modes_used: List[str]
    fare: float
    fare_currency: str = "INR"
    reliability_score: float = 95.0
    legs: List[JourneyLeg]
    score: float = 0.0
    pareto_optimal: bool = True
    summary: str
    co2_emissions_kg: float = 0.4
    booking_available: bool = False
    booking_provider_id: Optional[str] = None

class JourneySearchResponse(BaseModel):
    request_id: str
    search_time_ms: float
    origin: GeoPoint
    destination: GeoPoint
    alternatives: List[JourneyAlternative]
    total_alternatives: int
    pareto_count: int
    diagnostics: Dict[str, Any]

class GraphValidationRequest(BaseModel):
    feed_keys: List[str] = Field(default_factory=list)
    stops_count: int = 0
    routes_count: int = 0
    trips_count: int = 0

class GraphValidationResponse(BaseModel):
    valid: bool
    warnings: List[str] = Field(default_factory=list)
    errors: List[str] = Field(default_factory=list)
    isolated_stops: int = 0
    multimodal_transfers_count: int = 0
    stats: Dict[str, Any] = Field(default_factory=dict)
