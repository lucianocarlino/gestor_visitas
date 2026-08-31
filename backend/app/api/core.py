from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db_session

from app.schemas.api_contracts import (
    AuditEntryCreateRequest,
    AuditLogFilters,
    AuthLoginRequest,
    AuthLoginResponse,
    CabezalCreateRequest,
    CabezalUpdateRequest,
    CaseteraCreateRequest,
    CaseteraUpdateRequest,
    ConsumibleCreateRequest,
    ConsumibleUpdateRequest,
    DeleteResponse,
    EmpaqueCreateRequest,
    EmpaqueUpdateRequest,
    FrenoCreateRequest,
    FrenoUpdateRequest,
    RestockConsumibleRequest,
    TecnicoCreateRequest,
    TecnicoUpdateRequest, UnvisitedAlert, LowStockAlert, EquipmentByLocationResponse
)

from app.schemas.domain import (
    AuditEntry,
    Cabezal,
    Cambio,
    Casetera,
    Consumible,
    CreateCambioDTO,
    CreateReeplaceDTO,
    CreateServiceDTO,
    Empaque,
    Freno,
    Reemplazo,
    Servicio,
    Tecnico,
    Movimiento,
)

from app.services import empaque_service
from app.dependencies.dependencies import (
    EmpaqueServiceDependency, MachineServiceDependency, OperationServiceDependency, ConsumableServiceDependency,
    TechnicianServiceDependency, SystemServiceDependency, AuditServiceDependency,
)
from app.services.consumable_service import ConsumableService
from app.services.system_service import SystemService

core_router = APIRouter(prefix="/core", tags=["core"])

def _not_implemented() -> None:
    raise HTTPException(status_code=501, detail="Endpoint not implemented")

@core_router.get("/empaques", response_model=list[Empaque])
def get_empaques(service: EmpaqueServiceDependency) -> list[Empaque]:
    return service.list_all()

@core_router.get("/empaques/alerts/unvisited", response_model=list[UnvisitedAlert])
def get_unvisited_alerts(service: EmpaqueServiceDependency) -> list[UnvisitedAlert]:
    return service.list_unvisited_alerts()


@core_router.post("/empaques", response_model=Empaque)
def create_empaque(data: EmpaqueCreateRequest, service: EmpaqueServiceDependency) -> Empaque:
    return service.create(data)


@core_router.put("/empaques/{id}", response_model=Empaque)
def update_empaque(id: str, data: EmpaqueUpdateRequest, service: EmpaqueServiceDependency) -> Empaque:
    empaque_modify = service.update(id, data)
    if empaque_modify.id == "":
        raise HTTPException(status_code=404, detail="Empaque not found")
    return empaque_modify


@core_router.delete("/empaques/{id}", response_model=DeleteResponse)
def delete_empaque(id: str, service: EmpaqueServiceDependency) -> DeleteResponse:
    if service.delete(id):
        return { "success": True }
    else:
        raise HTTPException(status_code=404, detail="Can´t delete Empaque with id {id}.")


@core_router.get("/machines/location/{empaque_id}", response_model=EquipmentByLocationResponse)
def get_equipment_by_location(empaque_id: str, service: MachineServiceDependency) -> EquipmentByLocationResponse:
    return service.equipment_by_location(empaque_id)


@core_router.get("/machines/movements", response_model=list[Movimiento])
def get_all_movements(service: MachineServiceDependency) -> list[Movimiento]:
    return service.list_movements()


@core_router.post("/machines/movements", response_model=Movimiento)
def create_movimiento(data: dict, service: MachineServiceDependency) -> Movimiento:
    return service.create_movement(data)


@core_router.get("/machines/cabezales", response_model=list[Cabezal])
def get_cabezales(service: MachineServiceDependency) -> list[Cabezal]:
    return service.list_cabezales()


@core_router.post("/machines/cabezales", response_model=Cabezal)
def create_cabezal(data: CabezalCreateRequest, service: MachineServiceDependency) -> Cabezal:
    return service.create_cabezal(data)


