
from typing import Dict, List

from app.models.schemas import JourneyAlternative


OBJECTIVES = (
    "duration",
    "walking",
    "transfers",
    "fare",
    "waiting",
)


WEIGHT_PRESETS = {
    "fastest": {
        "duration": 0.60,
        "walking": 0.15,
        "transfers": 0.10,
        "fare": 0.05,
        "waiting": 0.10,
    },
    "lowest_fare": {
        "duration": 0.15,
        "walking": 0.10,
        "transfers": 0.10,
        "fare": 0.55,
        "waiting": 0.10,
    },
    "fewest_transfers": {
        "duration": 0.20,
        "walking": 0.10,
        "transfers": 0.50,
        "fare": 0.10,
        "waiting": 0.10,
    },
    "least_walking": {
        "duration": 0.20,
        "walking": 0.50,
        "transfers": 0.15,
        "fare": 0.05,
        "waiting": 0.10,
    },
    "balanced": {
        "duration": 0.35,
        "walking": 0.20,
        "transfers": 0.20,
        "fare": 0.15,
        "waiting": 0.10,
    },
}


def _objective_values(
    alternative: JourneyAlternative,
) -> Dict[str, float]:
    return {
        "duration": float(alternative.total_duration_seconds),
        "walking": float(alternative.walking_duration_seconds),
        "transfers": float(alternative.transfer_count),
        "fare": float(alternative.fare),
        "waiting": float(alternative.waiting_duration_seconds),
    }


def is_dominated(
    candidate: JourneyAlternative,
    other: JourneyAlternative,
) -> bool:
    """
    Return True when another journey is no worse in every objective
    and strictly better in at least one objective.
    """

    candidate_values = _objective_values(candidate)
    other_values = _objective_values(other)

    no_worse_in_all = all(
        other_values[key] <= candidate_values[key]
        for key in OBJECTIVES
    )

    strictly_better_in_one = any(
        other_values[key] < candidate_values[key]
        for key in OBJECTIVES
    )

    return no_worse_in_all and strictly_better_in_one


def find_pareto_frontier(
    alternatives: List[JourneyAlternative],
) -> List[JourneyAlternative]:
    """
    Identify non-dominated journeys.

    A journey remains on the Pareto frontier if no other journey
    improves at least one objective without worsening another.
    """

    frontier = []

    for candidate in alternatives:
        dominated = any(
            candidate.id != other.id
            and is_dominated(candidate, other)
            for other in alternatives
        )

        candidate.pareto_optimal = not dominated
        frontier.append(candidate)

    return frontier


def _get_normalization_bounds(
    alternatives: List[JourneyAlternative],
) -> Dict[str, Dict[str, float]]:
    """Calculate minimum and maximum values for each objective."""

    values = {
        key: [
            _objective_values(alternative)[key]
            for alternative in alternatives
        ]
        for key in OBJECTIVES
    }

    return {
        key: {
            "min": min(items) if items else 0.0,
            "max": max(items) if items else 1.0,
        }
        for key, items in values.items()
    }


def _normalize(
    value: float,
    minimum: float,
    maximum: float,
) -> float:
    """Normalize an objective to the range 0–1."""

    if maximum <= minimum:
        return 0.0

    return (value - minimum) / (maximum - minimum)


def compute_multiobjective_score(
    alternative: JourneyAlternative,
    min_vals: Dict[str, float],
    max_vals: Dict[str, float],
    preference: str = "balanced",
) -> float:
    """
    Calculate a weighted normalized journey cost.

    Lower scores indicate better alternatives.
    Pareto-optimal journeys receive a small ranking bonus.
    """

    weights = WEIGHT_PRESETS.get(
        preference,
        WEIGHT_PRESETS["balanced"],
    )

    values = _objective_values(alternative)

    normalized_values = {}

    for key in OBJECTIVES:
        normalized_values[key] = _normalize(
            values[key],
            min_vals.get(key, 0.0),
            max_vals.get(key, 1.0),
        )

    score = sum(
        weights[key] * normalized_values[key]
        for key in OBJECTIVES
    )

    if alternative.pareto_optimal:
        score -= 0.05

    return round(score, 4)


def rank_and_score_alternatives(
    alternatives: List[JourneyAlternative],
    preference: str = "balanced",
) -> List[JourneyAlternative]:
    """
    Calculate the Pareto frontier, score all journeys,
    and return them in preference-based ranking order.
    """

    if not alternatives:
        return []

    # Step 1: Identify Pareto-optimal journeys.
    frontier = find_pareto_frontier(alternatives)

    # Step 2: Calculate normalization boundaries.
    bounds = _get_normalization_bounds(frontier)

    min_vals = {
        key: bounds[key]["min"]
        for key in OBJECTIVES
    }

    max_vals = {
        key: bounds[key]["max"]
        for key in OBJECTIVES
    }

    # Step 3: Calculate weighted scores.
    for alternative in frontier:
        alternative.score = compute_multiobjective_score(
            alternative,
            min_vals,
            max_vals,
            preference,
        )

    # Step 4: Pareto-optimal journeys first, then lowest score.
    return sorted(
        frontier,
        key=lambda alternative: (
            not alternative.pareto_optimal,
            alternative.score,
            alternative.total_duration_seconds,
        ),
    )
