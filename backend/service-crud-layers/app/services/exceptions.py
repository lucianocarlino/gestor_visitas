class DomainServiceError(Exception):
    """Base error raised by business services."""


class EntityNotFoundError(DomainServiceError):
    def __init__(self, entity: str, entity_id: str) -> None:
        super().__init__(f"{entity} '{entity_id}' no existe")


class InsufficientStockError(DomainServiceError):
    def __init__(self, consumable_id: str) -> None:
        super().__init__(f"Stock insuficiente para el consumible '{consumable_id}'")
