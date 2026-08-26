from sqlalchemy import or_, select
from sqlalchemy.orm import Session, selectinload
from typing import TypeVar

from app.models.operation import CambioModel, ReemplazoModel, ServicioConsumibleModel, ServicioModel

OperationModel = TypeVar("OperationModel", ReemplazoModel, CambioModel, ServicioModel)


class OperationRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def read_replacements(self) -> list[ReemplazoModel]:
        return list(self.db.scalars(select(ReemplazoModel).order_by(ReemplazoModel.fecha.desc())).all())

    def read_machine_replacements(self, machine_id: str) -> list[ReemplazoModel]:
        statement = select(ReemplazoModel).where(
            or_(ReemplazoModel.retirado_id == machine_id, ReemplazoModel.instalado_id == machine_id)
        ).order_by(ReemplazoModel.fecha.desc())
        return list(self.db.scalars(statement).all())

    def create_replacement(self, values: dict[str, object]) -> ReemplazoModel:
        return self._save(ReemplazoModel(**values))

    def read_changes(self) -> list[CambioModel]:
        return list(self.db.scalars(select(CambioModel).order_by(CambioModel.fecha.desc())).all())

    def read_brake_changes(self, brake_id: str) -> list[CambioModel]:
        statement = select(CambioModel).where(
            or_(CambioModel.retirado_freno_id == brake_id, CambioModel.instalado_freno_id == brake_id)
        ).order_by(CambioModel.fecha.desc())
        return list(self.db.scalars(statement).all())

    def create_change(self, values: dict[str, object]) -> CambioModel:
        return self._save(CambioModel(**values))

    def read_services(self) -> list[ServicioModel]:
        statement = select(ServicioModel).options(selectinload(ServicioModel.consumibles)).order_by(ServicioModel.fecha.desc())
        return list(self.db.scalars(statement).all())

    def read_machine_services(self, machine_id: str) -> list[ServicioModel]:
        statement = select(ServicioModel).options(selectinload(ServicioModel.consumibles)).where(
            ServicioModel.machine_id == machine_id
        ).order_by(ServicioModel.fecha.desc())
        return list(self.db.scalars(statement).all())

    def create_service(
        self, values: dict[str, object], consumables: list[tuple[str, str, int]],
    ) -> ServicioModel:
        model = ServicioModel(**values)
        model.consumibles = [
            ServicioConsumibleModel(consumible_id=item[0], nombre=item[1], cantidad=item[2])
            for item in consumables
        ]
        return self._save(model)

    def _save(self, model: OperationModel) -> OperationModel:
        self.db.add(model)
        self.db.flush()
        self.db.refresh(model)
        return model
