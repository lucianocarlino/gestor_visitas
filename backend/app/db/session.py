from collections.abc import Generator
from functools import lru_cache

from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.db.config import get_database_settings


@lru_cache(maxsize=1)
def get_engine() -> Engine:
    settings = get_database_settings()
    return create_engine(
        settings.url, echo=settings.echo, pool_pre_ping=True
    )


@lru_cache(maxsize=1)
def get_session_factory() -> sessionmaker[Session]:
    return sessionmaker(bind=get_engine(), autoflush=False, expire_on_commit=False)


def get_db_session() -> Generator[Session, None, None]:
    """Provide one transaction-capable session per FastAPI request."""
    with get_session_factory()() as session:
        yield session
