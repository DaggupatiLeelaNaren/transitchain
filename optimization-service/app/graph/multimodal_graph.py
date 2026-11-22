
import networkx as nx
from typing import Any, Dict, List, Optional

from app.algorithms.walking_connector import (
    haversine_distance_meters,
    calculate_walking_duration_seconds,
)


class MultimodalTransitGraph:
    """
    Directed multimodal transport graph containing bus stops,
    metro stations, and walking transfer connections.
    """

    def __init__(self):
        self.graph = nx.MultiDiGraph()

        self.stops: Dict[str, Dict[str, Any]] = {}
        self.routes: Dict[str, Dict[str, Any]] = {}
        self.trips: Dict[str, Dict[str, Any]] = {}
        self.transfers: List[Dict[str, Any]] = []

    def add_stop(
        self,
        stop_id: str,
        name: str,
        lat: float,
        lon: float,
        feed_key: str,
        mode: str,
    ) -> None:

        if not stop_id:
            raise ValueError("Stop ID cannot be empty.")

        if mode not in ("bus", "metro", "walk"):
            raise ValueError(f"Unsupported transport mode: {mode}")

        stop = {
            "stop_id": stop_id,
            "name": name,
            "lat": float(lat),
            "lon": float(lon),
            "feed_key": feed_key,
            "mode": mode,
        }

        self.stops[stop_id] = stop
        self.graph.add_node(stop_id, **stop)

    def add_route(
        self,
        route_id: str,
        route_data: Dict[str, Any],
    ) -> None:

        self.routes[route_id] = {
            "route_id": route_id,
            **route_data,
        }

    def add_trip(
        self,
        trip_id: str,
        trip_data: Dict[str, Any],
    ) -> None:

        self.trips[trip_id] = {
            "trip_id": trip_id,
            **trip_data,
        }

    def add_transfer(
        self,
        from_stop_id: str,
        to_stop_id: str,
        min_transfer_time_sec: int,
        dist_meters: float,
        cross_feed: bool = False,
    ) -> None:

        if from_stop_id not in self.stops:
            raise ValueError(f"Unknown stop: {from_stop_id}")

        if to_stop_id not in self.stops:
            raise ValueError(f"Unknown stop: {to_stop_id}")

        if min_transfer_time_sec < 0 or dist_meters < 0:
            raise ValueError("Transfer time and distance cannot be negative.")

        transfer = {
            "from_stop_id": from_stop_id,
            "to_stop_id": to_stop_id,
            "time_sec": int(min_transfer_time_sec),
            "distance": float(dist_meters),
            "cross_feed": cross_feed,
        }

        self.transfers.append(transfer)

        self.graph.add_edge(
            from_stop_id,
            to_stop_id,
            key=f"transfer_{from_stop_id}_{to_stop_id}",
            edge_type="transfer",
            duration=int(min_transfer_time_sec),
            distance=float(dist_meters),
            cross_feed=cross_feed,
        )

    def find_nearby_stops(
        self,
        lat: float,
        lon: float,
        max_dist_meters: float = 2000,
        modes: Optional[List[str]] = None,
    ) -> List[Dict[str, Any]]:

        results = []

        allowed_modes = (
            {mode.lower() for mode in modes}
            if modes
            else None
        )

        for stop in self.stops.values():

            if (
                allowed_modes
                and stop["mode"].lower() not in allowed_modes
            ):
                continue

            distance = haversine_distance_meters(
                lat,
                lon,
                stop["lat"],
                stop["lon"],
            )

            if distance <= max_dist_meters:
                results.append({
                    **stop,
                    "distance_meters": distance,
                    "walk_duration_seconds": (
                        calculate_walking_duration_seconds(distance)
                    ),
                })

        return sorted(
            results,
            key=lambda item: item["distance_meters"],
        )

    def build_walking_transfers(
        self,
        max_transfer_dist: float = 600.0,
        minimum_transfer_buffer: int = 120,
    ) -> int:
        """
        Connect nearby stops in both directions.

        Returns the number of directed transfer edges created.
        """

        stop_list = list(self.stops.values())
        created = 0

        for index, stop_a in enumerate(stop_list):

            for stop_b in stop_list[index + 1:]:

                distance = haversine_distance_meters(
                    stop_a["lat"],
                    stop_a["lon"],
                    stop_b["lat"],
                    stop_b["lon"],
                )

                if distance > max_transfer_dist:
                    continue

                walking_time = calculate_walking_duration_seconds(
                    distance
                )

                cross_feed = (
                    stop_a["feed_key"] != stop_b["feed_key"]
                )

                transfer_time = (
                    walking_time + minimum_transfer_buffer
                )

                self.add_transfer(
                    stop_a["stop_id"],
                    stop_b["stop_id"],
                    transfer_time,
                    distance,
                    cross_feed,
                )

                self.add_transfer(
                    stop_b["stop_id"],
                    stop_a["stop_id"],
                    transfer_time,
                    distance,
                    cross_feed,
                )

                created += 2

        return created

    def get_transfer_links(
        self,
        stop_id: str,
    ) -> List[Dict[str, Any]]:

        return [
            transfer
            for transfer in self.transfers
            if transfer["from_stop_id"] == stop_id
        ]

    def get_interchange_stops(self) -> List[str]:
        """Return stops connected to more than one transport feed."""

        interchange_stops = []

        for stop_id in self.stops:

            connected_feeds = {
                self.stops[transfer["to_stop_id"]]["feed_key"]
                for transfer in self.get_transfer_links(stop_id)
            }

            if len(connected_feeds) > 0:
                interchange_stops.append(stop_id)

        return interchange_stops

    def get_graph_statistics(self) -> Dict[str, int]:

        return {
            "nodes": self.graph.number_of_nodes(),
            "edges": self.graph.number_of_edges(),
            "stops": len(self.stops),
            "routes": len(self.routes),
            "trips": len(self.trips),
            "transfers": len(self.transfers),
        }
