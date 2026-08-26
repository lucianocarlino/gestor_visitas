import secrets
from datetime import datetime, timezone

from app.crud.consumable_crud import ConsumableRepository
from app.crud.empaque_crud import EmpaqueRepository
from app.crud.machine_crud import MachineRepository
from app.crud.technician_crud import TechnicianRepository
from app.crud.visit_crud import VisitRepository
from app.schemas.api_contracts import (
    AuthLoginRequest, AuthLoginResponse, DashboardStats, ProviderTelemetry,
)
from app.schemas.domain import Tecnico
from app.services.security import verify_password


class SystemService:
    def __init__(
        self, technicians: TechnicianRepository, empaques: EmpaqueRepository,
        machines: MachineRepository, consumables: ConsumableRepository,
        visits: VisitRepository,
    ) -> None:
        self.technicians = technicians
        self.empaques = empaques
        self.machines = machines
        self.consumables = consumables
        self.visits = visits

    def login(self, credentials: AuthLoginRequest) -> AuthLoginResponse:
        model = (self.technicians.read_by_email(credentials.email) if credentials.email
                 else self.technicians.read_by_id(credentials.id or ""))
        if model is None or not credentials.password:
            raise ValueError("Credenciales inválidas")
        if not verify_password(credentials.password, model.password_hash):
            raise ValueError("Credenciales inválidas")
        user = Tecnico(id=model.id, nombre=model.nombre,
                       ultima_conexion=model.ultima_conexion.isoformat() if model.ultima_conexion else "",
                       estado=model.estado, cumpleanos=model.cumpleanos.isoformat() if model.cumpleanos else "",
                       rol=model.rol, email=model.email, password=None)
        return AuthLoginResponse(user=user, token=secrets.token_urlsafe(32))

    def dashboard_stats(self) -> DashboardStats:
        heads = len(self.machines.read_cabezales())
        cassettes = len(self.machines.read_caseteras())
        brakes = len(self.machines.read_frenos())
        pending = sum(item.estado_sincronizacion == "pending" for item in self.visits.read_all())
        return DashboardStats(empaques=len(self.empaques.read_all()),
                              machines=heads + cassettes + brakes, pending_visits=pending,
                              low_stock_alerts=len(self.consumables.read_low_stock()))

    def provider_telemetry(self) -> ProviderTelemetry:
        count = len(self.machines.read_cabezales()) + len(self.machines.read_caseteras()) + len(self.machines.read_frenos())
        return ProviderTelemetry(status="ok", generated_at=datetime.now(timezone.utc).isoformat(),
                                 machine_count=count)
