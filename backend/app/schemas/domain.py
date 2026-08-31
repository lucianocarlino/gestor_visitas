import datetime
from enum import Enum
from typing import Literal

from pydantic import BaseModel, JsonValue


class Status(str, Enum):
    PENDING = "Pendiente"
    READY = "Listo"
    USING = "En uso"


class CodigoMotivo(str, Enum):
    SRT = "Rutina"
    SPR = "Pretemporada"
    SPO = "Postemporada"
    SOH = "Revision"
    UEM = "Emergencia"
    UIN = "Instalacion"
    URM = "Retirada"
    UUP = "Actualizacion"


class CodigoOrden(str, Enum):
    CTR = "Cliente/Operador"
    SZR = "Calibrador"
    FC = "Condición de fruta"
    EWS = "Equipo dentro de especificaciones"
    CF = "Fallo de los componentes"
    ADJ = "Ajuste necesario"
    LF = "Problema con las etiquetas"
    LDM = "Recepcion/Alamcenaje de etiquetas"
    PD = "Daño fisico"


class CodigoTipoServicio(str, Enum):
    Y = "En emplazamiento"
    X = "Taller"
    T = "Formacion"


class Vehiculo(str, Enum):
    AMAROK = "Amarok"
    CHINO = "Chino"
    PARTICULAR = "Particular"


class StatusTecnico(str, Enum):
    DISPONIBLE = "Disponible"
    VACACIONES = "Vacaciones"


MachineType = Literal["Cabezal", "Casetera", "Freno"]
RolType = Literal["tecnico", "admin"]
RetiradoInstaladoType = Literal["Cabezal", "Casetera"]
SyncStatus = Literal["synced", "pending"]
AuditCategory = Literal["machine", "consumable", "visit", "empaque", "system"]
AuditAction = Literal[
    "CREATE",
    "UPDATE",
    "DELETE",
    "STATUS_CHANGE",
    "REPLACE",
    "BRAKE_SWAP",
    "SERVICE",
    "RELOCATION",
    "RESTOCK",
    "THRESHOLD_CHANGE",
    "CRITICAL_TOGGLE",
    "BATCH_SYNC",
]


class Banco(BaseModel):
    id: str
    fecha_instalacion: str
    lineas: int


class InitialCabezalInput(BaseModel):
    id: str
    estado: Status | None = None
    freno_id: str | None = None
    freno_estado: Status | None = None
    freno_fecha_inicio: str | None = None


class InitialCaseteraInput(BaseModel):
    id: int
    estado: Status | None = None


class CreateEmpaqueDTO(BaseModel):
    id: str | None = None
    nombre: str
    ubicacion: str
    latitud: float
    longitud: float
    servicio: bool
    distancia: float
    bancos: list[Banco]
    cabezales: list[InitialCabezalInput] | None = None
    caseteras: list[InitialCaseteraInput] | None = None

class Empaque(BaseModel):
    id: str
    nombre: str
    ubicacion: str
    latitud: float
    longitud: float
    servicio: bool
    distancia: float
    bancos: list[Banco]
    ultima_visita: str | None = None


class Tecnico(BaseModel):
    id: str
    nombre: str
    ultima_conexion: str
    estado: StatusTecnico
    cumpleanos: str
    rol: RolType
    email: str
    password: str | None = None

class Reemplazo(BaseModel):
    id: str
    fecha: str
    motivo: str
    retirado_id: str
    retirado_tipo: RetiradoInstaladoType
    instalado_id: str
    instalado_tipo: RetiradoInstaladoType
    empaque_id: str
    empaque_nombre: str
    tecnico_id: str | None = None
    tecnico_nombre: str | None = None


class ConsumibleItem(BaseModel):
    consumible_id: str
    nombre: str
    cantidad: int

class Servicio(BaseModel):
    id: str
    machine_id: str
    machine_type: MachineType
    fecha: str
    resumen: str
    trabajo_hecho: str
    consumibles: list[ConsumibleItem]
    tecnico_id: str | None = None
    tecnico_nombre: str | None = None


class Movimiento(BaseModel):
    id: str
    machine_id: str
    machine_type: MachineType
    fecha: str
    tecnico_id: str | None = None
    tecnico_nombre: str
    motivo: str
    origen: str
    destino: str



