
import os
from datetime import datetime
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.database import Database

from app.utils.time_utils import time_str_to_seconds


load_dotenv()

COLLECTIONS = {
    "feeds": "gtfsfeeds",
    "agencies": "gtfsagencies",
    "stops": "gtfsstops",
    "routes": "gtfsroutes",
    "trips": "gtfstrips",
    "stop_times": "gtfsstoptimes",
    "calendars": "gtfscalendars",
    "calendar_dates": "gtfscalendardates",
    "shapes": "gtfsshapepoints",
    "transfers": "gtfstransfers",
}


def _get_database(mongo_uri: str) -> Database:
    client = MongoClient(
        mongo_uri,
        serverSelectionTimeoutMS=10000,
        connectTimeoutMS=10000,
    )

    client.admin.command("ping")

    database = client.get_default_database()

    if database is None:
        database = client["transitchain"]

    return database


def _date_to_gtfs(value: str) -> str:
    return datetime.strptime(value, "%Y-%m-%d").strftime("%Y%m%d")


def _is_service_active(
    service_id: str,
    feed_key: str,
    feed_version: str,
    travel_date: str,
    calendars: List[Dict[str, Any]],
    calendar_dates: List[Dict[str, Any]],
) -> bool:

    date_obj = datetime.strptime(travel_date, "%Y-%m-%d")
    gtfs_date = _date_to_gtfs(travel_date)

    exception = next(
        (
            item
            for item in calendar_dates
            if item.get("serviceId") == service_id
            and item.get("feedKey") == feed_key
            and item.get("feedVersion") == feed_version
            and item.get("date") == gtfs_date
        ),
        None,
    )

    if exception:
        return int(exception.get("exceptionType", 0)) == 1

    weekday = date_obj.strftime("%A").lower()

    calendar = next(
        (
            item
            for item in calendars
            if item.get("serviceId") == service_id
            and item.get("feedKey") == feed_key
            and item.get("feedVersion") == feed_version
        ),
        None,
    )

    if not calendar:
        return False

    start_date = calendar.get("startDate", "")
    end_date = calendar.get("endDate", "")

    if not start_date or not end_date:
        return False

    if not start_date <= gtfs_date <= end_date:
        return False

    return int(calendar.get(weekday, 0)) == 1


def _route_mode(route_type: Any) -> str:
    try:
        route_type = int(route_type)
    except (TypeError, ValueError):
        return "bus"

    if route_type == 1:
        return "metro"

    if route_type in (0, 2, 3, 4, 5, 6, 7):
        return "bus"

    return "bus"


def _seconds(value: str) -> int:
    try:
        return time_str_to_seconds(value)
    except (TypeError, ValueError, IndexError):
        return 0


