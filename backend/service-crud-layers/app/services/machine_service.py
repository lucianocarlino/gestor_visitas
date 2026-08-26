from app.crud.machine_crud import MachineRepository
from app.models.machine import CabezalModel, CaseteraModel, FrenoModel
from app.schemas.api_contracts import (
    CabezalCreateRequest, CabezalUpdateRequest, CaseteraCreateRequest,
    CaseteraUpdateRequest, EquipmentByLocationResponse, FrenoCreateRequest,
    FrenoUpdateRequest, MovimientoCreateRequest,
)
from app.schemas.domain import Cabezal, Casetera, Freno, Movimiento
from app.services.exceptions import EntityNotFoundError


class MachineService:
    def __init__(self, repository: MachineRepository) -> None:
        self.repository = repository

    def equipment_by_location(self, empaque_id: str) -> EquipmentByLocationResponse:
        heads, cassettes, brakes = self.repository.read_by_location(empaque_id)
        return EquipmentByLocationResponse(
            cabezales=[self._cabezal(item) for item in heads],
            caseteras=[self._casetera(item) for item in cassettes],
            frenos=[self._freno(item) for item in brakes],
        )

    def list_movements(self) -> list[Movimiento]:
        return [Movimiento.model_validate(item, from_attributes=True) for item in self.repository.read_movements()]

    def create_movement(self, data: MovimientoCreateRequest) -> Movimiento:
        return Movimiento.model_validate(self.repository.create_movement(data), from_attributes=True)

    def list_cabezales(self) -> list[Cabezal]:
        return [self._cabezal(item) for item in self.repository.read_cabezales()]

    def create_cabezal(self, data: CabezalCreateRequest) -> Cabezal:
        return self._cabezal(self.repository.create_cabezal(data))

    def update_cabezal(self, machine_id: str, data: CabezalUpdateRequest) -> Cabezal:
        model = self.repository.read_cabezal(machine_id)
        if model is None:
            raise EntityNotFoundError("Cabezal", machine_id)
        return self._cabezal(self.repository.update_cabezal(model, data))

    def delete_cabezal(self, machine_id: str) -> bool:
        model = self.repository.read_cabezal(machine_id)
        if model is None:
            raise EntityNotFoundError("Cabezal", machine_id)
        self.repository.delete_cabezal(model)
        return True

    def list_caseteras(self) -> list[Casetera]:
        return [self._casetera(item) for item in self.repository.read_caseteras()]

    def create_casetera(self, data: CaseteraCreateRequest) -> Casetera:
        return self._casetera(self.repository.create_casetera(data))

    def update_casetera(self, number: int, data: CaseteraUpdateRequest) -> Casetera:
        model = self.repository.read_casetera(number)
        if model is None:
            raise EntityNotFoundError("Casetera", str(number))
        return self._casetera(self.repository.update_casetera(model, data))

    def delete_casetera(self, number: int) -> bool:
        model = self.repository.read_casetera(number)
        if model is None:
            raise EntityNotFoundError("Casetera", str(number))
        self.repository.delete_casetera(model)
        return True

    def list_frenos(self) -> list[Freno]:
        return [self._freno(item) for item in self.repository.read_frenos()]

    def create_freno(self, data: FrenoCreateRequest) -> Freno:
        return self._freno(self.repository.create_freno(data))

    def update_freno(self, machine_id: str, data: FrenoUpdateRequest) -> Freno:
        model = self.repository.read_freno(machine_id)
        if model is None:
            raise EntityNotFoundError("Freno", machine_id)
        return self._freno(self.repository.update_freno(model, data))

    def delete_freno(self, machine_id: str) -> bool:
        model = self.repository.read_freno(machine_id)
        if model is None:
            raise EntityNotFoundError("Freno", machine_id)
        self.repository.delete_freno(model)
        return True

    @staticmethod
    def _cabezal(model: CabezalModel) -> Cabezal:
        return Cabezal(id=model.id, tipo="Cabezal", estado=model.estado,
                       ubicacion=model.ubicacion, freno_actual_id=model.freno_actual_id,
                       historial_movimientos=[])

    @staticmethod
    def _casetera(model: CaseteraModel) -> Casetera:
        return Casetera(id=model.numero, tipo="Casetera", estado=model.estado,
                        ubicacion=model.ubicacion, historial_movimientos=[])

    @staticmethod
    def _freno(model: FrenoModel) -> Freno:
        return Freno(id=model.id, tipo="Freno", fecha_inicio=model.fecha_inicio.isoformat(),
                     estado=model.estado, cabezal_id=model.cabezal_id,
                     ubicacion=model.ubicacion, historial_movimientos=[])
