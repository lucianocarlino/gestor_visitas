from sqlalchemy import select
from sqlalchemy.orm import Session
from typing import TypeVar
from datetime import date

from app.models.machine import CabezalModel, CaseteraModel, FrenoModel, MovimientoModel
from app.schemas.api_contracts import (
    CabezalCreateRequest, CabezalUpdateRequest, CaseteraCreateRequest,
    CaseteraUpdateRequest, FrenoCreateRequest, FrenoUpdateRequest,
    MovimientoCreateRequest,
)

MachineModel = TypeVar("MachineModel", CabezalModel, CaseteraModel, FrenoModel, MovimientoModel)


class MachineRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def read_cabezales(self) -> list[CabezalModel]:
        return list(self.db.scalars(select(CabezalModel).order_by(CabezalModel.id)).all())

    def read_cabezal(self, machine_id: str) -> CabezalModel | None:
        return self.db.get(CabezalModel, machine_id)

    def create_cabezal(self, data: CabezalCreateRequest) -> CabezalModel:
        values = data.model_dump(mode="json", exclude_none=True, exclude={"tipo", "historial_movimientos"})
        model = CabezalModel(**values)
        return self._save(model)

    def update_cabezal(self, model: CabezalModel, data: CabezalUpdateRequest) -> CabezalModel:
        self._apply(model, data.model_dump(mode="json", exclude_unset=True,
                                          exclude={"tipo", "historial_movimientos"}))
        return self._save(model)

    def delete_cabezal(self, model: CabezalModel) -> None:
        self._delete(model)

    def read_caseteras(self) -> list[CaseteraModel]:
        return list(self.db.scalars(select(CaseteraModel).order_by(CaseteraModel.numero)).all())

    def read_casetera(self, number: int) -> CaseteraModel | None:
        return self.db.get(CaseteraModel, number)

    def create_casetera(self, data: CaseteraCreateRequest) -> CaseteraModel:
        values = data.model_dump(mode="json", exclude_none=True, exclude={"tipo", "historial_movimientos"})
        if "id" in values:
            values["numero"] = values.pop("id")
        return self._save(CaseteraModel(**values))

    def update_casetera(self, model: CaseteraModel, data: CaseteraUpdateRequest) -> CaseteraModel:
        values = data.model_dump(mode="json", exclude_unset=True,
                                 exclude={"id", "tipo", "historial_movimientos"})
        self._apply(model, values)
        return self._save(model)

    def delete_casetera(self, model: CaseteraModel) -> None:
        self._delete(model)

    def read_frenos(self) -> list[FrenoModel]:
        return list(self.db.scalars(select(FrenoModel).order_by(FrenoModel.id)).all())

    def read_freno(self, machine_id: str) -> FrenoModel | None:
        return self.db.get(FrenoModel, machine_id)

    def create_freno(self, data: FrenoCreateRequest) -> FrenoModel:
        values = data.model_dump(mode="json", exclude_none=True, exclude={"tipo", "historial_movimientos"})
        if "fecha_inicio" in values:
            values["fecha_inicio"] = date.fromisoformat(values["fecha_inicio"])
        return self._save(FrenoModel(**values))

    def update_freno(self, model: FrenoModel, data: FrenoUpdateRequest) -> FrenoModel:
        values = data.model_dump(mode="json", exclude_unset=True,
                                 exclude={"tipo", "historial_movimientos"})
        if "fecha_inicio" in values:
            values["fecha_inicio"] = date.fromisoformat(values["fecha_inicio"])
        self._apply(model, values)
        return self._save(model)

    def delete_freno(self, model: FrenoModel) -> None:
        self._delete(model)

    def read_movements(self) -> list[MovimientoModel]:
        statement = select(MovimientoModel).order_by(MovimientoModel.fecha.desc())
        return list(self.db.scalars(statement).all())

    def create_movement(self, data: MovimientoCreateRequest) -> MovimientoModel:
        return self._save(MovimientoModel(**data.model_dump()))

    def read_by_location(self, empaque_id: str) -> tuple[list[CabezalModel], list[CaseteraModel], list[FrenoModel]]:
        cabezales = self.db.scalars(select(CabezalModel).where(CabezalModel.empaque_id == empaque_id)).all()
        caseteras = self.db.scalars(select(CaseteraModel).where(CaseteraModel.empaque_id == empaque_id)).all()
        frenos = self.db.scalars(select(FrenoModel).where(FrenoModel.empaque_id == empaque_id)).all()
        return list(cabezales), list(caseteras), list(frenos)

    def _save(self, model: MachineModel) -> MachineModel:
        self.db.add(model)
        self.db.flush()
        self.db.refresh(model)
        return model

    def _delete(self, model: CabezalModel | CaseteraModel | FrenoModel) -> None:
        self.db.delete(model)
        self.db.flush()

    @staticmethod
    def _apply(model: CabezalModel | CaseteraModel | FrenoModel, values: dict[str, object]) -> None:
        for field, value in values.items():
            setattr(model, field, value)
