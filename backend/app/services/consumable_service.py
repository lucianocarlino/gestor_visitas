from app.models import consumable
from app.schemas.api_contracts import ConsumibleCreateRequest, ConsumibleUpdateRequest, LowStockAlert
from app.schemas.domain import Consumible
from app.services.base import DatabaseBackedService


class ConsumableService(DatabaseBackedService):
    def __init__(self, repository) -> None:
        self.repository = repository
    
    def list_all(self) -> list[Consumible]:
        try:
            return self.repository.get_all_consumables()
        except Exception as e:
            print(f"Error occurred while listing consumables: {e}")
            return []

    def list_low_stock_alerts(self) -> list[LowStockAlert]:
        try:
            low_stock_consumables = [consumable for consumable in self.repository.get_all_consumables() if consumable.stock < consumable.stock_minimo]
            return [LowStockAlert(consumable=consumable) for consumable in low_stock_consumables]
        except Exception as e:
            print(f"Error occurred while listing low stock alerts: {e}")
            return []

    def create(self, data: ConsumibleCreateRequest) -> Consumible:
        try:
            return self.repository.create_consumable(data).to_domain()
        except Exception as e:
            print(f"Error occurred while creating consumable: {e}")
            return None

    def update(self, consumable_id: str, data: ConsumibleUpdateRequest) -> Consumible:
        try:
            return self.repository.update_consumable(consumable_id, data).to_domain()
        except Exception as e:
            print(f"Error occurred while updating consumable {consumable_id}: {e}")
            return None

    def delete(self, consumable_id: str) -> bool:
        try:
            return self.repository.delete_consumable(consumable_id)
        except Exception as e:
            print(f"Error occurred while deleting consumable {consumable_id}: {e}")
            return False

    def toggle_critical(self, consumable_id: str) -> Consumible:
        try:
            consumable = self.repository.get_consumable_by_id(consumable_id)
            if not consumable:
                return False
            consumable.critical = not consumable.critical
            return self.repository.update_consumable(consumable_id, consumable)
        except Exception as e:
            print(f"Error occurred while updating consumable {consumable_id}: {e}")
            return False

    def restock(self, consumable_id: str, amount: float) -> Consumible:
        try:
            consumable = self.repository.get_consumable_by_id(consumable_id)
            if not consumable:
                return False
            consumable.stock += amount
            return self.repository.update_consumable(consumable_id, consumable)
        except Exception as e:
            print(f"Error occurred while restocking consumable {consumable_id}: {e}")
            return False
