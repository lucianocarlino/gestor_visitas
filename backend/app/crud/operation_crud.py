from sqlalchemy.orm import Session
from app.models.operation import ReemplazoModel, CambioModel, ServicioModel
from app.schemas.domain import Reemplazo, CreateReeplaceDTO, Cambio, Servicio, CreateCambioDTO, CreateServiceDTO


class OperationRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_replacements(self) -> list[ReemplazoModel]:
        return self.db.query(ReemplazoModel).all()

    def get_cabezal_replacements(self, cabezal_id: str) -> list[ReemplazoModel]:
        return self.db.query(ReemplazoModel).filter(ReemplazoModel.instalado_id == cabezal_id or ReemplazoModel.retirado_id == cabezal_id).all()

    def get_casetera_replacements(self, casetera_id: str) -> list[ReemplazoModel]:
        return self.db.query(ReemplazoModel).filter(ReemplazoModel.instalado_id == casetera_id or ReemplazoModel.retirado_id == casetera_id).all()

    def create_replacement(self, data: CreateReeplaceDTO, empaque: str, tecnico: str) -> ReemplazoModel:
        try:
            db_replacement = ReemplazoModel.from_create_dto(data, empaque_nombre=empaque, tecnico_nombre=tecnico)
            self.db.add(db_replacement)
            self.db.flush()
            self.db.refresh(db_replacement)
            return db_replacement
        except Exception as e:
            self.db.rollback()
            print("Error al crear el reemplazo:", e)
            return None

    def get_brake_changes(self) -> list[CambioModel]:
        try:
            return self.db.query(CambioModel).all()
        except Exception as e:
            print("Error al obtener los cambios de freno:", e)
            return []

    def create_brake_change(self, data: CreateCambioDTO, tecnico: str) -> CambioModel:
        try:
            db_brake_change = CambioModel.from_create_dto(data, tecnico_nombre=tecnico)
            self.db.add(db_brake_change)
            self.db.flush()
            self.db.refresh(db_brake_change)
            return db_brake_change
        except Exception as e:
            self.db.rollback()
            print("Error al crear el cambio de freno:", e)
            return None

    def get_services(self) -> list[ServicioModel]:
        try:
            return self.db.query(ServicioModel).all()
        except Exception as e:
            print("Error al obtener los servicios:", e)
            return []

    def get_casetera_services(self, casetera_id: str) -> list[ServicioModel]:
        return self.db.query(ServicioModel).filter(ServicioModel.id == casetera_id).all()

    def get_cabezal_services(self, cabezal_id: str) -> list[ServicioModel]:
        return self.db.query(ServicioModel).filter(ServicioModel.id == cabezal_id).all()

    def create_service(self, data: CreateServiceDTO, tecnico_nombre: str) -> ServicioModel:
        try:
            db_service = ServicioModel.from_create_dto(data, tecnico_nombre=tecnico_nombre)
            self.db.add(db_service)
            self.db.flush()
            self.db.refresh(db_service)
            return db_service
        except Exception as e:
            self.db.rollback()
            print("Error al crear el servicio:", e)
            return None