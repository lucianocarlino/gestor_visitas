import io
import zipfile
from datetime import datetime

from app.crud.visit_crud import VisitRepository
from app.models.location import EmpaqueModel
from app.models.technician import TecnicoModel
from app.models.visit import ReporteSinclairModel, VisitaModel
from app.schemas.api_contracts import CreateVisitResponse, ExportZipRequest, SyncBatchResponse
from app.schemas.domain import (
    Banco, CreateVisitDTO, Empaque, ItemEstructura, ReporteSinclair, Tecnico, Visita,
)
from app.services.exceptions import EntityNotFoundError


class VisitService:
    def __init__(self, repository: VisitRepository) -> None:
        self.repository = repository

    def create(self, data: CreateVisitDTO) -> CreateVisitResponse:
        empaque, technicians = self._validate_relations(data)
        model = self.repository.create(data, self.repository.next_report_number())
        visita = self._domain(model, empaque, technicians)
        return CreateVisitResponse(visita=visita, reporte=visita.reporte)

    def sync_batch(self, visits: list[CreateVisitDTO]) -> SyncBatchResponse:
        synced: list[Visita] = []
        errors: list[str] = []
        for data in visits:
            try:
                synced.append(self.create(data).visita)
            except EntityNotFoundError as error:
                errors.append(f"{data.id or 'sin-id'}: {error}")
        return SyncBatchResponse(synced=synced, errors=errors)

    def list_all(self) -> list[Visita]:
        return [self._hydrate(item) for item in self.repository.read_all()]

    def filter_by_date_range(self, start: str, end: str) -> list[Visita]:
        models = self.repository.read_by_date_range(
            datetime.fromisoformat(start), datetime.fromisoformat(end)
        )
        return [self._hydrate(item) for item in models]

    def export_zip(self, filters: ExportZipRequest) -> bytes:
        visits = (self.filter_by_date_range(filters.startDate, filters.endDate)
                  if filters.startDate and filters.endDate else self.list_all())
        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as archive:
            for visit in visits:
                content = visit.reporte.model_dump_json(indent=2)
                archive.writestr(f"reporte-{visit.reporte.numero}.json", content)
        return buffer.getvalue()

    def get_by_id(self, visit_id: str) -> Visita:
        model = self.repository.read_by_id(visit_id)
        if model is None:
            raise EntityNotFoundError("Visita", visit_id)
        return self._hydrate(model)

    def _validate_relations(self, data: CreateVisitDTO) -> tuple[EmpaqueModel, list[TecnicoModel]]:
        empaque = self.repository.read_empaque(data.empaque_id)
        if empaque is None:
            raise EntityNotFoundError("Empaque", data.empaque_id)
        technicians = self.repository.read_technicians(data.tecnico_ids)
        found = {item.id for item in technicians}
        missing = next((item for item in data.tecnico_ids if item not in found), None)
        if missing is not None:
            raise EntityNotFoundError("Tecnico", missing)
        return empaque, technicians

    def _hydrate(self, model: VisitaModel) -> Visita:
        empaque = self.repository.read_empaque(model.empaque_id)
        if empaque is None:
            raise EntityNotFoundError("Empaque", model.empaque_id)
        technicians = self.repository.read_technicians([item.tecnico_id for item in model.tecnicos])
        return self._domain(model, empaque, technicians)

    @staticmethod
    def _domain(model: VisitaModel, empaque: EmpaqueModel, technicians: list[TecnicoModel]) -> Visita:
        return Visita(id=model.id, fecha=model.fecha.isoformat(), motivo=model.motivo,
                      solicitado_por=model.solicitado_por, vehiculo=model.vehiculo,
                      tecnicos=[VisitService._technician(item) for item in technicians],
                      empaque=VisitService._empaque(empaque),
                      reporte=VisitService._report(model.reporte),
                      estado_sincronizacion=model.estado_sincronizacion)

    @staticmethod
    def _empaque(model: EmpaqueModel) -> Empaque:
        banks = [Banco(id=item.id, fecha_instalacion=item.fecha_instalacion.isoformat(),
                       lineas=item.lineas) for item in model.bancos]
        return Empaque(id=model.id, nombre=model.nombre, ubicacion=model.ubicacion,
                       latitud=model.latitud, longitud=model.longitud, servicio=model.servicio,
                       distancia=model.distancia, bancos=banks,
                       ultima_visita=model.ultima_visita.isoformat() if model.ultima_visita else None)

    @staticmethod
    def _technician(model: TecnicoModel) -> Tecnico:
        return Tecnico(id=model.id, nombre=model.nombre,
                       ultima_conexion=model.ultima_conexion.isoformat() if model.ultima_conexion else "",
                       estado=model.estado, cumpleanos=model.cumpleanos.isoformat() if model.cumpleanos else "",
                       rol=model.rol, email=model.email, password=None)

    @staticmethod
    def _report(model: ReporteSinclairModel) -> ReporteSinclair:
        items = [ItemEstructura.model_validate(item, from_attributes=True) for item in model.estructura]
        return ReporteSinclair(numero=model.numero, codigo_motivo=model.codigo_motivo,
                               codigo_origen=model.codigo_origen,
                               codigo_tipo_servicio=model.codigo_tipo_servicio,
                               estructura=items, hora_inicio=model.hora_inicio.isoformat(),
                               hora_fin=model.hora_fin.isoformat(), fuera_de_hora=model.fuera_de_hora,
                               comentarios=model.comentarios, firma_cliente=model.firma_cliente,
                               nombre_cliente=model.nombre_cliente,
                               hora_llamada=model.hora_llamada.isoformat(),
                               produccion_etiquetada=model.produccion_etiquetada,
                               condicion_fruta=model.condicion_fruta,
                               created_at=model.created_at.isoformat())
