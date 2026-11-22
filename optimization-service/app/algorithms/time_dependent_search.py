
import uuid
from typing import Any, Dict, List, Optional, Set, Tuple

from app.models.schemas import (
    JourneySearchRequest,
    JourneyAlternative,
    JourneyLeg,
    GeoPoint,
    IntermediateStop,
)
from app.algorithms.walking_connector import (
    haversine_distance_meters,
    calculate_walking_duration_seconds,
    create_walking_leg,
)
from app.algorithms.pareto_optimizer import rank_and_score_alternatives
from app.utils.time_utils import (
    time_str_to_seconds,
    seconds_to_time_str,
)


class TimeDependentRouter:
    """
    Time-dependent multimodal journey planner.

    Supports:
    - Direct walking
    - Direct bus and metro journeys
    - One-transfer multimodal journeys
    - Walking connections between stops
    - Departure-time-aware trip selection
    - Duplicate journey removal
    - Preference-based Pareto ranking
    """

    MAX_DIRECT_DEPARTURES = 15
    MAX_TRANSFER_DEPARTURES = 8
    MAX_ORIGIN_STOPS_FOR_TRANSFERS = 6
    MAX_TRANSFER_ALTERNATIVES = 30
    MAX_RESULTS = 8
    TRANSFER_BUFFER_SECONDS = 180

    def __init__(self, schedule_store):
        self.store = schedule_store

    def plan_journey(
        self,
        req: JourneySearchRequest,
    ) -> List[JourneyAlternative]:

        alternatives: List[JourneyAlternative] = []

        departure_seconds = time_str_to_seconds(req.departure_time)

        origin_lat = req.origin.lat
        origin_lon = req.origin.lon
        destination_lat = req.destination.lat
        destination_lon = req.destination.lon

        allowed_modes = {
            mode.lower()
            for mode in req.modes
            if mode
        }

        if not allowed_modes:
            return []

        direct_distance = haversine_distance_meters(
            origin_lat,
            origin_lon,
            destination_lat,
            destination_lon,
        )

        # ---------------------------------------------------------
        # 1. Direct walking journey
        # ---------------------------------------------------------

        if (
            "walk" in allowed_modes
            and direct_distance <= req.max_walking_distance_meters
        ):
            walking_duration = calculate_walking_duration_seconds(
                direct_distance
            )

            walking_leg = create_walking_leg(
                from_name=req.origin.name or "Origin",
                from_lat=origin_lat,
                from_lon=origin_lon,
                to_name=req.destination.name or "Destination",
                to_lat=destination_lat,
                to_lon=destination_lon,
                dep_time_str=req.departure_time,
            )

            alternatives.append(
                JourneyAlternative(
                    id=self._new_id("walk"),
                    total_duration_seconds=walking_duration,
                    departure_time=req.departure_time,
                    arrival_time=seconds_to_time_str(
                        departure_seconds + walking_duration
                    ),
                    walking_duration_seconds=walking_duration,
                    walking_distance_meters=int(direct_distance),
                    waiting_duration_seconds=0,
                    transfer_count=0,
                    modes_used=["walk"],
                    fare=0.0,
                    fare_currency="INR",
                    reliability_score=99.0,
                    legs=[walking_leg],
                    score=0.0,
                    pareto_optimal=True,
                    summary=f"Direct walk ({int(direct_distance)} m)",
                    co2_emissions_kg=0.0,
                    booking_available=False,
                )
            )

        # ---------------------------------------------------------
        # 2. Find nearby origin and destination stops
        # ---------------------------------------------------------

        transit_modes = [
            mode for mode in allowed_modes
            if mode != "walk"
        ]

        if not transit_modes:
            return rank_and_score_alternatives(
                alternatives,
                req.optimization_preference,
            )

        maximum_stop_distance = min(
            max(req.max_walking_distance_meters, 0),
            2500,
        )

        origin_stops = self.store.find_nearby_stops(
            origin_lat,
            origin_lon,
            max_dist=maximum_stop_distance,
            modes=transit_modes,
        )

        destination_stops = self.store.find_nearby_stops(
            destination_lat,
            destination_lon,
            max_dist=maximum_stop_distance,
            modes=transit_modes,
        )

        destination_stop_map = {
            stop["stop_id"]: stop
            for stop in destination_stops
        }

        if not origin_stops or not destination_stop_map:
            return rank_and_score_alternatives(
                self._deduplicate_alternatives(alternatives),
                req.optimization_preference,
            )

        # ---------------------------------------------------------
        # 3. Find direct transit journeys
        # ---------------------------------------------------------

        for origin_stop in origin_stops:

            walking_to_origin = origin_stop["distance_meters"]
            walking_to_origin_duration = origin_stop[
                "walk_duration_seconds"
            ]

            if walking_to_origin > req.max_walking_distance_meters:
                continue

            earliest_boarding = (
                departure_seconds + walking_to_origin_duration
            )

            departures = self.store.get_departures_from_stop(
                origin_stop["stop_id"],
                earliest_boarding,
                limit=self.MAX_DIRECT_DEPARTURES,
            )

            for departure in departures:

                trip = departure["trip"]
                boarding_stop_time = departure["stop_time"]

                trip_mode = trip.get("mode", "bus").lower()

                if trip_mode not in transit_modes:
                    continue

                downstream_stops = self.store.get_downstream_stop_times(
                    trip["trip_id"],
                    boarding_stop_time["stop_sequence"],
                )

                for destination_stop_time in downstream_stops:

                    destination_stop_id = destination_stop_time["stop_id"]

                    if destination_stop_id not in destination_stop_map:
                        continue

                    destination_stop = destination_stop_map[
                        destination_stop_id
                    ]

                    walking_from_destination = destination_stop[
                        "distance_meters"
                    ]

                    walking_from_destination_duration = destination_stop[
                        "walk_duration_seconds"
                    ]

                    total_walking_distance = (
                        walking_to_origin
                        + walking_from_destination
                    )

                    if total_walking_distance > req.max_walking_distance_meters:
                        continue

                    alternative = self._construct_direct_journey(
                        req=req,
                        origin_stop=origin_stop,
                        destination_stop=destination_stop,
                        trip=trip,
                        boarding_stop_time=boarding_stop_time,
                        destination_stop_time=destination_stop_time,
                        departure_seconds=departure_seconds,
                    )

                    if alternative:
                        alternatives.append(alternative)

        # ---------------------------------------------------------
        # 4. Find journeys requiring one transfer
        # ---------------------------------------------------------

        if req.max_transfers >= 1:

            transfer_alternatives = self._find_transfer_journeys(
                req=req,
                origin_stops=origin_stops,
                destination_stop_map=destination_stop_map,
                departure_seconds=departure_seconds,
                transit_modes=transit_modes,
            )

            alternatives.extend(transfer_alternatives)

        # ---------------------------------------------------------
        # 5. Remove duplicates and rank results
        # ---------------------------------------------------------

        unique_alternatives = self._deduplicate_alternatives(
            alternatives
        )

        ranked_alternatives = rank_and_score_alternatives(
            unique_alternatives,
            req.optimization_preference,
        )

        return self._select_diverse_alternatives(
            ranked_alternatives,
            self.MAX_RESULTS,
        )

    # =============================================================
    # DIRECT JOURNEY CONSTRUCTION
    # =============================================================

    def _construct_direct_journey(
        self,
        req: JourneySearchRequest,
        origin_stop: Dict[str, Any],
        destination_stop: Dict[str, Any],
        trip: Dict[str, Any],
        boarding_stop_time: Dict[str, Any],
        destination_stop_time: Dict[str, Any],
        departure_seconds: int,
    ) -> Optional[JourneyAlternative]:

        try:
            board_seconds = time_str_to_seconds(
                boarding_stop_time["departure_time"]
            )

            arrival_seconds = time_str_to_seconds(
                destination_stop_time["arrival_time"]
            )

            if arrival_seconds < board_seconds:
                return None

            walking_to_origin_duration = origin_stop[
                "walk_duration_seconds"
            ]

            walking_from_destination_duration = destination_stop[
                "walk_duration_seconds"
            ]

            earliest_boarding = (
                departure_seconds + walking_to_origin_duration
            )

            waiting_duration = max(
                0,
                board_seconds - earliest_boarding,
            )

            transit_duration = arrival_seconds - board_seconds

            final_arrival = (
                arrival_seconds + walking_from_destination_duration
            )

            total_duration = final_arrival - departure_seconds

            if total_duration < 0:
                return None

            route_id = trip["route_id"]

            route_info = self.store.routes.get(route_id, {})

            mode = trip.get("mode", "bus").lower()

            intermediate_stops = self.store.get_intermediate_stops(
                trip["trip_id"],
                boarding_stop_time["stop_sequence"],
                destination_stop_time["stop_sequence"],
            )

            fare = self.store.calculate_fare(
                mode,
                origin_stop,
                destination_stop,
                route_id,
            )

            transit_shape = self.store.get_transit_shape(
                origin_stop["lat"],
                origin_stop["lon"],
                destination_stop["lat"],
                destination_stop["lon"],
                intermediate_stops,
            )

            legs = []

            # Walk to boarding stop.
            legs.append(
                create_walking_leg(
                    from_name=req.origin.name or "Origin",
                    from_lat=req.origin.lat,
                    from_lon=req.origin.lon,
                    to_name=origin_stop["name"],
                    to_lat=origin_stop["lat"],
                    to_lon=origin_stop["lon"],
                    dep_time_str=req.departure_time,
                    to_stop_id=origin_stop["stop_id"],
                )
            )

            # Transit leg.
            legs.append(
                JourneyLeg(
                    leg_type="transit",
                    mode=mode,
                    provider_name=route_info.get(
                        "agency_name",
                        "Transit Provider",
                    ),
                    feed_key=origin_stop.get("feed_key"),
                    route_id=route_id,
                    route_short_name=route_info.get(
                        "route_short_name",
                        route_id,
                    ),
                    route_long_name=route_info.get(
                        "route_long_name",
                        "",
                    ),
                    trip_id=trip["trip_id"],
                    headsign=trip.get("trip_headsign", ""),
                    from_stop_id=origin_stop["stop_id"],
                    from_stop_name=origin_stop["name"],
                    from_coords=GeoPoint(
                        lat=origin_stop["lat"],
                        lon=origin_stop["lon"],
                        name=origin_stop["name"],
                    ),
                    to_stop_id=destination_stop["stop_id"],
                    to_stop_name=destination_stop["name"],
                    to_coords=GeoPoint(
                        lat=destination_stop["lat"],
                        lon=destination_stop["lon"],
                        name=destination_stop["name"],
                    ),
                    departure_time=boarding_stop_time[
                        "departure_time"
                    ][:5],
                    arrival_time=destination_stop_time[
                        "arrival_time"
                    ][:5],
                    duration_seconds=transit_duration,
                    distance_meters=int(
                        haversine_distance_meters(
                            origin_stop["lat"],
                            origin_stop["lon"],
                            destination_stop["lat"],
                            destination_stop["lon"],
                        )
                    ),
                    fare=round(float(fare), 2),
                    fare_currency="INR",
                    intermediate_stops=[
                        IntermediateStop(**stop)
                        for stop in intermediate_stops
                    ],
                    polyline=transit_shape,
                    instructions=(
                        f"Board {route_info.get('route_short_name', route_id)} "
                        f"towards {trip.get('trip_headsign', 'Destination')}"
                    ),
                )
            )

            # Walk from destination stop to final destination.
            legs.append(
                create_walking_leg(
                    from_name=destination_stop["name"],
                    from_lat=destination_stop["lat"],
                    from_lon=destination_stop["lon"],
                    to_name=req.destination.name or "Destination",
                    to_lat=req.destination.lat,
                    to_lon=req.destination.lon,
                    dep_time_str=destination_stop_time[
                        "arrival_time"
                    ][:5],
                )
            )

            route_name = route_info.get(
                "route_short_name",
                route_id,
            )

            return JourneyAlternative(
                id=self._new_id("direct"),
                total_duration_seconds=total_duration,
                departure_time=req.departure_time,
                arrival_time=seconds_to_time_str(final_arrival),
                walking_duration_seconds=(
                    walking_to_origin_duration
                    + walking_from_destination_duration
                ),
                walking_distance_meters=int(
                    origin_stop["distance_meters"]
                    + destination_stop["distance_meters"]
                ),
                waiting_duration_seconds=waiting_duration,
                transfer_count=0,
                modes_used=["walk", mode],
                fare=round(float(fare), 2),
                fare_currency="INR",
                reliability_score=94.0 if mode == "metro" else 88.0,
                legs=legs,
                score=0.0,
                pareto_optimal=True,
                summary=(
                    f"Direct {mode.capitalize()} "
                    f"({route_name}) to {destination_stop['name']}"
                ),
                co2_emissions_kg=round(
                    0.04 * (transit_duration / 60.0),
                    2,
                ),
                booking_available=False,
                booking_provider_id=origin_stop.get("feed_key"),
            )

        except (KeyError, TypeError, ValueError):
            return None

    # =============================================================
    # TRANSFER JOURNEY SEARCH
    # =============================================================

    def _find_transfer_journeys(
        self,
        req: JourneySearchRequest,
        origin_stops: List[Dict[str, Any]],
        destination_stop_map: Dict[str, Dict[str, Any]],
        departure_seconds: int,
        transit_modes: List[str],
    ) -> List[JourneyAlternative]:

        transfer_alternatives = []

        for origin_stop in origin_stops[
            :self.MAX_ORIGIN_STOPS_FOR_TRANSFERS
        ]:

            walking_to_origin = origin_stop["distance_meters"]
            walking_duration = origin_stop["walk_duration_seconds"]

            earliest_boarding = departure_seconds + walking_duration

            first_departures = self.store.get_departures_from_stop(
                origin_stop["stop_id"],
                earliest_boarding,
                limit=self.MAX_TRANSFER_DEPARTURES,
            )

            for first_item in first_departures:

                first_trip = first_item["trip"]
                first_boarding_time = first_item["stop_time"]

                first_mode = first_trip.get("mode", "bus").lower()

                if first_mode not in transit_modes:
                    continue

                first_downstream = self.store.get_downstream_stop_times(
                    first_trip["trip_id"],
                    first_boarding_time["stop_sequence"],
                )

                for first_alighting_time in first_downstream:

                    first_alighting_stop_id = first_alighting_time[
                        "stop_id"
                    ]

                    transfer_links = self.store.get_transfer_links(
                        first_alighting_stop_id
                    )

                    for transfer in transfer_links:

                        second_boarding_stop_id = transfer["to_stop_id"]

                        transfer_duration = max(
                            0,
                            int(transfer.get("time_sec", 0)),
                        )

                        first_arrival_seconds = time_str_to_seconds(
                            first_alighting_time["arrival_time"]
                        )

                        second_earliest_departure = (
                            first_arrival_seconds
                            + transfer_duration
                            + self.TRANSFER_BUFFER_SECONDS
                        )

                        second_departures = (
                            self.store.get_departures_from_stop(
                                second_boarding_stop_id,
                                second_earliest_departure,
                                limit=self.MAX_TRANSFER_DEPARTURES,
                            )
                        )

                        for second_item in second_departures:

                            second_trip = second_item["trip"]
                            second_boarding_time = second_item["stop_time"]

                            second_mode = second_trip.get(
                                "mode",
                                "bus",
                            ).lower()

                            if second_mode not in transit_modes:
                                continue

                            # Avoid taking the same trip twice.
                            if (
                                first_trip["trip_id"]
                                == second_trip["trip_id"]
                            ):
                                continue

                            second_downstream = (
                                self.store.get_downstream_stop_times(
                                    second_trip["trip_id"],
                                    second_boarding_time[
                                        "stop_sequence"
                                    ],
                                )
                            )

                            for second_alighting_time in second_downstream:

                                final_stop_id = second_alighting_time[
                                    "stop_id"
                                ]

                                if final_stop_id not in destination_stop_map:
                                    continue

                                final_destination_stop = (
                                    destination_stop_map[final_stop_id]
                                )

                                total_walking_distance = (
                                    origin_stop["distance_meters"]
                                    + transfer.get("distance", 0)
                                    + final_destination_stop[
                                        "distance_meters"
                                    ]
                                )

                                if (
                                    total_walking_distance
                                    > req.max_walking_distance_meters
                                ):
                                    continue

                                alternative = (
                                    self._construct_two_leg_journey(
                                        req=req,
                                        origin_stop=origin_stop,
                                        first_trip=first_trip,
                                        first_boarding_time=first_boarding_time,
                                        first_alighting_time=first_alighting_time,
                                        transfer=transfer,
                                        second_trip=second_trip,
                                        second_boarding_time=second_boarding_time,
                                        second_alighting_time=second_alighting_time,
                                        final_destination_stop=final_destination_stop,
                                        departure_seconds=departure_seconds,
                                    )
                                )

                                if alternative:
                                    transfer_alternatives.append(
                                        alternative
                                    )

                                if (
                                    len(transfer_alternatives)
                                    >= self.MAX_TRANSFER_ALTERNATIVES
                                ):
                                    return transfer_alternatives

        return transfer_alternatives

    # =============================================================
    # TWO-LEG JOURNEY CONSTRUCTION
    # =============================================================

    def _construct_two_leg_journey(
        self,
        req: JourneySearchRequest,
        origin_stop: Dict[str, Any],
        first_trip: Dict[str, Any],
        first_boarding_time: Dict[str, Any],
        first_alighting_time: Dict[str, Any],
        transfer: Dict[str, Any],
        second_trip: Dict[str, Any],
        second_boarding_time: Dict[str, Any],
        second_alighting_time: Dict[str, Any],
        final_destination_stop: Dict[str, Any],
        departure_seconds: int,
    ) -> Optional[JourneyAlternative]:

        try:
            first_route = self.store.routes.get(
                first_trip["route_id"],
                {},
            )

            second_route = self.store.routes.get(
                second_trip["route_id"],
                {},
            )

            first_alighting_stop = self.store.stops.get(
                first_alighting_time["stop_id"],
                {},
            )

            second_boarding_stop = self.store.stops.get(
                second_boarding_time["stop_id"],
                {},
            )

            if not first_alighting_stop or not second_boarding_stop:
                return None

            first_board_seconds = time_str_to_seconds(
                first_boarding_time["departure_time"]
            )

            first_alight_seconds = time_str_to_seconds(
                first_alighting_time["arrival_time"]
            )

            second_board_seconds = time_str_to_seconds(
                second_boarding_time["departure_time"]
            )

            second_alight_seconds = time_str_to_seconds(
                second_alighting_time["arrival_time"]
            )

            if (
                first_alight_seconds < first_board_seconds
                or second_alight_seconds < second_board_seconds
                or second_board_seconds < first_alight_seconds
            ):
                return None

            origin_walk_duration = origin_stop[
                "walk_duration_seconds"
            ]

            destination_walk_duration = final_destination_stop[
                "walk_duration_seconds"
            ]

            first_wait = max(
                0,
                first_board_seconds
                - (departure_seconds + origin_walk_duration),
            )

            transfer_walk_duration = max(
                0,
                int(transfer.get("time_sec", 0)),
            )

            transfer_wait = max(
                0,
                second_board_seconds
                - (
                    first_alight_seconds
                    + transfer_walk_duration
                ),
            )

            final_arrival_seconds = (
                second_alight_seconds
                + destination_walk_duration
            )

            total_duration = (
                final_arrival_seconds - departure_seconds
            )

            if total_duration <= 0:
                return None

            total_walking_distance = (
                origin_stop["distance_meters"]
                + transfer.get("distance", 0)
                + final_destination_stop["distance_meters"]
            )

            total_walking_duration = (
                origin_walk_duration
                + transfer_walk_duration
                + destination_walk_duration
            )

            first_mode = first_trip.get("mode", "bus").lower()
            second_mode = second_trip.get("mode", "metro").lower()

            first_fare = self.store.calculate_fare(
                first_mode,
                origin_stop,
                first_alighting_stop,
                first_trip["route_id"],
            )

            second_fare = self.store.calculate_fare(
                second_mode,
                second_boarding_stop,
                final_destination_stop,
                second_trip["route_id"],
            )

            first_intermediate_stops = (
                self.store.get_intermediate_stops(
                    first_trip["trip_id"],
                    first_boarding_time["stop_sequence"],
                    first_alighting_time["stop_sequence"],
                )
            )

            second_intermediate_stops = (
                self.store.get_intermediate_stops(
                    second_trip["trip_id"],
                    second_boarding_time["stop_sequence"],
                    second_alighting_time["stop_sequence"],
                )
            )

            first_polyline = self.store.get_transit_shape(
                origin_stop["lat"],
                origin_stop["lon"],
                first_alighting_stop["lat"],
                first_alighting_stop["lon"],
                first_intermediate_stops,
            )

            second_polyline = self.store.get_transit_shape(
                second_boarding_stop["lat"],
                second_boarding_stop["lon"],
                final_destination_stop["lat"],
                final_destination_stop["lon"],
                second_intermediate_stops,
            )

            legs = []

            # Leg 1: Walk from origin to first stop.
            legs.append(
                create_walking_leg(
                    from_name=req.origin.name or "Origin",
                    from_lat=req.origin.lat,
                    from_lon=req.origin.lon,
                    to_name=origin_stop["name"],
                    to_lat=origin_stop["lat"],
                    to_lon=origin_stop["lon"],
                    dep_time_str=req.departure_time,
                    to_stop_id=origin_stop["stop_id"],
                )
            )

            # Leg 2: First transit service.
            legs.append(
                self._create_transit_leg(
                    trip=first_trip,
                    route=first_route,
                    from_stop=origin_stop,
                    to_stop=first_alighting_stop,
                    boarding_time=first_boarding_time,
                    alighting_time=first_alighting_time,
                    intermediate_stops=first_intermediate_stops,
                    polyline=first_polyline,
                    fare=first_fare,
                    instruction=(
                        f"Take {first_route.get('route_short_name', first_trip['route_id'])} "
                        f"to {first_alighting_stop['name']}"
                    ),
                )
            )

            # Leg 3: Transfer connection.
            legs.append(
                create_walking_leg(
                    from_name=first_alighting_stop["name"],
                    from_lat=first_alighting_stop["lat"],
                    from_lon=first_alighting_stop["lon"],
                    to_name=second_boarding_stop["name"],
                    to_lat=second_boarding_stop["lat"],
                    to_lon=second_boarding_stop["lon"],
                    dep_time_str=first_alighting_time[
                        "arrival_time"
                    ][:5],
                    to_stop_id=second_boarding_stop["stop_id"],
                )
            )

            # Leg 4: Second transit service.
            legs.append(
                self._create_transit_leg(
                    trip=second_trip,
                    route=second_route,
                    from_stop=second_boarding_stop,
                    to_stop=final_destination_stop,
                    boarding_time=second_boarding_time,
                    alighting_time=second_alighting_time,
                    intermediate_stops=second_intermediate_stops,
                    polyline=second_polyline,
                    fare=second_fare,
                    instruction=(
                        f"Take {second_route.get('route_short_name', second_trip['route_id'])} "
                        f"towards {second_trip.get('trip_headsign', 'Destination')}"
                    ),
                )
            )

            # Leg 5: Walk to final destination.
            legs.append(
                create_walking_leg(
                    from_name=final_destination_stop["name"],
                    from_lat=final_destination_stop["lat"],
                    from_lon=final_destination_stop["lon"],
                    to_name=req.destination.name or "Destination",
                    to_lat=req.destination.lat,
                    to_lon=req.destination.lon,
                    dep_time_str=second_alighting_time[
                        "arrival_time"
                    ][:5],
                )
            )

            first_route_name = first_route.get(
                "route_short_name",
                first_trip["route_id"],
            )

            second_route_name = second_route.get(
                "route_short_name",
                second_trip["route_id"],
            )

            summary = (
                f"{first_mode.capitalize()} ({first_route_name}) + "
                f"{second_mode.capitalize()} ({second_route_name}) "
                f"via {first_alighting_stop['name']}"
            )

            return JourneyAlternative(
                id=self._new_id("transfer"),
                total_duration_seconds=total_duration,
                departure_time=req.departure_time,
                arrival_time=seconds_to_time_str(
                    final_arrival_seconds
                ),
                walking_duration_seconds=total_walking_duration,
                walking_distance_meters=int(
                    total_walking_distance
                ),
                waiting_duration_seconds=first_wait + transfer_wait,
                transfer_count=1,
                modes_used=list(
                    dict.fromkeys([
                        "walk",
                        first_mode,
                        second_mode,
                    ])
                ),
                fare=round(
                    float(first_fare) + float(second_fare),
                    2,
                ),
                fare_currency="INR",
                reliability_score=91.0,
                legs=legs,
                score=0.0,
                pareto_optimal=True,
                summary=summary,
                co2_emissions_kg=round(
                    0.035 * (total_duration / 60.0),
                    2,
                ),
                booking_available=False,
                booking_provider_id=origin_stop.get("feed_key"),
            )

        except (KeyError, TypeError, ValueError):
            return None

    # =============================================================
    # TRANSIT LEG FACTORY
    # =============================================================

    def _create_transit_leg(
        self,
        trip: Dict[str, Any],
        route: Dict[str, Any],
        from_stop: Dict[str, Any],
        to_stop: Dict[str, Any],
        boarding_time: Dict[str, Any],
        alighting_time: Dict[str, Any],
        intermediate_stops: List[Dict[str, Any]],
        polyline: List[List[float]],
        fare: float,
        instruction: str,
    ) -> JourneyLeg:

        mode = trip.get("mode", "bus").lower()

        start_seconds = time_str_to_seconds(
            boarding_time["departure_time"]
        )

        end_seconds = time_str_to_seconds(
            alighting_time["arrival_time"]
        )

        return JourneyLeg(
            leg_type="transit",
            mode=mode,
            provider_name=route.get(
                "agency_name",
                "Transit Provider",
            ),
            feed_key=from_stop.get("feed_key"),
            route_id=trip["route_id"],
            route_short_name=route.get(
                "route_short_name",
                trip["route_id"],
            ),
            route_long_name=route.get(
                "route_long_name",
                "",
            ),
            trip_id=trip["trip_id"],
            headsign=trip.get("trip_headsign", ""),
            from_stop_id=from_stop["stop_id"],
            from_stop_name=from_stop["name"],
            from_coords=GeoPoint(
                lat=from_stop["lat"],
                lon=from_stop["lon"],
                name=from_stop["name"],
            ),
            to_stop_id=to_stop["stop_id"],
            to_stop_name=to_stop["name"],
            to_coords=GeoPoint(
                lat=to_stop["lat"],
                lon=to_stop["lon"],
                name=to_stop["name"],
            ),
            departure_time=boarding_time["departure_time"][:5],
            arrival_time=alighting_time["arrival_time"][:5],
            duration_seconds=max(0, end_seconds - start_seconds),
            distance_meters=int(
                haversine_distance_meters(
                    from_stop["lat"],
                    from_stop["lon"],
                    to_stop["lat"],
                    to_stop["lon"],
                )
            ),
            fare=round(float(fare), 2),
            fare_currency="INR",
            intermediate_stops=[
                IntermediateStop(**stop)
                for stop in intermediate_stops
            ],
            polyline=polyline,
            instructions=instruction,
        )

    # =============================================================
    # DUPLICATE REMOVAL
    # =============================================================

    def _deduplicate_alternatives(
        self,
        alternatives: List[JourneyAlternative],
    ) -> List[JourneyAlternative]:

        unique = []
        seen: Set[Tuple[Any, ...]] = set()

        for alternative in alternatives:

            route_sequence = tuple(
                (
                    leg.mode,
                    leg.route_id,
                    leg.from_stop_id,
                    leg.to_stop_id,
                )
                for leg in alternative.legs
                if leg.leg_type == "transit"
            )

            key = (
                route_sequence,
                alternative.departure_time,
                alternative.arrival_time,
            )

            if key in seen:
                continue

            seen.add(key)
            unique.append(alternative)

        return unique

    # =============================================================
    # RESULT DIVERSITY
    # =============================================================

    def _select_diverse_alternatives(
        self,
        alternatives: List[JourneyAlternative],
        limit: int,
    ) -> List[JourneyAlternative]:

        selected = []
        selected_signatures = set()

        # First pass: prefer different route combinations.
        for alternative in alternatives:

            signature = tuple(
                leg.route_id
                for leg in alternative.legs
                if leg.leg_type == "transit"
            )

            if signature in selected_signatures:
                continue

            selected_signatures.add(signature)
            selected.append(alternative)

            if len(selected) >= limit:
                return selected

        # Second pass: fill remaining places with other valid
        # departure times and journey variations.
        selected_ids = {
            alternative.id
            for alternative in selected
        }

        for alternative in alternatives:

            if alternative.id in selected_ids:
                continue

            selected.append(alternative)

            if len(selected) >= limit:
                break

        return selected

    # =============================================================
    # ID GENERATOR
    # =============================================================

    @staticmethod
    def _new_id(prefix: str) -> str:
        return f"alt_{prefix}_{uuid.uuid4().hex[:8]}"
