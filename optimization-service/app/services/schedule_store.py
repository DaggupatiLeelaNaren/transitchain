from typing import Dict, List, Any, Optional

from app.algorithms.walking_connector import (
    haversine_distance_meters,
    calculate_walking_duration_seconds,
    generate_walking_polyline,
)
from app.utils.time_utils import (
    time_str_to_seconds,
    seconds_to_time_str,
)


class ScheduleStore:
    """
    In-memory GTFS timetable index.

    Uses MongoDB GTFS data for the requested travel date.
    Falls back to the existing Hyderabad development timetable
    when no usable MongoDB timetable is available.
    """

    def __init__(self, travel_date: Optional[str] = None):
        self.stops: Dict[str, Dict[str, Any]] = {}
        self.routes: Dict[str, Dict[str, Any]] = {}
        self.trips: Dict[str, Dict[str, Any]] = {}
        self.stop_times: Dict[str, List[Dict[str, Any]]] = {}
        self.stop_departures: Dict[str, List[Dict[str, Any]]] = {}
        self.transfers: Dict[str, List[Dict[str, Any]]] = {}

        self.data_source = "development_sample"
        self.travel_date = travel_date

        if travel_date:
            self._load_date_specific_gtfs(travel_date)

        if not self.trips:
            self._populate_hyderabad_data()
            self.data_source = "development_sample"

    def _load_date_specific_gtfs(self, travel_date: str) -> bool:
        try:
            from app.gtfs.mongo_loader import load_gtfs_schedule

            data = load_gtfs_schedule(travel_date)

            if not data:
                return False

            required = (
                "stops",
                "routes",
                "trips",
                "stop_times",
                "stop_departures",
                "transfers",
            )

            if any(key not in data for key in required):
                return False

            if not data["stops"] or not data["trips"]:
                return False

            self.stops = data["stops"]
            self.routes = data["routes"]
            self.trips = data["trips"]
            self.stop_times = data["stop_times"]
            self.stop_departures = data["stop_departures"]
            self.transfers = data["transfers"]

            self.data_source = "mongodb_gtfs"

            return True

        except Exception as error:
            print(f"[GTFS] MongoDB loading failed: {error}")
            return False

    def _populate_hyderabad_data(self):
        """Populate the existing Hyderabad development timetable."""

        raw_stops = [
            ("hmrl_raidurg", "Raidurg Metro Station", 17.4374, 78.3798, "hmrl", "metro"),
            ("hmrl_hiteccity", "Hitec City Metro Station", 17.4474, 78.3768, "hmrl", "metro"),
            ("hmrl_durgam", "Durgam Cheruvu Metro Station", 17.4428, 78.3871, "hmrl", "metro"),
            ("hmrl_madhapur", "Madhapur Metro Station", 17.4389, 78.3970, "hmrl", "metro"),
            ("hmrl_peddamma", "Peddamma Gudi Metro Station", 17.4332, 78.4069, "hmrl", "metro"),
            ("hmrl_jubilee", "Jubilee Hills Check Post Metro", 17.4287, 78.4162, "hmrl", "metro"),
            ("hmrl_ameerpet_b", "Ameerpet Metro Station (Blue)", 17.4344, 78.4482, "hmrl", "metro"),
            ("hmrl_begumpet", "Begumpet Metro Station", 17.4428, 78.4682, "hmrl", "metro"),
            ("hmrl_secunderabad", "Secunderabad East Metro Station", 17.4399, 78.5032, "hmrl", "metro"),
            ("hmrl_miyapur", "Miyapur Metro Station", 17.4968, 78.3614, "hmrl", "metro"),
            ("hmrl_jntu", "JNTU College Metro Station", 17.5025, 78.3921, "hmrl", "metro"),
            ("hmrl_kphb", "KPHB Colony Metro Station", 17.4975, 78.4014, "hmrl", "metro"),
            ("hmrl_kukatpally", "Kukatpally Metro Station", 17.4931, 78.4071, "hmrl", "metro"),
            ("hmrl_balanagar", "Balanagar Metro Station", 17.4832, 78.4132, "hmrl", "metro"),
            ("hmrl_moosapet", "Moosapet Metro Station", 17.4748, 78.4182, "hmrl", "metro"),
            ("hmrl_bharatnagar", "Bharat Nagar Metro Station", 17.4665, 78.4241, "hmrl", "metro"),
            ("hmrl_erragadda", "Erragadda Metro Station", 17.4578, 78.4312, "hmrl", "metro"),
            ("hmrl_esi", "ESI Hospital Metro Station", 17.4491, 78.4385, "hmrl", "metro"),
            ("hmrl_srnagar", "SR Nagar Metro Station", 17.4419, 78.4441, "hmrl", "metro"),
            ("hmrl_ameerpet_r", "Ameerpet Metro Station (Red)", 17.4344, 78.4482, "hmrl", "metro"),
            ("hmrl_punjagutta", "Punjagutta Metro Station", 17.4281, 78.4521, "hmrl", "metro"),
            ("hmrl_mgbs", "MGBS Metro Station", 17.3785, 78.4820, "hmrl", "metro"),
            ("tgsrtc_indiranagar", "Indira Nagar - Gachibowli Bus Stop", 17.4435, 78.3582, "tgsrtc", "bus"),
            ("tgsrtc_gachibowli_orr", "Gachibowli ORR Junction Bus Stop", 17.4401, 78.3615, "tgsrtc", "bus"),
            ("tgsrtc_biodiversity", "Biodiversity Park Bus Stop", 17.4385, 78.3789, "tgsrtc", "bus"),
            ("tgsrtc_raidurg_bus", "Raidurg Bus Stop", 17.4362, 78.3772, "tgsrtc", "bus"),
            ("tgsrtc_cybertowers", "Cyber Towers Bus Stop", 17.4510, 78.3810, "tgsrtc", "bus"),
            ("tgsrtc_kondapur", "Kondapur X Roads Bus Stop", 17.4612, 78.3621, "tgsrtc", "bus"),
            ("tgsrtc_allwyn", "Allwyn X Roads Bus Stop", 17.4925, 78.3582, "tgsrtc", "bus"),
            ("tgsrtc_kphb_bus", "KPHB Colony Bus Stop", 17.4968, 78.4005, "tgsrtc", "bus"),
            ("tgsrtc_jntu_bus", "JNTU Bus Stop", 17.5020, 78.3910, "tgsrtc", "bus"),
            ("tgsrtc_ameerpet_bus", "Ameerpet Bus Stop", 17.4355, 78.4490, "tgsrtc", "bus"),
            ("tgsrtc_secunderabad_bus", "Secunderabad Station Bus Stop", 17.4345, 78.5012, "tgsrtc", "bus"),
            ("tgsrtc_koti", "Koti Bus Stand", 17.3820, 78.4862, "tgsrtc", "bus"),
            ("tgsrtc_mehdipatnam", "Mehdipatnam Bus Stop", 17.3916, 78.4402, "tgsrtc", "bus"),
        ]

        for sid, name, lat, lon, feed_key, mode in raw_stops:
            self.stops[sid] = {
                "stop_id": sid,
                "name": name,
                "lat": lat,
                "lon": lon,
                "feed_key": feed_key,
                "mode": mode,
            }
            self.stop_departures[sid] = []
            self.transfers[sid] = []

        raw_transfers = [
            ("tgsrtc_raidurg_bus", "hmrl_raidurg", 150, 130.0, True),
            ("hmrl_raidurg", "tgsrtc_raidurg_bus", 150, 130.0, True),
            ("hmrl_ameerpet_b", "hmrl_ameerpet_r", 90, 50.0, False),
            ("hmrl_ameerpet_r", "hmrl_ameerpet_b", 90, 50.0, False),
            ("tgsrtc_ameerpet_bus", "hmrl_ameerpet_b", 160, 140.0, True),
            ("hmrl_ameerpet_b", "tgsrtc_ameerpet_bus", 160, 140.0, True),
            ("tgsrtc_kphb_bus", "hmrl_kphb", 90, 70.0, True),
            ("hmrl_kphb", "tgsrtc_kphb_bus", 90, 70.0, True),
            ("tgsrtc_secunderabad_bus", "hmrl_secunderabad", 220, 200.0, True),
            ("hmrl_secunderabad", "tgsrtc_secunderabad_bus", 220, 200.0, True),
            ("tgsrtc_biodiversity", "hmrl_raidurg", 280, 250.0, True),
            ("hmrl_raidurg", "tgsrtc_biodiversity", 280, 250.0, True),
            ("tgsrtc_gachibowli_orr", "tgsrtc_indiranagar", 300, 320.0, False),
            ("tgsrtc_indiranagar", "tgsrtc_gachibowli_orr", 300, 320.0, False),
        ]

        for s1, s2, sec, dist, cross in raw_transfers:
            if s1 in self.transfers and s2 in self.stops:
                self.transfers[s1].append({
                    "to_stop_id": s2,
                    "time_sec": sec,
                    "distance": dist,
                    "cross_feed": cross,
                })

        self.routes = {
            "bus_195w": {
                "route_id": "bus_195w",
                "agency_name": "TGSRTC",
                "route_short_name": "195W",
                "route_long_name": "Waverock / Indira Nagar to JNTU via KPHB",
                "mode": "bus",
                "feed_key": "tgsrtc",
            },
            "bus_113": {
                "route_id": "bus_113",
                "agency_name": "TGSRTC Feeder",
                "route_short_name": "113F",
                "route_long_name": "Indira Nagar to Raidurg Metro Feeder",
                "mode": "bus",
                "feed_key": "tgsrtc",
            },
            "bus_216": {
                "route_id": "bus_216",
                "agency_name": "TGSRTC",
                "route_short_name": "216",
                "route_long_name": "Mehdipatnam to KPHB Colony via Kondapur",
                "mode": "bus",
                "feed_key": "tgsrtc",
            },
            "bus_10h": {
                "route_id": "bus_10h",
                "agency_name": "TGSRTC",
                "route_short_name": "10H",
                "route_long_name": "Secunderabad to KPHB Colony via Ameerpet",
                "mode": "bus",
                "feed_key": "tgsrtc",
            },
            "metro_blue": {
                "route_id": "metro_blue",
                "agency_name": "Hyderabad Metro Rail",
                "route_short_name": "Blue Line",
                "route_long_name": "Raidurg to Nagole via Ameerpet",
                "mode": "metro",
                "feed_key": "hmrl",
            },
            "metro_red": {
                "route_id": "metro_red",
                "agency_name": "Hyderabad Metro Rail",
                "route_short_name": "Red Line",
                "route_long_name": "Miyapur to LB Nagar via KPHB and Ameerpet",
                "mode": "metro",
                "feed_key": "hmrl",
            },
        }

        self._generate_bus_195w_trips()
        self._generate_feeder_113_trips()
        self._generate_metro_blue_trips()
        self._generate_metro_red_trips()

    def _add_generated_trip(self, trip_id, route_id, mode, headsign, stops_seq, start_min, interval):
        self.trips[trip_id] = {
            "trip_id": trip_id,
            "route_id": route_id,
            "mode": mode,
            "trip_headsign": headsign,
        }

        st_list = []

        for seq, (stop_id, offset) in enumerate(stops_seq, start=1):
            current_minute = start_min + offset
            arrival = f"{current_minute // 60:02d}:{current_minute % 60:02d}:00"
            departure = f"{current_minute // 60:02d}:{current_minute % 60:02d}:30"

            stop_time = {
                "trip_id": trip_id,
                "stop_id": stop_id,
                "stop_sequence": seq,
                "arrival_time": arrival,
                "departure_time": departure,
            }

            st_list.append(stop_time)

            self.stop_departures.setdefault(stop_id, []).append({
                "trip": self.trips[trip_id],
                "stop_time": stop_time,
            })

        self.stop_times[trip_id] = st_list

    def _generate_bus_195w_trips(self):
        stops_seq = [
            ("tgsrtc_indiranagar", 0),
            ("tgsrtc_gachibowli_orr", 3),
            ("tgsrtc_biodiversity", 7),
            ("tgsrtc_raidurg_bus", 12),
            ("tgsrtc_cybertowers", 18),
            ("tgsrtc_kphb_bus", 32),
            ("tgsrtc_jntu_bus", 38),
        ]

        for trip_idx, start_min in enumerate(range(360, 1380, 12)):
            self._add_generated_trip(
                f"trip_195w_{trip_idx}",
                "bus_195w",
                "bus",
                "KPHB / JNTU",
                stops_seq,
                start_min,
                12,
            )

    def _generate_feeder_113_trips(self):
        stops_seq = [
            ("tgsrtc_indiranagar", 0),
            ("tgsrtc_gachibowli_orr", 5),
            ("tgsrtc_raidurg_bus", 12),
        ]

        for trip_idx, start_min in enumerate(range(360, 1380, 15)):
            self._add_generated_trip(
                f"trip_113f_{trip_idx}",
                "bus_113",
                "bus",
                "Raidurg Metro",
                stops_seq,
                start_min,
                15,
            )

    def _generate_metro_blue_trips(self):
        stops_seq = [
            ("hmrl_raidurg", 0),
            ("hmrl_hiteccity", 3),
            ("hmrl_durgam", 6),
            ("hmrl_madhapur", 9),
            ("hmrl_peddamma", 12),
            ("hmrl_jubilee", 15),
            ("hmrl_ameerpet_b", 23),
            ("hmrl_begumpet", 27),
            ("hmrl_secunderabad", 35),
        ]

        for trip_idx, start_min in enumerate(range(360, 1380, 8)):
            self._add_generated_trip(
                f"trip_blue_{trip_idx}",
                "metro_blue",
                "metro",
                "Secunderabad",
                stops_seq,
                start_min,
                8,
            )

    def _generate_metro_red_trips(self):
        stops_seq = [
            ("hmrl_miyapur", 0),
            ("hmrl_jntu", 5),
            ("hmrl_kphb", 8),
            ("hmrl_kukatpally", 11),
            ("hmrl_balanagar", 15),
            ("hmrl_moosapet", 18),
            ("hmrl_bharatnagar", 21),
            ("hmrl_erragadda", 24),
            ("hmrl_esi", 27),
            ("hmrl_srnagar", 30),
            ("hmrl_ameerpet_r", 33),
            ("hmrl_punjagutta", 36),
            ("hmrl_mgbs", 45),
        ]

        for trip_idx, start_min in enumerate(range(360, 1380, 8)):
            self._add_generated_trip(
                f"trip_red_{trip_idx}",
                "metro_red",
                "metro",
                "Miyapur via KPHB",
                stops_seq,
                start_min,
                8,
            )

    def find_nearby_stops(
        self,
        lat: float,
        lon: float,
        max_dist: float = 2000,
        modes: Optional[List[str]] = None,
    ) -> List[Dict[str, Any]]:
        results = []

        for stop_id, stop in self.stops.items():
            if modes and stop.get("mode") not in modes:
                continue

            distance = haversine_distance_meters(
                lat,
                lon,
                stop["lat"],
                stop["lon"],
            )

            if distance <= max_dist:
                results.append({
                    **stop,
                    "distance_meters": distance,
                    "walk_duration_seconds": calculate_walking_duration_seconds(
                        distance
                    ),
                })

        results.sort(key=lambda item: item["distance_meters"])
        return results

    def get_departures_from_stop(
        self,
        stop_id: str,
        after_sec: int,
        limit: int = 10,
    ) -> List[Dict[str, Any]]:
        departures = self.stop_departures.get(stop_id, [])
        valid = []

        for departure in departures:
            departure_seconds = time_str_to_seconds(
                departure["stop_time"]["departure_time"]
            )

            if departure_seconds >= after_sec:
                valid.append((departure_seconds, departure))

        valid.sort(key=lambda item: item[0])
        return [item[1] for item in valid[:limit]]

    def get_downstream_stop_times(
        self,
        trip_id: str,
        from_sequence: int,
    ) -> List[Dict[str, Any]]:
        stop_times = self.stop_times.get(trip_id, [])

        return [
            stop_time
            for stop_time in stop_times
            if stop_time["stop_sequence"] > from_sequence
        ]

    def get_intermediate_stops(
        self,
        trip_id: str,
        from_seq: int,
        to_seq: int,
    ) -> List[Dict[str, Any]]:
        stop_times = self.stop_times.get(trip_id, [])
        intermediate = []

        for stop_time in stop_times:
            sequence = stop_time["stop_sequence"]

            if from_seq < sequence < to_seq:
                stop_info = self.stops.get(
                    stop_time["stop_id"],
                    {},
                )

                intermediate.append({
                    "stop_id": stop_time["stop_id"],
                    "stop_name": stop_info.get(
                        "name",
                        stop_time["stop_id"],
                    ),
                    "lat": stop_info.get("lat", 0.0),
                    "lon": stop_info.get("lon", 0.0),
                    "arrival_time": stop_time["arrival_time"][:5],
                    "departure_time": stop_time["departure_time"][:5],
                })

        return intermediate

    def get_transfer_links(self, stop_id: str) -> List[Dict[str, Any]]:
        return self.transfers.get(stop_id, [])

    def get_interchange_stops(self) -> List[str]:
        return [
            stop_id
            for stop_id, links in self.transfers.items()
            if links
        ]

    def calculate_fare(
        self,
        mode: str,
        from_stop: Dict[str, Any],
        to_stop: Dict[str, Any],
        route_id: str,
    ) -> float:
        distance_km = (
            haversine_distance_meters(
                from_stop["lat"],
                from_stop["lon"],
                to_stop["lat"],
                to_stop["lon"],
            ) / 1000.0
        )

        if mode == "metro":
            if distance_km <= 2:
                return 20.0
            if distance_km <= 4:
                return 30.0
            if distance_km <= 6:
                return 40.0
            if distance_km <= 10:
                return 50.0
            return 60.0

        if distance_km <= 3:
            return 15.0
        if distance_km <= 8:
            return 25.0
        if distance_km <= 15:
            return 35.0

        return 45.0

    def get_transit_shape(
        self,
        lat1: float,
        lon1: float,
        lat2: float,
        lon2: float,
        inter_stops: List[Dict[str, Any]],
    ) -> List[List[float]]:
        coordinates = [[lat1, lon1]]

        for stop in inter_stops:
            coordinates.append([
                stop["lat"],
                stop["lon"],
            ])

        coordinates.append([lat2, lon2])

        return coordinates


# Default timetable used by existing endpoints.
global_schedule_store = ScheduleStore()