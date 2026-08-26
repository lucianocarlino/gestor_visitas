from typing import NoReturn

from app.services.exceptions import PersistenceNotImplementedError


class DatabaseBackedService:
    """Common helper for methods awaiting a repository implementation."""

    @staticmethod
    def _database_operation(operation: str) -> NoReturn:
        # TODO(database): replace this guard with the corresponding repository call.
        raise PersistenceNotImplementedError(operation)
