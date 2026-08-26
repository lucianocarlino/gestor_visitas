class ServiceError(Exception):
    """Base exception for semantic service-layer failures."""


class PersistenceNotImplementedError(ServiceError):
    """Raised while the repository/database adapter is not connected."""

    def __init__(self, operation: str) -> None:
        super().__init__(f"Persistence operation not implemented: {operation}")
        self.operation = operation
