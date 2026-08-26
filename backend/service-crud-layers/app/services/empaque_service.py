from datetime import datetime, timedelta, timezone

from app.crud.empaque_crud import EmpaqueRepository
from app.models.location import EmpaqueModel
from app.schemas.api_contracts import EmpaqueCreateRequest, EmpaqueUpdateRequest, UnvisitedAlert
from app.schemas.domain import Empaque
from app.services.exceptions import EntityNotFoundError


class EmpaqueService:
    def __init__(self, repository: EmpaqueRepository) -> None:
        self.repository = repository
        self.unvisited_limit = timedelta(days=15)

    def list_all(self) -> list[Empaque]:
        return [Empaque.model_validate(item, from_attributes=True) for item in self.repository.read_all()]

    def list_unvisited_alerts(self) -> list[UnvisitedAlert]:
        now = datetime.now(timezone.utc)
        alerts = [self._build_alert(item, now) for item in self.repository.read_active()]
        valid_alerts = [alert for alert in alerts if alert is not None]
        return sorted(valid_alerts, key=lambda alert: alert.dias_sin_visita, reverse=True)

    def _build_alert(self, empaque: EmpaqueModel, now: datetime) -> UnvisitedAlert | None:
        last_visit = empaque.ultima_visita
        reference = last_visit or empaque.created_at
        days = (now - reference).days
        if last_visit is not None and days <= self.unvisited_limit.days:
            return None
        return UnvisitedAlert(
            empaque_id=empaque.id, nombre=empaque.nombre,
            ubicacion=empaque.ubicacion, dias_sin_visita=days,
            ultima_visita=last_visit, urgencia="alta" if last_visit is None or days > 25 else "media",
        )

    def create(self, data: EmpaqueCreateRequest) -> Empaque:
        model = self.repository.create(data)
        return Empaque.model_validate(model, from_attributes=True)

    def update(self, empaque_id: str, data: EmpaqueUpdateRequest) -> Empaque:
        model = self.repository.read_by_id(empaque_id)
        if model is None:
            raise EntityNotFoundError("Empaque", empaque_id)
        updated = self.repository.update(model, data)
        return Empaque.model_validate(updated, from_attributes=True)

    def delete(self, empaque_id: str) -> bool:
        model = self.repository.read_by_id(empaque_id)
        if model is None:
            raise EntityNotFoundError("Empaque", empaque_id)
        self.repository.delete(model)
        return True
