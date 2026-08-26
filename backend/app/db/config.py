import os
from dataclasses import dataclass
from functools import lru_cache


@dataclass(frozen=True, slots=True)
class DatabaseSettings:
    url: str
    echo: bool


@lru_cache(maxsize=1)
def get_database_settings() -> DatabaseSettings:
    return DatabaseSettings(
        url=os.getenv("DATABASE_URL", "postgresql://postgres:1234@127.0.0.1:5433/gestor_visitas"),
        echo=os.getenv("DATABASE_ECHO", "false").lower() == "true",
    )
