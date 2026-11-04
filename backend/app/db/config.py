import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

# Variable de configuración para el directorio donde se almacenan los PDFs de visitas generados.
# Puedes cambiar la ruta asignando directamente esta variable o definiendo la variable de entorno PDF_STORAGE_DIR.
DEFAULT_PDF_STORAGE_DIR = Path(__file__).resolve().parent.parent.parent / "storage" / "reports"
PDF_STORAGE_DIR = Path(os.getenv("PDF_STORAGE_DIR", str(DEFAULT_PDF_STORAGE_DIR)))


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
