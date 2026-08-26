from app.crud.consumable_crud import ConsumableRepository
from app.models.consumable import ConsumibleModel
from app.schemas.api_contracts import ConsumibleCreateRequest, ConsumibleUpdateRequest, LowStockAlert
from app.schemas.domain import Consumible
from app.services.exceptions import EntityNotFoundError


class ConsumableService:
    def __init__(self, repository: ConsumableRepository) -> None:
        self.repository = repository

    def list_all(self) -> list[Consumible]:
        return [Consumible.model_validate(item, from_attributes=True) for item in self.repository.read_all()]

    def list_low_stock_alerts(self) -> list[LowStockAlert]:
        return [
            LowStockAlert(consumible_id=item.id, nombre=item.nombre,
                          stock=item.stock, stock_minimo=item.stock_minimo)
            for item in self.repository.read_low_stock()
        ]

    def create(self, data: ConsumibleCreateRequest) -> Consumible:
        return Consumible.model_validate(self.repository.create(data), from_attributes=True)

    def update(self, consumable_id: str, data: ConsumibleUpdateRequest) -> Consumible:
        model = self._find(consumable_id)
        return Consumible.model_validate(self.repository.update(model, data), from_attributes=True)

    def delete(self, consumable_id: str) -> bool:
        self.repository.delete(self._find(consumable_id))
        return True

    def toggle_critical(self, consumable_id: str) -> Consumible:
        model = self._find(consumable_id)
        model.es_critico = not model.es_critico
        return Consumible.model_validate(self.repository.save(model), from_attributes=True)

    def restock(self, consumable_id: str, amount: float) -> Consumible:
        if amount <= 0 or not amount.is_integer():
            raise ValueError("La reposición debe ser un número entero positivo")
        model = self._find(consumable_id)
        model.stock += int(amount)
        return Consumible.model_validate(self.repository.save(model), from_attributes=True)

    def _find(self, consumable_id: str) -> ConsumibleModel:
        model = self.repository.read_by_id(consumable_id)
        if model is None:
            raise EntityNotFoundError("Consumible", consumable_id)
        return model
