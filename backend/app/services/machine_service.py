from app.crud.machine_crud import MachineRepository
from app.schemas.api_contracts import (
    CabezalCreateRequest, CabezalUpdateRequest, CaseteraCreateRequest,
    CaseteraUpdateRequest, EquipmentByLocationResponse, FrenoCreateRequest,
    FrenoUpdateRequest, MovimientoCreateRequest,
)
from app.schemas.domain import Cabezal, Casetera, Freno, Movimiento
from app.services.base import DatabaseBackedService


class MachineService(DatabaseBackedService):
    def __init__(self, repository: MachineRepository) -> None:
        self.repository = repository

    def equipment_by_location(self, empaque_id: str) -> EquipmentByLocationResponse:
        cabezales = self.repository.read_all_cabezales_from_empaque(empaque_id)
        caseteras = self.repository.read_all_caseteras_from_empaque(empaque_id)
        frenos = self.repository.read_all_frenos_from_empaque(empaque_id)

        return EquipmentByLocationResponse(
            empaque_id=empaque_id,
            cabezales=[cabezal.to_domain() for cabezal in cabezales],
            caseteras=[casetera.to_domain() for casetera in caseteras],
            frenos=[freno.to_domain() for freno in frenos],
            total=len(cabezales) + len(caseteras) + len(frenos)
        )

    def list_movements(self) -> list[Movimiento]:
        return [movimiento.to_domain() for movimiento in self.repository.get_all_movements()]

    def create_movement(self, data: MovimientoCreateRequest) -> Movimiento:
        return self.repository.create_movement(data).to_domain()


    def list_cabezales(self) -> list[Cabezal]:
        return self.repository.read_all_cabezales()

    def create_cabezal(self, data: CabezalCreateRequest) -> Cabezal:
        return self.repository.create_cabezal(data).to_domain()

    def update_cabezal(self, machine_id: str, data: CabezalUpdateRequest) -> Cabezal:
        return self.repository.update_cabezal(machine_id, data).to_domain()

    def delete_cabezal(self, machine_id: str) -> bool:
        return self.repository.delete_cabezal(machine_id)

    def list_caseteras(self) -> list[Casetera]:
        return [casetera.to_domain() for casetera in self.repository.read_all_caseteras()]

    def create_casetera(self, data: CaseteraCreateRequest) -> Casetera:
        return self.repository.create_casetera(data).to_domain()

    def update_casetera(self, number: int, data: CaseteraUpdateRequest) -> Casetera:
        return self.repository.update_casetera(number, data).to_domain()

    def delete_casetera(self, number: int) -> bool:
        return self.repository.delete_casetera(number)

    def list_frenos(self) -> list[Freno]:
        return [freno.to_domain() for freno in self.repository.read_all_frenos()]

    def create_freno(self, data: FrenoCreateRequest) -> Freno:
        return self.repository.create_freno(data).to_domain()

    def update_freno(self, machine_id: str, data: FrenoUpdateRequest) -> Freno:
        return self.repository.update_freno(machine_id, data).to_domain()

    def delete_freno(self, machine_id: str) -> bool:
        return self.repository.delete_freno(machine_id)
