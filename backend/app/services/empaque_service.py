from datetime import timedelta, datetime, timezone

from app.crud import empaque_crud
from app.schemas.api_contracts import EmpaqueCreateRequest, EmpaqueUpdateRequest, UnvisitedAlert
from app.schemas.domain import Empaque
from app.services.base import DatabaseBackedService


class EmpaqueService(DatabaseBackedService):
    def __init__(self, repository: empaque_crud.EmpaqueRepository) -> None:
        self.repository = repository
        self.unvisited_limit = timedelta(days=15)

    def list_all(self) -> list[Empaque]:
        return self.repository.read_all()

    def list_unvisited_alerts(self) -> list[UnvisitedAlert]:
        empaques = [
            empaque
            for empaque in self.repository.get_all()
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
        return self.repository.create(data)

    def update(self, empaque_id: str, data: EmpaqueUpdateRequest) -> Empaque:
        return self.repository.update(empaque_id, data)

    def delete(self, empaque_id: str) -> bool:
        return self.repository.delete(empaque_id)
