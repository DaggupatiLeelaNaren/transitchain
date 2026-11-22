
import math
from typing import List, Optional

from app.models.schemas import GeoPoint, JourneyLeg
from app.utils.time_utils import add_seconds_to_time_str


EARTH_RADIUS_METERS = 6_371_000.0
DEFAULT_WALKING_SPEED_MPS = 1.25


def haversine_distance_meters(
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float,
) -> float:
    """Calculate the great-circle distance between two coordinates."""

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)

    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1)
        * math.cos(phi2)
        * math.sin(delta_lambda / 2.0) ** 2
    )

    a = max(0.0, min(1.0, a))

    c = 2.0 * math.atan2(
        math.sqrt(a),
        math.sqrt(1.0 - a),
    )

    return EARTH_RADIUS_METERS * c


def calculate_walking_duration_seconds(
    distance_meters: float,
    speed_mps: float = DEFAULT_WALKING_SPEED_MPS,
) -> int:
    """Estimate walking time using distance and walking speed."""

    if distance_meters <= 0:
        return 0

    if speed_mps <= 0:
        raise ValueError("Walking speed must be greater than zero.")

    return max(
        30,
        math.ceil(distance_meters / speed_mps),
    )


def generate_walking_polyline(
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float,
    num_steps: int = 5,
) -> List[List[float]]:
    """
    Generate an approximate straight-line polyline.

    This is a map-rendering approximation, not actual street routing.
    """

    if num_steps < 1:
        num_steps = 1

    points = []

    for index in range(num_steps + 1):
        fraction = index / float(num_steps)

        latitude = lat1 + fraction * (lat2 - lat1)
        longitude = lon1 + fraction * (lon2 - lon1)

        points.append([
            round(latitude, 6),
            round(longitude, 6),
        ])

    return points


def create_walking_leg(
    from_name: str,
    from_lat: float,
    from_lon: float,
    to_name: str,
    to_lat: float,
    to_lon: float,
    dep_time_str: str,
    walk_speed: float = DEFAULT_WALKING_SPEED_MPS,
    to_stop_id: Optional[str] = None,
) -> JourneyLeg:
    """Create a complete walking leg between two locations."""

    distance = haversine_distance_meters(
        from_lat,
        from_lon,
        to_lat,
        to_lon,
    )

    duration = calculate_walking_duration_seconds(
        distance,
        walk_speed,
    )

    arrival_time = add_seconds_to_time_str(
        dep_time_str,
        duration,
    )

    polyline = generate_walking_polyline(
        from_lat,
        from_lon,
        to_lat,
        to_lon,
    )

    return JourneyLeg(
        leg_type="walk",
        mode="walk",
        from_stop_name=from_name,
        from_coords=GeoPoint(
            lat=from_lat,
            lon=from_lon,
            name=from_name,
        ),
        to_stop_id=to_stop_id,
        to_stop_name=to_name,
        to_coords=GeoPoint(
            lat=to_lat,
            lon=to_lon,
            name=to_name,
        ),
        departure_time=dep_time_str,
        arrival_time=arrival_time,
        duration_seconds=duration,
        distance_meters=int(round(distance)),
        fare=0.0,
        fare_currency="INR",
        intermediate_stops=[],
        polyline=polyline,
        instructions=(
            f"Walk {int(round(distance))} m "
            f"({duration // 60} min) to {to_name}"
        ),
    )
