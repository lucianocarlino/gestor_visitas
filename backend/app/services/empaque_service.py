from datetime import timedelta, datetime, timezone

from app.crud.machine_crud import MachineRepository
from app.crud.empaque_crud import EmpaqueRepository
from app.models.machine import FrenoModel
from app.schemas.api_contracts import EmpaqueCreateRequest, EmpaqueUpdateRequest, UnvisitedAlert, CabezalCreateRequest, \
    CaseteraCreateRequest, FrenoCreateRequest, MovimientoCreateRequest, CabezalUpdateRequest, CaseteraUpdateRequest, \
    FrenoUpdateRequest
from app.schemas.domain import Empaque
from app.services.base import DatabaseBackedService


class EmpaqueService(DatabaseBackedService):
    def __init__(self, repository: EmpaqueRepository, machines_repository: MachineRepository) -> None:
        self.repository = repository
        self.machines_repository = machines_repository
        self.unvisited_limit = timedelta(days=15)

    def list_all(self) -> list[Empaque]:
        return [empaque.to_domain() for empaque in self.repository.read_all()]

    def list_unvisited_alerts(self) -> list[UnvisitedAlert]:
        empaques = [
            empaque
            for empaque in self.repository.read_all()
            if empaque.servicio
        ]
        now = datetime.now(timezone.utc)
        alerts: list[UnvisitedAlert] = []

        for empaque in empaques:
            if empaque.ultima_visita is None:
                alerts.append(
                    UnvisitedAlert(
                        empaque_id=empaque.id,
                        nombre=empaque.nombre,
                        ubicacion=empaque.ubicacion,
                        dias_sin_visita=now - empaque.created_at,
                        urgencia="alta",
                    )
                )
                continue

            elapsed = now - empaque.ultima_visita

            if elapsed <= self.unvisited_limit:
                continue

            days_without_visit = elapsed.days

            alerts.append(
                UnvisitedAlert(
                    empaque_id=empaque.id,
                    nombre=empaque.nombre,
                    ubicacion=empaque.ubicacion,
                    dias_sin_visita=days_without_visit,
                    ultima_visita=empaque.ultima_visita,
                )
            )
        return sorted(
                alerts,
                key=lambda alert: alert.dias_sin_visita,
                reverse=True,
            )

    def create(self, data: EmpaqueCreateRequest) -> Empaque:
        new_empaque = self.repository.create_empaque(data)
        if new_empaque is None:
            return Empaque.empty()

        cabezales = [CabezalCreateRequest.from_initial_input(cabezal, ubicacion=data.nombre) for cabezal in data.cabezales]
        frenos = [FrenoCreateRequest.from_initial_input(cabezal, ubicacion=data.nombre) for cabezal in data.cabezales]
        caseteras = [CaseteraCreateRequest.from_initial_input(casetera, ubicacion=data.nombre) for casetera in data.caseteras]

        if self.machines_repository.create_various_cabezal(cabezales) and self.machines_repository.create_various_freno(frenos) and self.machines_repository.create_various_casetera(caseteras):
            return new_empaque.to_domain()
        else:
            return Empaque.empty()

    def update(self, empaque_id: str, data: EmpaqueUpdateRequest) -> Empaque:
        updated_empaque = self.repository.update(empaque_id, data)
        if updated_empaque is None:
            return Empaque.empty()
        return updated_empaque.to_domain()

    def delete(self, empaque_id: str) -> bool:
        cabezales =  self.machines_repository.read_all_cabezales_from_empaque(empaque_id)
        frenos = self.machines_repository.read_all_frenos_from_empaque(empaque_id)
        caseteras = self.machines_repository.read_all_caseteras_from_empaque(empaque_id)

        for cabezal in cabezales:
            self.machines_repository.delete_cabezal(cabezal.id)
        for freno in frenos:
            self.machines_repository.delete_freno(freno.id)
        for casetera in caseteras:
            self.machines_repository.delete_casetera(casetera.numero)

        return self.repository.delete(empaque_id)
