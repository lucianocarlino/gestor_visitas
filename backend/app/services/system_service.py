import secrets
from app.crud.technician_crud import TechnicianRepository
from app.schemas.api_contracts import (
    AuthLoginRequest, AuthLoginResponse, DashboardStats, ProviderTelemetry,
)
from app.schemas.domain import Tecnico
from app.services.base import DatabaseBackedService


class SystemService(DatabaseBackedService):
    def __init__(self, technician_repository: TechnicianRepository):
        self.technician_repository = technician_repository

    def login(self, credentials: AuthLoginRequest) -> AuthLoginResponse:
        model = (self.technician_repository.get_technician_by_email(credentials.email) if credentials.email
                 else self.technician_repository.get_technician(int(credentials.id)))
        if model is None or not credentials.password:
            raise ValueError("Credenciales inválidas")
        if not credentials.password == model.password_hash:
            raise ValueError("Credenciales inválidas")
        user = Tecnico(id=model.id, nombre=model.nombre,
                       ultima_conexion=model.ultima_conexion.isoformat() if model.ultima_conexion else "",
                       estado=model.estado, cumpleanos=model.cumpleanos.isoformat() if model.cumpleanos else "",
                       rol=model.rol, email=model.email, password=None)
        return AuthLoginResponse(user=user, token=secrets.token_urlsafe(32))

    def dashboard_stats(self) -> DashboardStats:
        return []

    def provider_telemetry(self) -> ProviderTelemetry:
        self._database_operation("collect provider telemetry")
