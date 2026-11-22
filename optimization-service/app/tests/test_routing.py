
import pytest

from app.models.schemas import JourneySearchRequest, GeoPoint
from app.services.schedule_store import ScheduleStore
from app.algorithms.time_dependent_search import TimeDependentRouter
from app.algorithms.walking_connector import (
    haversine_distance_meters,
    calculate_walking_duration_seconds,
)
from app.algorithms.pareto_optimizer import find_pareto_frontier


@pytest.fixture
def store():
    return ScheduleStore()


@pytest.fixture
def router(store):
    return TimeDependentRouter(store)


def test_origin_equals_destination(router):
    req = JourneySearchRequest(
        origin=GeoPoint(
            lat=17.4435,
            lon=78.3582,
            name="Indira Nagar",
        ),
        destination=GeoPoint(
            lat=17.4435,
            lon=78.3582,
            name="Indira Nagar",
        ),
        departure_time="09:00",
        modes=["walk"],
    )

    alternatives = router.plan_journey(req)

    assert len(alternatives) >= 1
    assert alternatives[0].walking_distance_meters == 0
    assert alternatives[0].total_duration_seconds == 0


def test_direct_bus_journey(router):
    # From Indira Nagar to KPHB Colony.
    # Bus 195W directly connects these locations.

    req = JourneySearchRequest(
        origin=GeoPoint(
            lat=17.4435,
            lon=78.3582,
            name="Indira Nagar",
        ),
        destination=GeoPoint(
            lat=17.4968,
            lon=78.4005,
            name="KPHB Colony",
        ),
        departure_time="08:30",
        modes=["bus", "walk"],
        optimization_preference="fastest",
    )

    alternatives = router.plan_journey(req)

    assert len(alternatives) > 0

    direct = [
        alternative
        for alternative in alternatives
        if alternative.transfer_count == 0
        and "bus" in alternative.modes_used
    ]

    assert len(direct) > 0
    assert direct[0].legs[1].route_short_name == "195W"
    assert direct[0].fare > 0


def test_multimodal_bus_to_metro_journey(router):
    # From Indira Nagar to KPHB Colony using bus and metro.

    req = JourneySearchRequest(
        origin=GeoPoint(
            lat=17.4435,
            lon=78.3582,
            name="Indira Nagar",
        ),
        destination=GeoPoint(
            lat=17.4975,
            lon=78.4014,
            name="KPHB Colony Metro",
        ),
        departure_time="08:30",
        modes=["bus", "metro", "walk"],
        optimization_preference="balanced",
    )

    alternatives = router.plan_journey(req)

    assert len(alternatives) > 0

    has_multimodal = any(
        (
            "bus" in alternative.modes_used
            and "metro" in alternative.modes_used
        )
        or alternative.transfer_count >= 1
        for alternative in alternatives
    )

    assert has_multimodal


def test_pareto_ranking(router):
    req = JourneySearchRequest(
        origin=GeoPoint(
            lat=17.4435,
            lon=78.3582,
            name="Indira Nagar",
        ),
        destination=GeoPoint(
            lat=17.4968,
            lon=78.4005,
            name="KPHB Colony",
        ),
        departure_time="08:30",
        modes=["bus", "metro", "walk"],
    )

    alternatives = router.plan_journey(req)

    assert len(alternatives) > 0

    pareto_alternatives = [
        alternative
        for alternative in alternatives
        if alternative.pareto_optimal
    ]

    assert len(pareto_alternatives) > 0

    assert (
        alternatives[0].score <= alternatives[-1].score
        or alternatives[0].pareto_optimal
    )


def test_walking_distance_calculation():
    # Indira Nagar to Gachibowli ORR (approximately 480 meters).

    distance = haversine_distance_meters(
        17.4435,
        78.3582,
        17.4401,
        78.3615,
    )

    assert 400 < distance < 600

    duration = calculate_walking_duration_seconds(
        distance,
        1.25,
    )

    assert 300 < duration < 500
