from datetime import datetime

from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session, selectinload

from app.models.location import EmpaqueModel
from app.models.technician import TecnicoModel
from app.models.visit import (
    ItemEstructuraModel, ReporteSinclairModel, VisitaModel, VisitaTecnicoModel,
)
from app.schemas.domain import CreateVisitDTO


class VisitRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def read_all(self) -> list[VisitaModel]:
        statement = self._base_query().order_by(VisitaModel.fecha.desc())
        return list(self.db.scalars(statement).unique().all())

    def read_by_id(self, visit_id: str) -> VisitaModel | None:
        statement = self._base_query().where(VisitaModel.id == visit_id)
        return self.db.scalar(statement)

    def read_by_date_range(self, start: datetime, end: datetime) -> list[VisitaModel]:
        statement = self._base_query().where(
            VisitaModel.fecha >= start, VisitaModel.fecha <= end,
        ).order_by(VisitaModel.fecha)
        return list(self.db.scalars(statement).unique().all())

    def read_empaque(self, empaque_id: str) -> EmpaqueModel | None:
        return self.db.get(EmpaqueModel, empaque_id)

    def read_technicians(self, technician_ids: list[str]) -> list[TecnicoModel]:
        statement = select(TecnicoModel).where(TecnicoModel.id.in_(technician_ids))
        return list(self.db.scalars(statement).all())

    def create(self, data: CreateVisitDTO, report_number: int) -> VisitaModel:
        visit = VisitaModel(
            id=data.id, fecha=datetime.fromisoformat(data.hora_inicio), motivo=data.motivo,
            solicitado_por=data.solicitado_por, vehiculo=data.vehiculo.value,
            empaque_id=data.empaque_id, estado_sincronizacion="synced",
        )
        visit.tecnicos = [VisitaTecnicoModel(tecnico_id=item) for item in data.tecnico_ids]
        visit.reporte = self._build_report(data, report_number)
        self.db.add(visit)
        self.db.flush()
        self.db.refresh(visit)
        return visit

    def next_report_number(self) -> int:
        current = self.db.scalar(select(func.max(ReporteSinclairModel.numero)))
        return (current or 0) + 1

    @staticmethod
    def _build_report(data: CreateVisitDTO, report_number: int) -> ReporteSinclairModel:
        report = ReporteSinclairModel(
            numero=report_number, codigo_motivo=data.codigo_motivo.value,
            codigo_origen=data.codigo_origen.value,
            codigo_tipo_servicio=data.codigo_tipo_servicio.value,
            hora_inicio=datetime.fromisoformat(data.hora_inicio),
            hora_fin=datetime.fromisoformat(data.hora_fin), fuera_de_hora=data.fuera_de_hora,
            comentarios=data.comentarios, firma_cliente=data.firma_cliente,
            nombre_cliente=data.nombre_cliente, hora_llamada=datetime.fromisoformat(data.hora_llamada),
            produccion_etiquetada=data.produccion_etiquetada,
            condicion_fruta=data.condicion_fruta,
        )
        report.estructura = [
            ItemEstructuraModel(orden=index, **item.model_dump())
            for index, item in enumerate(data.estructura)
        ]
        return report

    @staticmethod
    def _base_query() -> Select[tuple[VisitaModel]]:
        return select(VisitaModel).options(
            selectinload(VisitaModel.tecnicos),
            selectinload(VisitaModel.reporte).selectinload(ReporteSinclairModel.estructura),
        )
