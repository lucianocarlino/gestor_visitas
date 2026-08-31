from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session

from app.models.machine import CabezalModel, CaseteraModel, FrenoModel, MovimientoModel
from app.schemas.api_contracts import MovimientoCreateRequest, CabezalCreateRequest, CabezalUpdateRequest, \
    CaseteraUpdateRequest, CaseteraCreateRequest, FrenoCreateRequest, FrenoUpdateRequest


class MachineRepository:
    def __init__(self, db: Session):
        self.db = db

    def read_all_cabezales(self) -> list[CabezalModel]:
        try:
            all_cabezales = self.db.query(CabezalModel).all()
            return all_cabezales
        except Exception as e:
            self.db.rollback()
            print("Error al leer todos los cabezales:", e)
            return []

    def read_all_caseteras(self) -> list[CaseteraModel]:
        try:
            all_caseteras = self.db.query(CaseteraModel).all()
            return all_caseteras
        except Exception as e:
            self.db.rollback()
            print("Error al leer todas las caseteras:", e)
            return []

    def read_all_frenos(self) -> list[FrenoModel]:
        try:
            all_frenos = self.db.query(FrenoModel).all()
            return all_frenos
        except Exception as e:
            self.db.rollback()
            print("Error al leer todos los frenos:", e)
            return []

    def read_all_cabezales_from_empaque(self, ubicacion: str) -> list[CabezalModel]:
        try:
            all_cabezales = self.db.query(CabezalModel).filter(CabezalModel.ubicacion == ubicacion).all()
            return all_cabezales
        except Exception as e:
            self.db.rollback()
            print(f"Error al leer todos los cabezales del empaque {ubicacion}:", e)
            return []

    def read_all_caseteras_from_empaque(self, ubicacion: str) -> list[CaseteraModel]:
        try:
            all_caseteras = self.db.query(CaseteraModel).filter(CaseteraModel.ubicacion == ubicacion).all()
            return all_caseteras
        except Exception as e:
            self.db.rollback()
            print(f"Error al leer todas las caseteras del empaque {ubicacion}:", e)
            return []

    def read_all_frenos_from_empaque(self, ubicacion: str) -> list[FrenoModel]:
        try:
            all_frenos = self.db.query(FrenoModel).filter(FrenoModel.ubicacion == ubicacion).all()
            return all_frenos
        except Exception as e:
            self.db.rollback()
            print(f"Error al leer todos los frenos del empaque {ubicacion}:", e)
            return []

    def get_all_movements(self) -> list[MovimientoModel]:
        try:
            all_movements = self.db.query(MovimientoModel).all()
            return all_movements
        except Exception as e:
            self.db.rollback()
            print("Error al leer todos los movimientos:", e)
            return []

    def create_movement(self, data: MovimientoCreateRequest) -> MovimientoModel | None:
        try:
            new_movement = MovimientoModel.from_create_request(data)
            self.db.add(new_movement)
            self.db.refresh(new_movement)
            return new_movement
        except Exception as e:
            self.db.rollback()
            print("Error al crear un nuevo movimiento:", e)
            return None

    def create_cabezal(self, data:CabezalCreateRequest) -> CabezalModel:
        try:
            new_cabezal = CabezalModel.from_create_request(data)
            self.db.add(new_cabezal)
            self.db.flush()
            self.db.refresh(new_cabezal)
            return new_cabezal
        except Exception as e:
            self.db.rollback()
            print("Error al crear un nuevo cabezal:", e)
            return None

    def update_cabezal(self, machine_id: str, data: CabezalUpdateRequest) -> CabezalModel:
        try:
            cabezal = self.db.query(CabezalModel).filter(CabezalModel.id == machine_id).first()
            if not cabezal:
                print(f"No se encontró el cabezal con machine_id {machine_id}")
                return None
            cabezal = cabezal.from_update_dto(cabezal, data)
            self.db.flush()
            self.db.refresh(cabezal)
            return cabezal
        except Exception as e:
            self.db.rollback()
            print(f"Error al actualizar el cabezal con machine_id {machine_id}:", e)
            return None

    def delete_cabezal(self, machine_id: str) -> bool:
        try:
            cabezal = self.db.query(CabezalModel).filter(CabezalModel.id == machine_id).first()
            if not cabezal:
                print(f"No se encontró el cabezal con machine_id {machine_id}")
                return False
            self.db.delete(cabezal)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            print(f"Error al eliminar el cabezal con machine_id {machine_id}:", e)
            return False

    def create_casetera(self, data: CaseteraCreateRequest) -> CaseteraModel:
        try:
            new_casetera = CaseteraModel.from_create_request(data)
            self.db.add(new_casetera)
            self.db.flush()
            self.db.refresh(new_casetera)
            return new_casetera
        except Exception as e:
            self.db.rollback()
            print("Error al crear una nueva casetera:", e)
            return None

    def update_casetera(self, number: int, data: CaseteraUpdateRequest) -> CaseteraModel:
        try:
            casetera = self.db.query(CaseteraModel).filter(CaseteraModel.numero == number).first()
            if not casetera:
                print(f"No se encontró la casetera con número {number}")
                return None
            casetera = casetera.from_update_dto(casetera, data)
            self.db.flush()
            self.db.refresh(casetera)
            return casetera
        except Exception as e:
            self.db.rollback()
            print(f"Error al actualizar la casetera con número {number}:", e)
            return None

    def delete_casetera(self, number: int) -> bool:
        try:
            casetera = self.db.query(CaseteraModel).filter(CaseteraModel.numero == number).first()
            if not casetera:
                print(f"No se encontró la casetera con número {number}")
                return False
            self.db.delete(casetera)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            print(f"Error al eliminar la casetera con número {number}:", e)
            return False

    def create_freno(self, data: FrenoCreateRequest) -> FrenoModel:
        try:
            new_freno = FrenoModel.from_create_request(data)
            self.db.add(new_freno)
            self.db.flush()
            self.db.refresh(new_freno)
            return new_freno
        except Exception as e:
            self.db.rollback()
            print("Error al crear un nuevo freno:", e)
            return None

    def update_freno(self, machine_id: str, data: FrenoUpdateRequest) -> FrenoModel:
        try:
            freno = self.db.query(FrenoModel).filter(FrenoModel.id == machine_id).first()
            if not freno:
                print(f"No se encontró el freno con machine_id {machine_id}")
                return None

            freno = freno.from_update_dto(freno, data)
            self.db.flush()
            self.db.refresh(freno)
            return freno
        except Exception as e:
            self.db.rollback()
            print(f"Error al actualizar el freno con machine_id {machine_id}:", e)
            return None

    def delete_freno(self, machine_id: str) -> bool:
        try:
            freno = self.db.query(FrenoModel).filter(FrenoModel.id == machine_id).first()
            if not freno:
                print(f"No se encontró el freno con machine_id {machine_id}")
                return False
            self.db.delete(freno)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            print(f"Error al eliminar el freno con machine_id {machine_id}:", e)
            return False

    def create_various_cabezal(self, data: list[CabezalCreateRequest]) -> bool:
        try:
            new_cabezales = [CabezalModel.from_create_request(item) for item in data]
            self.db.add_all(new_cabezales)
            self.db.flush()
            for cabezal in new_cabezales:
                self.db.refresh(cabezal)
            return True
        except Exception as e:
            self.db.rollback()
            print("Error al crear varios cabezales:", e)
            return False

    def create_various_casetera(self, data: list[CaseteraCreateRequest]) -> bool:
        try:
            new_caseteras = [CaseteraModel.from_create_request(item) for item in data]
            self.db.add_all(new_caseteras)
            self.db.flush()
            for casetera in new_caseteras:
                self.db.refresh(casetera)
            return True
        except Exception as e:
            self.db.rollback()
            print("Error al crear varias caseteras:", e)
            return False

    def create_various_freno(self, data: list[FrenoCreateRequest]) -> bool:
        try:
            new_frenos = [FrenoModel.from_create_request(item) for item in data]
            self.db.add_all(new_frenos)
            self.db.flush()
            for freno in new_frenos:
                self.db.refresh(freno)
            return True
        except Exception as e:
            self.db.rollback()
            print("Error al crear varios frenos:", e)
            return False

    def get_movements_by_machine_id(self, machine_id: str) -> list[MovimientoModel]:
        try:
            movements = self.db.query(MovimientoModel).filter(MovimientoModel.machine_id == machine_id).all()
            return movements
        except Exception as e:
            self.db.rollback()
            print(f"Error al leer los movimientos de la máquina con ID {machine_id}:", e)
            return []