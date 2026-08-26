from sqlalchemy.orm import Session
from app.models.consumable import ConsumibleModel
from app.schemas.domain import Consumible

class ConsumableRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_all_consumables(self) -> list[Consumible]:
        return [consumable.to_domain() for consumable in self.db.query(ConsumibleModel).all()]

    def create_consumable(self, data: Consumible) -> Consumible:
        try:
            new_consumable = ConsumibleModel(**data.dict())
            self.db.add(new_consumable)
            self.db.commit()
            self.db.refresh(new_consumable)
            return new_consumable.to_domain()
        except Exception as e:
            self.db.rollback()
            print(f"Error occurred while creating consumable: {e}")
            return Consumible.empty()

    def update_consumable(self, consumable_id: str, data: Consumible) -> Consumible:
        try:
            consumable = self.db.query(ConsumibleModel).filter(ConsumibleModel.id == consumable_id).first()
            if not consumable:
                return Consumible.empty()
            for key, value in data.dict().items():
                setattr(consumable, key, value)
            self.db.commit()
            self.db.refresh(consumable)
            return consumable.to_domain()
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