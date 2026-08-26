from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.consumable import ConsumibleModel
from app.schemas.api_contracts import ConsumibleCreateRequest, ConsumibleUpdateRequest


class ConsumableRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def read_all(self) -> list[ConsumibleModel]:
        return list(self.db.scalars(select(ConsumibleModel).order_by(ConsumibleModel.nombre)).all())

    def read_by_id(self, consumable_id: str) -> ConsumibleModel | None:
        return self.db.get(ConsumibleModel, consumable_id)

    def read_low_stock(self) -> list[ConsumibleModel]:
        statement = (
            select(ConsumibleModel)
            .where(ConsumibleModel.es_critico.is_(True))
            .where(ConsumibleModel.stock <= ConsumibleModel.stock_minimo)
            .order_by(ConsumibleModel.stock)
        )
        return list(self.db.scalars(statement).all())

    def create(self, data: ConsumibleCreateRequest) -> ConsumibleModel:
        model = ConsumibleModel(**data.model_dump(mode="json", exclude_none=True))
        return self._save(model)

    def update(self, model: ConsumibleModel, data: ConsumibleUpdateRequest) -> ConsumibleModel:
        for field, value in data.model_dump(mode="json", exclude_unset=True).items():
            setattr(model, field, value)
        return self._save(model)

    def delete(self, model: ConsumibleModel) -> None:
        self.db.delete(model)
        self.db.flush()

    def save(self, model: ConsumibleModel) -> ConsumibleModel:
        return self._save(model)

    def _save(self, model: ConsumibleModel) -> ConsumibleModel:
        self.db.add(model)
        self.db.flush()
        self.db.refresh(model)
        return model
