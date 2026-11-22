
from datetime import datetime
from typing import Union


def time_str_to_seconds(time_str: str) -> int:
    """
    Convert HH:MM or HH:MM:SS into seconds.

    Supports GTFS times beyond midnight, such as:
    25:30:00 = 1:30 AM on the following day.
    """

    if not isinstance(time_str, str):
        raise TypeError("Time must be a string.")

    value = time_str.strip()

    if not value:
        raise ValueError("Time cannot be empty.")

    parts = value.split(":")

    if len(parts) not in (2, 3):
        raise ValueError(
            "Invalid time format. Expected HH:MM or HH:MM:SS."
        )

    try:
        hours = int(parts[0])
        minutes = int(parts[1])
        seconds = int(parts[2]) if len(parts) == 3 else 0
    except ValueError as exc:
        raise ValueError("Time must contain numeric values.") from exc

    if hours < 0:
        raise ValueError("Hours cannot be negative.")

    if not 0 <= minutes <= 59:
        raise ValueError("Minutes must be between 0 and 59.")

    if not 0 <= seconds <= 59:
        raise ValueError("Seconds must be between 0 and 59.")

    return hours * 3600 + minutes * 60 + seconds


def seconds_to_time_str(
    total_seconds: Union[int, float],
    include_seconds: bool = False,
) -> str:
    """
    Convert seconds into HH:MM or HH:MM:SS.

    GTFS hours greater than 24 are preserved.
    """

    if not isinstance(total_seconds, (int, float)):
        raise TypeError("Total seconds must be numeric.")

    total_seconds = int(total_seconds)

    if total_seconds < 0:
        raise ValueError("Total seconds cannot be negative.")

    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    seconds = total_seconds % 60

    if include_seconds:
        return f"{hours:02d}:{minutes:02d}:{seconds:02d}"

    return f"{hours:02d}:{minutes:02d}"


def add_seconds_to_time_str(
    time_str: str,
    seconds_to_add: int,
    include_seconds: bool = False,
) -> str:
    """Add a duration to a time string."""

    if not isinstance(seconds_to_add, (int, float)):
        raise TypeError("Seconds to add must be numeric.")

    initial_seconds = time_str_to_seconds(time_str)

    result_seconds = initial_seconds + int(seconds_to_add)

    if result_seconds < 0:
        raise ValueError("Resulting time cannot be negative.")

    return seconds_to_time_str(
        result_seconds,
        include_seconds=include_seconds,
    )


def format_duration(seconds: int) -> str:
    """Format seconds into a readable duration."""

    if not isinstance(seconds, (int, float)):
        raise TypeError("Duration must be numeric.")

    seconds = max(0, int(seconds))

    total_minutes = seconds // 60

    if total_minutes < 60:
        return f"{total_minutes} min"

    hours = total_minutes // 60
    remaining_minutes = total_minutes % 60

    if remaining_minutes == 0:
        return f"{hours} hr"

    return f"{hours} hr {remaining_minutes} min"


def is_valid_time(time_str: str) -> bool:
    """Check whether a time string has a valid HH:MM or HH:MM:SS format."""

    try:
        time_str_to_seconds(time_str)
        return True
    except (TypeError, ValueError):
        return False


def time_difference_seconds(
    start_time: str,
    end_time: str,
) -> int:
    """
    Calculate elapsed seconds between two times.

    Handles journeys crossing midnight.
    """

    start = time_str_to_seconds(start_time)
    end = time_str_to_seconds(end_time)

    if end < start:
        end += 24 * 3600

    return end - start


def normalize_time(time_str: str) -> str:
    """Normalize a time string to HH:MM."""

    return seconds_to_time_str(
        time_str_to_seconds(time_str)
    )


def current_date_string() -> str:
    """Return today's date in YYYY-MM-DD format."""

    return datetime.now().strftime("%Y-%m-%d")