@core_router.put("/machines/cabezales/{id}", response_model=Cabezal)
def update_cabezal(id: str, data: CabezalUpdateRequest, service: MachineServiceDependency) -> Cabezal:
    return service.update_cabezal(id, data, service)


@core_router.delete("/machines/cabezales/{id}", response_model=DeleteResponse)
def delete_cabezal(id: str, service: MachineServiceDependency) -> DeleteResponse:
    if service.delete_cabezal(id):
        return { "success" : True }
    else:
        raise HTTPException(status_code=404, detail="Can´t delete Cabezal with id {id}.")


@core_router.get("/machines/caseteras", response_model=list[Casetera])
def get_caseteras(service: MachineServiceDependency) -> list[Casetera]:
    return service.list_caseteras()


@core_router.post("/machines/caseteras", response_model=Casetera)
def create_casetera(data: CaseteraCreateRequest, service: MachineServiceDependency) -> Casetera:
    return service.create_casetera(data)


@core_router.put("/machines/caseteras/{numero}", response_model=Casetera)
def update_casetera(numero: int, data: CaseteraUpdateRequest, service: MachineServiceDependency) -> Casetera:
    return service.update_casetera(numero, data)

@core_router.delete("/machines/caseteras/{numero}", response_model=DeleteResponse)
def delete_casetera(numero: int, service: MachineServiceDependency) -> DeleteResponse:
    if service.delete_casetera(numero):
        return { "success" : True }
    else:
        raise HTTPException(status_code=404, detail="Can´t delete Casetera with number {numero}.")

@core_router.get("/machines/frenos", response_model=list[Freno])
def get_frenos(service: MachineServiceDependency) -> list[Freno]:
    return service.list_frenos()

@core_router.post("/machines/frenos", response_model=Freno)
def create_freno(data: FrenoCreateRequest, service: MachineServiceDependency) -> Freno:
    return service.create_freno(data)

@core_router.put("/machines/frenos/{id}", response_model=Freno)
def update_freno(id: str, data: FrenoUpdateRequest, service: MachineServiceDependency) -> Freno:
    return service.update_freno(id, data)


@core_router.delete("/machines/frenos/{id}", response_model=DeleteResponse)
def delete_freno(id: str, service: MachineServiceDependency) -> DeleteResponse:
    if service.delete_freno(id):
        return { "success" : True }
    else:
        raise HTTPException(status_code=404, detail="Can´t delete Freno with id {id}.")

@core_router.get("/operations/reemplazos", response_model=list[Reemplazo])
def get_reemplazos(service: OperationServiceDependency) -> list[Reemplazo]:
    return service.list_replacements()

@core_router.post("/operations/reemplazos", response_model=Reemplazo)
def create_reemplazo(dto: CreateReeplaceDTO, service: OperationServiceDependency) -> Reemplazo:
    return service.create_replacement(dto)


@core_router.get("/operations/cambios", response_model=list[Cambio])
def get_cambios(service: OperationServiceDependency) -> list[Cambio]:
    return service.list_brake_changes()


@core_router.post("/operations/cambios", response_model=Cambio)
def create_cambio(dto: CreateCambioDTO, service: OperationServiceDependency) -> Cambio:
    return service.create_brake_change(dto)


@core_router.get("/operations/servicios", response_model=list[Servicio])
def get_servicios(service: OperationServiceDependency) -> list[Servicio]:
    return service.list_services()


@core_router.post("/operations/servicios", response_model=Servicio)
def create_servicio(dto: CreateServiceDTO, service: OperationServiceDependency) -> Servicio:
    return service.create_service(dto)

@core_router.get("/consumibles", response_model=list[Consumible])
def get_consumibles(service: ConsumableServiceDependency) -> list[Consumible]:
    return service.list_all()


@core_router.get("/consumibles/alerts/low-stock", response_model=list[LowStockAlert])
def get_low_stock_alerts(service: ConsumableServiceDependency) -> list[LowStockAlert]:
    return service.list_low_stock_alerts()


