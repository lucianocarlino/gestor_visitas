from datetime import datetime, timezone

from app.crud.consumable_crud import ConsumableRepository
from app.crud.empaque_crud import EmpaqueRepository
from app.crud.machine_crud import MachineRepository
from app.crud.operation_crud import OperationRepository
from app.crud.technician_crud import TechnicianRepository
from app.models.machine import CabezalModel, CaseteraModel
from app.models.operation import ServicioModel
from app.models.technician import TecnicoModel
from app.schemas.api_contracts import ServiceCreateResponse
from app.schemas.domain import (
    Cambio, ConsumibleItem, CreateCambioDTO, CreateReeplaceDTO, CreateServiceDTO,
    Reemplazo, Servicio,
)
from app.services.exceptions import EntityNotFoundError, InsufficientStockError


class OperationService:
    def __init__(
        self, operations: OperationRepository, machines: MachineRepository,
        consumables: ConsumableRepository, empaques: EmpaqueRepository,
        technicians: TechnicianRepository,
    ) -> None:
        self.operations = operations
        self.machines = machines
        self.consumables = consumables
        self.empaques = empaques
        self.technicians = technicians

    def list_replacements(self) -> list[Reemplazo]:
        return [Reemplazo.model_validate(item, from_attributes=True)
                for item in self.operations.read_replacements()]

    def create_replacement(self, data: CreateReeplaceDTO) -> Reemplazo:
        removed = self._replacement_machine(data.retirado_tipo, data.retirado_id)
        installed = self._replacement_machine(data.instalado_tipo, data.instalado_id)
        empaque = self.empaques.read_by_id(data.empaque_id)
        if empaque is None:
            raise EntityNotFoundError("Empaque", data.empaque_id)
        technician = self._technician(data.tecnico_id)
        removed.ubicacion = "Taller"
        installed.ubicacion = empaque.ubicacion
        values: dict[str, object] = {
            **data.model_dump(), "fecha": datetime.now(timezone.utc),
            "empaque_nombre": empaque.nombre,
            "tecnico_nombre": technician.nombre if technician else None,
        }
        model = self.operations.create_replacement(values)
        return Reemplazo.model_validate(model, from_attributes=True)

    def list_brake_changes(self) -> list[Cambio]:
        return [Cambio.model_validate(item, from_attributes=True)
                for item in self.operations.read_changes()]

    def create_brake_change(self, data: CreateCambioDTO) -> Cambio:
        head = self.machines.read_cabezal(data.cabezal_id)
        removed = self.machines.read_freno(data.freno_retirado_id)
        installed = self.machines.read_freno(data.freno_instalado_id)
        if head is None:
            raise EntityNotFoundError("Cabezal", data.cabezal_id)
        if removed is None:
            raise EntityNotFoundError("Freno", data.freno_retirado_id)
        if installed is None:
            raise EntityNotFoundError("Freno", data.freno_instalado_id)
        technician = self._technician(data.tecnico_id)
        head.freno_actual_id = installed.id
        removed.cabezal_id = None
        installed.cabezal_id = head.id
        values = data.model_dump(exclude={"freno_retirado_id", "freno_instalado_id", "empaque_id"})
        values.update({"retirado_freno_id": removed.id, "instalado_freno_id": installed.id,
                       "fecha": datetime.fromisoformat(data.fecha) if data.fecha else datetime.now(timezone.utc),
                       "tecnico_nombre": technician.nombre if technician else None})
        return Cambio.model_validate(self.operations.create_change(values), from_attributes=True)

    def list_services(self) -> list[Servicio]:
        return [self._service(item) for item in self.operations.read_services()]

    def create_service(self, data: CreateServiceDTO) -> ServiceCreateResponse:
        items: list[tuple[str, str, int]] = []
        for requested in data.consumibles:
            model = self.consumables.read_by_id(requested.consumible_id)
            if model is None:
                raise EntityNotFoundError("Consumible", requested.consumible_id)
            if model.stock < requested.cantidad:
                raise InsufficientStockError(model.id)
            model.stock -= requested.cantidad
            items.append((model.id, model.nombre, requested.cantidad))
        technician = self._technician(data.tecnico_id)
        values = data.model_dump(exclude={"consumibles", "fecha"})
        values.update({"fecha": datetime.fromisoformat(data.fecha) if data.fecha else datetime.now(timezone.utc),
                       "tecnico_nombre": technician.nombre if technician else None})
        model = self.operations.create_service(values, items)
        return ServiceCreateResponse(success=True, service_id=model.id)

    def _replacement_machine(self, machine_type: str, machine_id: str) -> CabezalModel | CaseteraModel:
        model = (self.machines.read_cabezal(machine_id) if machine_type == "Cabezal"
                 else self.machines.read_casetera(int(machine_id)))
        if model is None:
            raise EntityNotFoundError(machine_type, machine_id)
        return model

    def _technician(self, technician_id: str | None) -> TecnicoModel | None:
        if technician_id is None:
            return None
        model = self.technicians.read_by_id(technician_id)
        if model is None:
            raise EntityNotFoundError("Tecnico", technician_id)
        return model

    @staticmethod
    def _service(model: ServicioModel) -> Servicio:
        items = [ConsumibleItem(consumible_id=item.consumible_id, nombre=item.nombre,
                                cantidad=item.cantidad) for item in model.consumibles]
        return Servicio(id=model.id, machine_id=model.machine_id, machine_type=model.machine_type,
                        fecha=model.fecha.isoformat(), resumen=model.resumen,
                        trabajo_hecho=model.trabajo_hecho, consumibles=items,
                        tecnico_id=model.tecnico_id, tecnico_nombre=model.tecnico_nombre)