class Cabezal(BaseModel):
    id: str
    tipo: Literal["Cabezal"]
    estado: Status
    ubicacion: str
    freno_actual_id: str | None = None
    historial_reemplazos: list[Reemplazo] | None
    historial_servicios: list[Servicio] | None
    historial_movimientos: list[Movimiento] | None


class Casetera(BaseModel):
    id: int
    tipo: Literal["Casetera"]
    estado: Status
    ubicacion: str
    historial_reemplazos: list[Reemplazo] | None
    historial_servicios: list[Servicio] | None
    historial_movimientos: list[Movimiento] | None

class Cambio(BaseModel):
    id: str
    fecha: str
    motivo: str
    lugar: str
    retirado_freno_id: str | None = None
    instalado_freno_id: str
    cabezal_id: str
    tecnico_id: str | None = None
    tecnico_nombre: str | None = None


class Freno(BaseModel):
    id: str
    tipo: Literal["Freno"]
    fecha_inicio: str
    estado: Status
    cabezal_id: str | None = None
    ubicacion: str
    historial_cambios: list[Cambio] | None
    historial_servicios: list[Servicio] | None
    historial_movimientos: list[Movimiento] | None

class Consumible(BaseModel):
    id: str
    nombre: str
    stock: int
    es_critico: bool
    stock_minimo: int

class ItemEstructura(BaseModel):
    codigo_res: str
    numero_partes: str
    cantidad: str
    otras_acciones: str
    pct_etiquetado_esperado: float
    pct_etiquetado_real: float
    tiempo_servicio: float


class ReporteSinclair(BaseModel):
    numero: int
    codigo_motivo: CodigoMotivo
    codigo_origen: CodigoOrden
    codigo_tipo_servicio: CodigoTipoServicio
    estructura: list[ItemEstructura]
    hora_inicio: str
    hora_fin: str
    fuera_de_hora: bool
    comentarios: str
    firma_cliente: str | None = None
    nombre_cliente: str
    hora_llamada: str
    produccion_etiquetada: str | None = None
    condicion_fruta: str | None = None
    created_at: str


class Visita(BaseModel):
    id: str
    fecha: str
    motivo: str
    solicitado_por: str
    vehiculo: Vehiculo
    tecnicos: list[Tecnico]
    empaque: Empaque
    reporte: ReporteSinclair
    estado_sincronizacion: SyncStatus


class CreateVisitDTO(BaseModel):
    vehiculo: Vehiculo
    empaque_id: str
    tecnico_ids: list[str]
    codigo_motivo: CodigoMotivo
    codigo_origen: CodigoOrden
    codigo_tipo_servicio: CodigoTipoServicio
    solicitado_por: str
    motivo: str
    hora_inicio: str
    hora_fin: str
    fuera_de_hora: bool
    comentarios: str
    estructura: list[ItemEstructura]
    hora_llamada: str
    nombre_cliente: str
    firma_cliente: str | None = None
    produccion_etiquetada: str | None = None
    condicion_fruta: str | None = None
    id: str | None = None


class CreateReeplaceDTO(BaseModel):
    retirado_id: str
    retirado_tipo: RetiradoInstaladoType
    instalado_id: str
    instalado_tipo: RetiradoInstaladoType
    empaque_id: str
    motivo: str
    tecnico_id: str | None = None


class CreateCambioDTO(BaseModel):
    cabezal_id: str
    freno_retirado_id: str | None = None
    freno_instalado_id: str
    motivo: str
    fecha: str
    lugar: str
    empaque_id: str | None = None
    tecnico_id: str | None = None


class CreateServiceDTO(BaseModel):
    machine_id: str
    machine_type: MachineType
    fecha: str | None = None
    resumen: str
    trabajo_hecho: str
    consumibles: list[ConsumibleItem]
    tecnico_id: str | None = None


class AuditEntry(BaseModel):
    id: str
    timestamp: str
    userId: str
    userName: str
    userRole: str | None = None
    category: AuditCategory
    action: AuditAction
    targetId: str
    targetName: str
    details: str
    previousValue: str | int | None = None
    newValue: str | int | None = None
    metadata: dict[str, JsonValue] | None = None


class UserSession(BaseModel):
    user: Tecnico
    token: str