@core_router.post("/consumibles", response_model=Consumible)
def create_consumible(data: ConsumibleCreateRequest, service: ConsumableServiceDependency) -> Consumible:
    return service.create(data)


@core_router.put("/consumibles/{id}", response_model=Consumible)
def update_consumible(id: str, data: ConsumibleUpdateRequest, service: ConsumableServiceDependency) -> Consumible:
    return service.update(id, data)


@core_router.delete("/consumibles/{id}", response_model=DeleteResponse)
def delete_consumible(id: str, service: ConsumableServiceDependency) -> DeleteResponse:
    if service.delete(id):
        return { "success" : True }
    else:
        return HTTPException(status_code=404, detail="Consumible not found")


@core_router.patch("/consumibles/{id}/toggle-critical", response_model=Consumible)
def toggle_critical_consumible(id: str, service: ConsumableServiceDependency) -> Consumible:
    consumable = service.toggle_critical(id)
    if not consumable:
        return HTTPException(status_code=404, detail="Consumible not found")
    return consumable


@core_router.post("/consumibles/{id}/restock", response_model=Consumible)
def restock_consumible(id: str, payload: RestockConsumibleRequest, service: ConsumableServiceDependency) -> Consumible:
    consumable = service.restock(id, payload)
    if not consumable:
        return HTTPException(status_code=404, detail="Consumible not found")
    return consumable


@core_router.get("/tecnicos", response_model=list[Tecnico])
def get_tecnicos(service: TechnicianServiceDependency) -> list[Tecnico]:
    return service.list_all()


@core_router.get("/tecnicos/activity/stats", response_model=list[dict])
def get_tecnico_stats(service: TechnicianServiceDependency) -> list[dict]:
    return service.activity_stats()


@core_router.post("/tecnicos", response_model=Tecnico)
def create_tecnico(data: TecnicoCreateRequest, service: TechnicianServiceDependency) -> Tecnico:
    return service.create(data)


@core_router.put("/tecnicos/{id}", response_model=Tecnico)
def update_tecnico(id: str, data: TecnicoUpdateRequest, service: TechnicianServiceDependency) -> Tecnico:
    return service.update(id, data)


@core_router.delete("/tecnicos/{id}", response_model=DeleteResponse)
def delete_tecnico(id: str, service: TechnicianServiceDependency) -> DeleteResponse:
    if service.delete(id):
        return { "success" : True }
    else:
        raise HTTPException(status_code=404, detail="Can´t delete Tecnico with id {id}.")


@core_router.post("/auth/login", response_model=AuthLoginResponse)
def auth_login(credentials: AuthLoginRequest, service: SystemServiceDependency) -> AuthLoginResponse:
    try:
        return service.login(credentials)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@core_router.get("/statistics/dashboard", response_model=dict)
def get_dashboard_stats(service: SystemServiceDependency) -> dict:
    return service.dashboard_stats()


@core_router.get("/provider/telemetry", response_model=dict)
def get_provider_telemetry() -> dict:
    _not_implemented()


@core_router.get("/audit-logs", response_model=list[AuditEntry])
def get_audit_logs(
    service: AuditServiceDependency,
    category: str | None = Query(default=None),
    userId: str | None = Query(default=None),
    search: str | None = Query(default=None),
    startDate: str | None = Query(default=None),
    endDate: str | None = Query(default=None),
    limit: int | None = Query(default=None),
) -> list[AuditEntry]:
    _filters = AuditLogFilters(
        category=category,
        userId=userId,
        search=search,
        startDate=startDate,
        endDate=endDate,
        limit=limit,
    )
    _ = _filters
    return service.list_entries(_filters)


@core_router.post("/audit-logs", response_model=AuditEntry)
def create_audit_log(entry: AuditEntryCreateRequest, service: AuditServiceDependency) -> AuditEntry:
    return service.create_entry(entry)
