
import os
from pydantic import BaseModel, Field, field_validator


def _get_int(name: str, default: int) -> int:
    value = os.getenv(name, str(default))

    try:
        return int(value)
    except (TypeError, ValueError) as exc:
        raise ValueError(
            f"Environment variable {name} must be an integer."
        ) from exc


def _get_float(name: str, default: float) -> float:
    value = os.getenv(name, str(default))

    try:
        return float(value)
    except (TypeError, ValueError) as exc:
        raise ValueError(
            f"Environment variable {name} must be a number."
        ) from exc


class Settings(BaseModel):
    PROJECT_NAME: str = "TransitChain Optimization Service"
    VERSION: str = "1.0.0"

    API_V1_PREFIX: str = "/api/v1"

    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = Field(default_factory=lambda: _get_int("PORT", 8000))

    DEFAULT_WALK_SPEED_MPS: float = Field(
        default_factory=lambda: _get_float(
            "DEFAULT_WALK_SPEED_MPS",
            1.25,
        )
    )

    MAX_WALKING_DISTANCE: int = Field(
        default_factory=lambda: _get_int(
            "MAX_WALKING_DISTANCE",
            2000,
        )
    )

    MAX_TRANSFERS: int = Field(
        default_factory=lambda: _get_int(
            "MAX_TRANSFERS",
            3,
        )
    )

    MIN_TRANSFER_TIME_SEC: int = Field(
        default_factory=lambda: _get_int(
            "MIN_TRANSFER_TIME_SEC",
            180,
        )
    )

    SEARCH_TIMEOUT_SECONDS: float = Field(
        default_factory=lambda: _get_float(
            "SEARCH_TIMEOUT_SECONDS",
            8.0,
        )
    )

    NODE_BACKEND_URL: str = os.getenv(
        "NODE_BACKEND_URL",
        "http://127.0.0.1:5000",
    )

    MONGO_URI: str = os.getenv("MONGO_URI", "")

    @field_validator("PORT")
    @classmethod
    def validate_port(cls, value: int) -> int:
        if not 1 <= value <= 65535:
            raise ValueError("PORT must be between 1 and 65535.")
        return value

    @field_validator("DEFAULT_WALK_SPEED_MPS")
    @classmethod
    def validate_walking_speed(cls, value: float) -> float:
        if value <= 0:
            raise ValueError(
                "DEFAULT_WALK_SPEED_MPS must be greater than zero."
            )
        return value

    @field_validator("MAX_WALKING_DISTANCE")
    @classmethod
    def validate_walking_distance(cls, value: int) -> int:
        if value < 0:
            raise ValueError(
                "MAX_WALKING_DISTANCE cannot be negative."
            )
        return value

    @field_validator("MAX_TRANSFERS")
    @classmethod
    def validate_transfers(cls, value: int) -> int:
        if value < 0:
            raise ValueError("MAX_TRANSFERS cannot be negative.")
        return value

    @field_validator("MIN_TRANSFER_TIME_SEC")
    @classmethod
    def validate_transfer_time(cls, value: int) -> int:
        if value < 0:
            raise ValueError(
                "MIN_TRANSFER_TIME_SEC cannot be negative."
            )
        return value

    @field_validator("SEARCH_TIMEOUT_SECONDS")
    @classmethod
    def validate_search_timeout(cls, value: float) -> float:
        if value <= 0:
            raise ValueError(
                "SEARCH_TIMEOUT_SECONDS must be greater than zero."
            )
        return value


settings = Settings()
