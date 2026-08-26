from typing import Annotated
from fastapi import Depends
from sqlalchemy.orm import Session

from app.crud.audit_crud import AuditRepository
from app.crud.empaque_crud import EmpaqueRepository
from app.crud.consumable_crud import ConsumableRepository
from app.crud.machine_crud import MachineRepository
from app.crud.operation_crud import OperationRepository
from app.crud.technician_crud import TechnicianRepository
from app.crud.visit_crud import VisitsRepository
from app.db.session import get_db_session
from app.services.audit_service import AuditService
from app.services.consumable_service import ConsumableService

from app.services.empaque_service import EmpaqueService
from app.services.machine_service import MachineService
from app.services.operation_service import OperationService
from app.services.system_service import SystemService
from app.services.technician_service import TechnicianService



def get_empaque_service(session: Annotated[Session, Depends(get_db_session)]) -> EmpaqueService:
    repository = EmpaqueRepository(session)
    return EmpaqueService(repository=repository)

def get_machine_service(session: Annotated[Session, Depends(get_db_session)]) -> MachineService:
    repository = MachineRepository(session)
    return MachineService(repository=repository)

def get_operation_service(session: Annotated[Session, Depends(get_db_session)]) -> OperationService:
    repository = OperationRepository(session)
    return OperationService(repository=repository)

def get_consumable_service(session: Annotated[Session, Depends(get_db_session)]) -> ConsumableService:
    repository = ConsumableRepository(session)
    return ConsumableService(repository=repository)

def get_technician_service(session: Annotated[Session, Depends(get_db_session)]) -> TechnicianService:
    repository = TechnicianRepository(session)
    visitas_repository = VisitsRepository(session)
    operations_repository = OperationRepository(session)
    return TechnicianService(repository=repository, visitas_repository=visitas_repository, operations_repository=operations_repository)

def get_system_service(session: Annotated[Session, Depends(get_db_session)]) -> SystemService:
    technician_repository = TechnicianRepository(session)
    return SystemService(technician_repository=technician_repository)

def get_audit_service(session: Annotated[Session, Depends(get_db_session)]) -> AuditService:
    repository = AuditRepository(session)
    return AuditService(repository=repository)

EmpaqueServiceDependency = Annotated[EmpaqueService, Depends(get_empaque_service)]
MachineServiceDependency = Annotated[MachineService, Depends(get_machine_service)]
OperationServiceDependency = Annotated[OperationService, Depends(get_operation_service)]
ConsumableServiceDependency = Annotated[ConsumableService, Depends(get_consumable_service)]
TechnicianServiceDependency = Annotated[TechnicianService, Depends(get_technician_service)]
SystemServiceDependency = Annotated[SystemService, Depends(get_system_service)]
AuditServiceDependency = Annotated[AuditService, Depends(get_audit_service)]