def load_gtfs_schedule(
    travel_date: str,
    mongo_uri: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Load active GTFS feeds from MongoDB and build an in-memory
    timetable structure for the requested travel date.

    MongoDB collection names and document fields match
    backend/models/Gtfs.js.
    """

    datetime.strptime(travel_date, "%Y-%m-%d")

    mongo_uri = (
        mongo_uri
        or os.getenv("MONGO_URI")
    )

    if not mongo_uri:
        raise ValueError(
            "MONGO_URI is missing from the environment."
        )

    database = _get_database(mongo_uri)

    active_feeds = list(
        database[COLLECTIONS["feeds"]].find({
            "status": "active",
            "isActive": True,
        })
    )

    result = {
        "stops": {},
        "routes": {},
        "trips": {},
        "stop_times": {},
        "stop_departures": {},
        "transfers": {},
        "shapes": {},
        "feed_keys": [],
        "travel_date": travel_date,
        "data_source": "mongodb_gtfs",
    }

    if not active_feeds:
        return result

    for feed in active_feeds:

        feed_key = feed.get("feedKey")
        feed_version = feed.get("feedVersion")

        if not feed_key or not feed_version:
            continue

        feed_filter = {
            "feedKey": feed_key,
            "feedVersion": feed_version,
        }

        calendars = list(
            database[COLLECTIONS["calendars"]].find(feed_filter)
        )

        calendar_dates = list(
            database[COLLECTIONS["calendar_dates"]].find(feed_filter)
        )

        agencies = list(
            database[COLLECTIONS["agencies"]].find(feed_filter)
        )

        agency_map = {
            agency.get("agencyId"): agency
            for agency in agencies
        }

        routes_raw = list(
            database[COLLECTIONS["routes"]].find(feed_filter)
        )

        routes_for_feed = {}

        for route in routes_raw:

            route_id = route.get("routeId")

            if not route_id:
                continue

            agency = agency_map.get(
                route.get("agencyId"),
                {},
            )

            routes_for_feed[route_id] = {
                "route_id": route_id,
                "feed_key": feed_key,
                "feed_version": feed_version,
                "agency_name": agency.get(
                    "agencyName",
                    feed.get("providerName", feed_key),
                ),
                "route_short_name": route.get(
                    "routeShortName",
                    route_id,
                ),
                "route_long_name": route.get(
                    "routeLongName",
                    "",
                ),
                "route_type": route.get("routeType", 3),
                "mode": _route_mode(route.get("routeType", 3)),
                "route_color": route.get("routeColor"),
                "route_text_color": route.get("routeTextColor"),
            }

            result["routes"][route_id] = routes_for_feed[route_id]

        stops_raw = list(
            database[COLLECTIONS["stops"]].find(feed_filter)
        )

        for stop in stops_raw:

            stop_id = stop.get("stopId")

            if not stop_id:
                continue

            try:
                latitude = float(stop["stopLat"])
                longitude = float(stop["stopLon"])
            except (KeyError, TypeError, ValueError):
                continue

            result["stops"][stop_id] = {
                "stop_id": stop_id,
                "name": stop.get("stopName", stop_id),
                "lat": latitude,
                "lon": longitude,
                "feed_key": feed_key,
                "feed_version": feed_version,
                "mode": "bus",
                "location_type": stop.get("locationType", 0),
                "zone_id": stop.get("zoneId"),
                "wheelchair_boarding": stop.get(
                    "wheelchairBoarding",
                    0,
                ),
            }

        trips_raw = list(
            database[COLLECTIONS["trips"]].find(feed_filter)
        )

        active_trips = {}

        for trip in trips_raw:

            trip_id = trip.get("tripId")
            route_id = trip.get("routeId")
            service_id = trip.get("serviceId")

            if not trip_id or not route_id or not service_id:
                continue

            if route_id not in routes_for_feed:
                continue

            if not _is_service_active(
                service_id,
                feed_key,
                feed_version,
                travel_date,
                calendars,
                calendar_dates,
            ):
                continue

            route = routes_for_feed[route_id]

            active_trip = {
                "trip_id": trip_id,
                "route_id": route_id,
                "service_id": service_id,
                "feed_key": feed_key,
                "feed_version": feed_version,
                "mode": route["mode"],
                "trip_headsign": trip.get("tripHeadsign", ""),
                "direction_id": trip.get("directionId", 0),
                "shape_id": trip.get("shapeId"),
            }

            active_trips[trip_id] = active_trip
            result["trips"][trip_id] = active_trip

        if not active_trips:
            result["feed_keys"].append(feed_key)
            continue

        stop_times_raw = list(
            database[COLLECTIONS["stop_times"]].find({
                **feed_filter,
                "tripId": {"$in": list(active_trips.keys())},
            }).sort([
                ("tripId", 1),
                ("stopSequence", 1),
            ])
        )

        for stop_time in stop_times_raw:

            trip_id = stop_time.get("tripId")
            stop_id = stop_time.get("stopId")

            if trip_id not in active_trips:
                continue

            if stop_id not in result["stops"]:
                continue

            arrival_time = stop_time.get("arrivalTime")
            departure_time = stop_time.get("departureTime")

            if not arrival_time or not departure_time:
                continue

            normalized = {
                "trip_id": trip_id,
                "stop_id": stop_id,
                "stop_sequence": int(
                    stop_time.get("stopSequence", 0)
                ),
                "arrival_time": arrival_time,
                "departure_time": departure_time,
                "pickup_type": stop_time.get("pickupType", 0),
                "drop_off_type": stop_time.get("dropOffType", 0),
            }

            result["stop_times"].setdefault(
                trip_id,
                [],
            ).append(normalized)

            result["stop_departures"].setdefault(
                stop_id,
                [],
            ).append({
                "trip": active_trips[trip_id],
                "stop_time": normalized,
            })

        for trip_id, stop_times in result["stop_times"].items():

            if trip_id not in active_trips:
                continue

            stop_times.sort(
                key=lambda item: item["stop_sequence"]
            )

        transfers_raw = list(
            database[COLLECTIONS["transfers"]].find(feed_filter)
        )

        for transfer in transfers_raw:

            from_stop = transfer.get("fromStopId")
            to_stop = transfer.get("toStopId")

            if (
                from_stop not in result["stops"]
                or to_stop not in result["stops"]
            ):
                continue

            transfer_item = {
                "from_stop_id": from_stop,
                "to_stop_id": to_stop,
                "time_sec": int(
                    transfer.get("minTransferTime", 180)
                ),
                "distance": 0,
                "transfer_type": transfer.get("transferType", 0),
                "cross_feed": transfer.get("isCrossFeed", False),
            }

            result["transfers"].setdefault(
                from_stop,
                [],
            ).append(transfer_item)

        shape_ids = [
            trip.get("shape_id")
            for trip in active_trips.values()
            if trip.get("shape_id")
        ]

        if shape_ids:
            shape_points = database[
                COLLECTIONS["shapes"]
            ].find({
                **feed_filter,
                "shapeId": {"$in": list(set(shape_ids))},
            }).sort([
                ("shapeId", 1),
                ("shapePtSequence", 1),
            ])

            for point in shape_points:

                shape_id = point.get("shapeId")

                result["shapes"].setdefault(
                    shape_id,
                    [],
                ).append([
                    float(point["shapePtLat"]),
                    float(point["shapePtLon"]),
                ])

        result["feed_keys"].append(feed_key)

    for stop_id in result["stop_departures"]:
        result["stop_departures"][stop_id].sort(
            key=lambda item: _seconds(
                item["stop_time"]["departure_time"]
            )
        )

    return result
