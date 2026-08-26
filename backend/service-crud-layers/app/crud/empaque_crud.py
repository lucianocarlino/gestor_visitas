from sqlalchemy import select
from datetime import date

from sqlalchemy.orm import Session, selectinload

from app.models.location import BancoModel, EmpaqueModel
from app.schemas.api_contracts import EmpaqueCreateRequest, EmpaqueUpdateRequest


class EmpaqueRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def read_all(self) -> list[EmpaqueModel]:
        statement = select(EmpaqueModel).options(selectinload(EmpaqueModel.bancos)).order_by(EmpaqueModel.nombre)
        return list(self.db.scalars(statement).all())

    def read_active(self) -> list[EmpaqueModel]:
        statement = (
            select(EmpaqueModel).options(selectinload(EmpaqueModel.bancos))
            .where(EmpaqueModel.servicio.is_(True))
            .order_by(EmpaqueModel.nombre)
        )
        return list(self.db.scalars(statement).all())

    def read_by_id(self, empaque_id: str) -> EmpaqueModel | None:
        statement = select(EmpaqueModel).options(selectinload(EmpaqueModel.bancos)).where(
            EmpaqueModel.id == empaque_id
        )
        return self.db.scalar(statement)

    def create(self, data: EmpaqueCreateRequest) -> EmpaqueModel:
        empaque = EmpaqueModel(**data.model_dump(exclude={"bancos", "cabezales", "caseteras"}))
        empaque.bancos = [
            BancoModel(id=item.id, fecha_instalacion=date.fromisoformat(item.fecha_instalacion),
                       lineas=item.lineas)
            for item in data.bancos
        ]
        self.db.add(empaque)
        self.db.flush()
        self.db.refresh(empaque)
        return empaque

    def update(self, empaque: EmpaqueModel, data: EmpaqueUpdateRequest) -> EmpaqueModel:
        for field, value in data.model_dump(exclude_unset=True, exclude={"bancos"}).items():
            setattr(empaque, field, value)
        self.db.flush()
        self.db.refresh(empaque)
        return empaque

    def delete(self, empaque: EmpaqueModel) -> None:
        self.db.delete(empaque)
        self.db.flush()
