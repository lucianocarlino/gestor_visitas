from typing import Literal

from pydantic import BaseModel

from app.schemas.domain import (
    AuditAction,
    AuditCategory,
    AuditEntry,
    Cabezal,
    Casetera,
    Freno,
    InitialCabezalInput,
    InitialCaseteraInput,
    MachineType,
    CreateEmpaqueDTO,
    CreateVisitDTO,
    Reemplazo,
    ReporteSinclair,
    RolType,
    Status,
    StatusTecnico,
    UserSession,
    Visita, Banco,
)


class DeleteResponse(BaseModel):
    success: bool


class SyncBatchRequest(BaseModel):
    visits: list[CreateVisitDTO]


class SyncBatchResponse(BaseModel):
    synced: list[Visita]
    errors: list[str]


class CreateVisitResponse(BaseModel):
    visita: Visita
    reporte: ReporteSinclair


class ExportZipRequest(BaseModel):
    startDate: str | None = None
    endDate: str | None = None


class RestockConsumibleRequest(BaseModel):
    amount: float


class AuthLoginRequest(BaseModel):
    email: str | None = None
    id: str | None = None
    password: str | None = None


class AuthLoginResponse(UserSession):
    pass


class AuditLogFilters(BaseModel):
    category: str | None = None
    userId: str | None = None
    search: str | None = None
    startDate: str | None = None
    endDate: str | None = None
    limit: int | None = None


class EmpaqueCreateRequest(CreateEmpaqueDTO):
    """Union-compatible create request."""


class EmpaqueUpdateRequest(BaseModel):
    nombre: str | None = None
    ubicacion: str | None = None
    latitud: float | None = None
    longitud: float | None = None
    servicio: bool | None = None
    distancia: float | None = None
    bancos: list[Banco] | None = None
    ultima_visita: str | None = None


class CabezalCreateRequest(BaseModel):
    id: str | None = None
    tipo: Literal["Cabezal"] | None = "Cabezal"
    estado: Status | None = None
    ubicacion: str | None = None
    empaque_id: str | None = None
    freno_actual_id: str | None = None
    historial_movimientos: list[Reemplazo] | None = None

    @classmethod
    def from_initial_input(
        cls,
        data: InitialCabezalInput,
        *,
        ubicacion: str | None = None,
    ) -> "CabezalCreateRequest":
        return cls(
            id=data.id,
            tipo="Cabezal",
            estado=data.estado,
            ubicacion=ubicacion,
            freno_actual_id=data.freno_id,
        )


class CabezalUpdateRequest(CabezalCreateRequest):
    pass


class CaseteraCreateRequest(BaseModel):
    id: int | None = None
    numero: int | None = None
    tipo: Literal["Casetera"] | None = "Casetera"
    estado: Status | None = None
    ubicacion: str | None = None
    empaque_id: str | None = None

    @classmethod
    def from_initial_input(
        cls,
        data: InitialCaseteraInput,
        *,
        ubicacion: str | None = None,
    ) -> "CaseteraCreateRequest":
        return cls(
            numero=data.id,
            tipo="Casetera",
            estado=data.estado,
            ubicacion=ubicacion,
        )


class CaseteraUpdateRequest(CaseteraCreateRequest):
    pass


class FrenoCreateRequest(BaseModel):
    id: str | None = None
    tipo: Literal["Freno"] | None = "Freno"
    fecha_inicio: str | None = None
    estado: Status | None = None
    cabezal_id: str | None = None
    ubicacion: str | None = None
    empaque_id: str | None = None

    @classmethod
    def from_initial_input(
        cls,
        data: InitialCabezalInput,
        *,
        ubicacion: str | None = None,
    ) -> "FrenoCreateRequest":
        return cls(
            id=data.freno_id,
            tipo="Freno",
            fecha_inicio=data.freno_fecha_inicio,
            estado=data.freno_estado or data.estado,
            cabezal_id=data.id,
            ubicacion=ubicacion,
        )


class FrenoUpdateRequest(FrenoCreateRequest):
    pass


class ConsumibleCreateRequest(BaseModel):
    id: str | None = None
    nombre: str | None = None
    stock: int | None = None
    es_critico: bool | None = None
    stock_minimo: int | None = None


class ConsumibleUpdateRequest(ConsumibleCreateRequest):
    pass


class TecnicoCreateRequest(BaseModel):
    id: str | None = None
    nombre: str | None = None
    ultima_conexion: str | None = None
    estado: StatusTecnico | None = None
    cumpleanos: str | None = None
    rol: RolType | None = None
    email: str | None = None
    password: str | None = None


class TecnicoUpdateRequest(TecnicoCreateRequest):
    pass


class AuditEntryCreateRequest(BaseModel):
    id: str | None = None
    timestamp: str | None = None
    userId: str | None = None
    userName: str | None = None
    userRole: str | None = None
    category: AuditCategory | None = None
    action: AuditAction | None = None
    targetId: str | None = None
    targetName: str | None = None
    details: str | None = None
    previousValue: str | int | None = None
    newValue: str | int | None = None
    metadata: dict[str, str | int | float | bool | None] | None = None


class EnumsResponse(BaseModel):
    payload: dict[str, dict[str, str]]


class UnvisitedAlert(BaseModel):
    empaque_id: str
    empaque_nombre: str
    ultima_visita: str | None = None
    dias_sin_visita: int


class LowStockAlert(BaseModel):
    consumible_id: str
    nombre: str
    stock: int
    stock_minimo: int


class TecnicoStats(BaseModel):
    tecnico_id: str
    tecnico_nombre: str
    total_horas_visitas: float
    total_reemplazos: int
    total_cambios_freno: int
    total_servicios: int
    estado: StatusTecnico

class EquipmentByLocationResponse(BaseModel):
    empaque_id: str
    cabezales: list[Cabezal]
    caseteras: list[Casetera]
    frenos: list[Freno]
    total: int


class MovimientoCreateRequest(BaseModel):
    machine_id: str | int
    machine_type: MachineType
    fecha: str
    tecnico_nombre: str
    motivo: str
    origen: str
    destino: str


class ServiceCreateResponse(BaseModel):
    success: bool
    service_id: str


class DashboardStats(BaseModel):
    empaques: int
    machines: int
    pending_visits: int
    low_stock_alerts: int


class ProviderTelemetry(BaseModel):
    status: str
    generated_at: str
    machine_count: int