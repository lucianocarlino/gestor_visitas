from app.crud.consumable_crud import ConsumableRepository
from app.crud.empaque_crud import EmpaqueRepository
from app.crud.operation_crud import OperationRepository
from app.crud.technician_crud import TechnicianRepository
from app.crud.machine_crud import MachineRepository
from app.schemas.api_contracts import ServiceCreateResponse, FrenoUpdateRequest, CabezalUpdateRequest, \
    CaseteraUpdateRequest, ConsumibleUpdateRequest
from app.schemas.domain import Cambio, CreateCambioDTO, CreateReeplaceDTO, CreateServiceDTO, Reemplazo, Servicio, \
    Status, Consumible
from app.services.base import DatabaseBackedService


class OperationService():
    def __init__(self, repository: OperationRepository, technician_repository: TechnicianRepository, empaques_repository: EmpaqueRepository, machines_repository: MachineRepository, consumable_repository: ConsumableRepository) -> None:
        self.repository = repository
        self.technician_repository = technician_repository
        self.empaques_repository = empaques_repository
        self.machines_repository = machines_repository
        self.consumable_repository = consumable_repository
        self.taller = self.empaques_repository.get_taller()

    def list_replacements(self) -> list[Reemplazo]:
        return [reemplazo.to_domain() for reemplazo in self.repository.get_replacements()]

    def create_replacement(self, data: CreateReeplaceDTO) -> Reemplazo:
        tecnico = self.technician_repository.get_technician(data.tecnico_id)
        empaque = self.empaques_repository.get_empaque_by_id(data.empaque_id)
        operation = self.repository.create_replacement(data, empaque.nombre, tecnico.nombre).to_domain()
        if operation is not None:
            if data.retirado_tipo == "Cabezal":
                self.machines_repository.update_cabezal(data.retirado_id, CabezalUpdateRequest(estado=Status("Pendiente"), ubicacion=self.taller.nombre, empaque_id=self.taller.id))
                self.machines_repository.update_cabezal(data.instalado_id, CabezalUpdateRequest(estado=Status("En uso"), ubicacion=empaque.nombre, empaque_id=empaque.id))
            elif data.retirado_tipo == "Casetera":
                self.machines_repository.update_casetera(int(data.retirado_id), CaseteraUpdateRequest(estado=Status("Pendiente"), ubicacion=self.taller.nombre, empaque_id=self.taller.id))
                self.machines_repository.update_casetera(int(data.instalado_id), CaseteraUpdateRequest(estado=Status("En uso"), ubicacion=empaque.nombre, empaque_id=empaque.id))
        return operation

    def list_brake_changes(self) -> list[Cambio]:
        return [cambio.to_domain() for cambio in self.repository.get_brake_changes()]

    def create_brake_change(self, data: CreateCambioDTO) -> Cambio:
        print(f'creo un cambio con: {data}')
        tecnico = self.technician_repository.get_technician(data.tecnico_id).nombre
        empaque = self.empaques_repository.get_empaque_by_id(data.empaque_id)
        change = self.repository.create_brake_change(data, tecnico).to_domain()
        if change is not None:
            if data.freno_retirado_id != "Sin freno":
                self.machines_repository.update_freno(data.freno_retirado_id, FrenoUpdateRequest(estado=Status("Pendiente"), ubicacion=self.taller.nombre, empaque_id=self.taller.id))
            self.machines_repository.update_freno(data.freno_instalado_id, FrenoUpdateRequest(estado=Status("En uso"), ubicacion=empaque.nombre, empaque_id=empaque.id, cabezal_id=data.cabezal_id))
            self.machines_repository.update_cabezal(data.cabezal_id, CabezalUpdateRequest(freno_actual_id=data.freno_instalado_id))
        return change

    def list_services(self) -> list[Servicio]:
       return [servicio.to_domain() for servicio in self.repository.get_services()]

    def create_service(self, data: CreateServiceDTO) -> Servicio:
        tecnico = self.technician_repository.get_technician(data.tecnico_id).nombre
        service = self.repository.create_service(data, tecnico).to_domain()
        if service is not None:
            if data.machine_type == "Cabezal":
                self.machines_repository.update_cabezal(data.machine_id, CabezalUpdateRequest(estado=Status("Listo")))
            elif data.machine_type == "Casetera":
                self.machines_repository.update_casetera(int(data.machine_id), CaseteraUpdateRequest(estado=Status("Listo")))
            elif data.machine_type == "Freno":
                self.machines_repository.update_freno(data.machine_id, FrenoUpdateRequest(estado=Status("Listo")))
            for consumible in data.consumibles:
                qty = self.consumable_repository.get_consumable_by_id(consumible.consumible_id).to_domain().stock - consumible.cantidad
                self.consumable_repository.update_consumable(consumible.consumible_id, ConsumibleUpdateRequest(stock=qty))
        return service
