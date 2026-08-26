from datetime import date, datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.technician import TecnicoModel
from app.models.visit import VisitaModel, VisitaTecnicoModel
from app.schemas.api_contracts import TecnicoCreateRequest, TecnicoUpdateRequest


class TechnicianRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def read_all(self) -> list[TecnicoModel]:
        return list(self.db.scalars(select(TecnicoModel).order_by(TecnicoModel.nombre)).all())

    def read_by_id(self, technician_id: str) -> TecnicoModel | None:
        return self.db.get(TecnicoModel, technician_id)

    def read_by_email(self, email: str) -> TecnicoModel | None:
        return self.db.scalar(select(TecnicoModel).where(TecnicoModel.email == email))

    def create(self, data: TecnicoCreateRequest, password_hash: str) -> TecnicoModel:
        values = data.model_dump(mode="json", exclude_none=True, exclude={"password"})
        self._parse_dates(values)
        model = TecnicoModel(**values, password_hash=password_hash)
        return self._save(model)

    def update(self, model: TecnicoModel, data: TecnicoUpdateRequest) -> TecnicoModel:
        values = data.model_dump(mode="json", exclude_unset=True, exclude={"password"})
        self._parse_dates(values)
        for field, value in values.items():
            setattr(model, field, value)
        return self._save(model)

    def delete(self, model: TecnicoModel) -> None:
        self.db.delete(model)
        self.db.flush()

    def read_activity(self) -> list[tuple[str, str, int, float]]:
        duration = func.extract("epoch", VisitaModel.updated_at - VisitaModel.fecha) / 3600
        statement = (
            select(
                TecnicoModel.id, TecnicoModel.nombre,
                func.count(VisitaTecnicoModel.visita_id), func.coalesce(func.sum(duration), 0.0),
            )
            .outerjoin(VisitaTecnicoModel, VisitaTecnicoModel.tecnico_id == TecnicoModel.id)
            .outerjoin(VisitaModel, VisitaModel.id == VisitaTecnicoModel.visita_id)
            .group_by(TecnicoModel.id, TecnicoModel.nombre)
        )
        return [(row[0], row[1], int(row[2]), float(row[3])) for row in self.db.execute(statement)]

    def _save(self, model: TecnicoModel) -> TecnicoModel:
        self.db.add(model)
        self.db.flush()
        self.db.refresh(model)
        return model

    @staticmethod
    def _parse_dates(values: dict[str, object]) -> None:
        if isinstance(values.get("ultima_conexion"), str):
            values["ultima_conexion"] = datetime.fromisoformat(str(values["ultima_conexion"]))
        if isinstance(values.get("cumpleanos"), str):
            values["cumpleanos"] = date.fromisoformat(str(values["cumpleanos"]))
