from sqlalchemy.orm import Session
from app.models.consumable import ConsumibleModel
from app.schemas.api_contracts import ConsumibleUpdateRequest
from app.schemas.domain import Consumible

class ConsumableRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_all_consumables(self) -> list[Consumible]:
        return [consumable.to_domain() for consumable in self.db.query(ConsumibleModel).all()]

    def create_consumable(self, data: Consumible) -> ConsumibleModel:
        try:
            new_consumable = ConsumibleModel.from_domain(data)
            self.db.add(new_consumable)
            self.db.flush()
            self.db.refresh(new_consumable)
            return new_consumable
        except Exception as e:
            self.db.rollback()
            print(f"Error occurred while creating consumable: {e}")
            return Consumible.empty()

    def update_consumable(self, consumable_id: str, data: ConsumibleUpdateRequest) -> ConsumibleModel:
        try:
            consumable = self.db.query(ConsumibleModel).filter(ConsumibleModel.id == consumable_id).first()
            if data.nombre is not None:
                consumable.nombre = data.nombre
            if data.stock is not None:
                consumable.stock = data.stock
            if data.stock_minimo is not None:
                consumable.stock_minimo = data.stock_minimo
            if data.es_critico is not None:
                consumable.critical = data.es_critico
            self.db.flush()
            self.db.refresh(consumable)
            return consumable
        except Exception as e:
            self.db.rollback()
            print(f"Error occurred while updating consumable {consumable_id}: {e}")
            return Consumible.empty()

    def delete_consumable(self, consumable_id: str):
        try:
            consumable = self.db.query(ConsumibleModel).filter(ConsumibleModel.id == consumable_id).first()
            if not consumable:
                return False
            self.db.delete(consumable)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            print(f"Error occurred while deleting consumable {consumable_id}: {e}")
            return False

    def get_consumable_by_id(self, consumable_id: str) -> ConsumibleModel:
        try:
            return self.db.query(ConsumibleModel).filter(ConsumibleModel.id == consumable_id).first()
        except Exception as e:
            print(f"Error occurred while retrieving consumable {consumable_id}: {e}")
            return None