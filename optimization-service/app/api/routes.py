
import time
import uuid
import logging

from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    JourneySearchRequest,
    JourneySearchResponse,
    GraphValidationRequest,
    GraphValidationResponse,
)

from app.services.schedule_store import (
    ScheduleStore,
    global_schedule_store,
)

from app.algorithms.time_dependent_search import TimeDependentRouter
from app.core.config import settings


logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/health")
def health_check():
    store = global_schedule_store

    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "data_source": getattr(
            store,
            "data_source",
            "unknown",
        ),
        "travel_date": getattr(
            store,
            "travel_date",
            None,
        ),
        "stops_loaded": len(store.stops),
        "routes_loaded": len(store.routes),
        "trips_loaded": len(store.trips),
        "stop_sequences_loaded": len(store.stop_times),
    }


@router.post(
    "/journeys/search",
    response_model=JourneySearchResponse,
)
def search_journeys(req: JourneySearchRequest):
    start_time = time.time()
    request_id = str(uuid.uuid4())

    try:
        # Build a separate schedule for this request's travel date.
        # This avoids one user's date changing another user's timetable.
        schedule_store = ScheduleStore(
            travel_date=req.travel_date
        )

        if not schedule_store.stops:
            raise HTTPException(
                status_code=503,
                detail="No transport stops are available.",
            )

        if not schedule_store.trips:
            raise HTTPException(
                status_code=503,
                detail="No scheduled transport services are available.",
            )

        router_engine = TimeDependentRouter(schedule_store)

        alternatives = router_engine.plan_journey(req)

        elapsed_ms = round(
            (time.time() - start_time) * 1000,
            2,
        )

        pareto_count = sum(
            1
            for alternative in alternatives
            if alternative.pareto_optimal
        )

        diagnostics = {
            "search_time_ms": elapsed_ms,
            "request_id": request_id,
            "travel_date": req.travel_date,
            "departure_time": req.departure_time,
            "preference_applied": req.optimization_preference,
            "data_source": schedule_store.data_source,
            "total_stops_scanned": len(schedule_store.stops),
            "total_routes_loaded": len(schedule_store.routes),
            "total_trips_loaded": len(schedule_store.trips),
            "modes_queried": req.modes,
            "origin_coordinates": [
                req.origin.lat,
                req.origin.lon,
            ],
            "destination_coordinates": [
                req.destination.lat,
                req.destination.lon,
            ],
            "feasible_alternatives_generated": len(alternatives),
            "pareto_optimal_alternatives": pareto_count,
        }

        return JourneySearchResponse(
            request_id=request_id,
            search_time_ms=elapsed_ms,
            origin=req.origin,
            destination=req.destination,
            alternatives=alternatives,
            total_alternatives=len(alternatives),
            pareto_count=pareto_count,
            diagnostics=diagnostics,
        )

    except HTTPException:
        raise

    except ValueError as error:
        logger.warning(
            "Invalid journey request %s: %s",
            request_id,
            error,
        )

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except Exception as error:
        logger.exception(
            "Journey search failed. Request ID: %s",
            request_id,
        )

        raise HTTPException(
            status_code=500,
            detail={
                "message": "Journey search failed.",
                "request_id": request_id,
                "error": str(error),
            },
        )


@router.post(
    "/graph/validate",
    response_model=GraphValidationResponse,
)
def validate_graph(req: GraphValidationRequest):
    store = global_schedule_store

    stops = store.stops
    routes = store.routes
    trips = store.trips

    transfer_count = sum(
        len(links)
        for links in store.transfers.values()
    )

    warnings = []

    if not stops:
        warnings.append("No stops are loaded.")

    if not routes:
        warnings.append("No routes are loaded.")

    if not trips:
        warnings.append("No scheduled trips are loaded.")

    if getattr(store, "data_source", "") == "development_sample":
        warnings.append(
            "The development sample timetable is being used."
        )

    return GraphValidationResponse(
        valid=bool(stops and routes),
        warnings=warnings,
        errors=[],
        isolated_stops=0,
        multimodal_transfers_count=transfer_count,
        stats={
            "stops": len(stops),
            "routes": len(routes),
            "trips": len(trips),
            "stop_sequences": len(store.stop_times),
            "cross_feed_interchanges": len(
                store.get_interchange_stops()
            ),
            "data_source": getattr(
                store,
                "data_source",
                "unknown",
            ),
        },
    )


@router.get("/metrics")
def get_metrics():
    store = global_schedule_store

    return {
        "service": settings.PROJECT_NAME,
        "uptime": "operational",
        "data_source": getattr(
            store,
            "data_source",
            "unknown",
        ),
        "graph_nodes": len(store.stops),
        "routes_loaded": len(store.routes),
        "trips_loaded": len(store.trips),
        "active_feeds": list(
            getattr(store, "feed_keys", [])
        ),
        "supported_modes": [
            "bus",
            "metro",
            "rail",
            "walk",
        ],
    }
