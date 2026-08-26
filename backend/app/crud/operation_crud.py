from sqlalchemy.orm import Session
from app.models.operation import ReemplazoModel, CambioModel, ServicioModel
from app.schemas.domain import Reemplazo, CreateReeplaceDTO, Cambio, Servicio, CreateCambioDTO, CreateServiceDTO


class OperationRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_replacements(self) -> list[Reemplazo]:
        return [reemplazo.to_domain() for reemplazo in self.db.query(ReemplazoModel).all()]

    def create_replacement(self, data: CreateReeplaceDTO) -> Reemplazo:
        try:
            db_replacement = ReemplazoModel(**data.dict())
            self.db.add(db_replacement)
            self.db.commit()
            self.db.refresh(db_replacement)
            return db_replacement.to_domain()
        except Exception as e:
            self.db.rollback()
            print("Error al crear el reemplazo:", e)
            return None

    def get_brake_changes(self) -> list[Cambio]:
        try:
            return [cambio.to_domain() for cambio in self.db.query(CambioModel).all()]
        except Exception as e:
            print("Error al obtener los cambios de freno:", e)
            return []

    def create_brake_change(self, data: CreateCambioDTO) -> Cambio:
        try:
            db_brake_change = CambioModel(**data.dict())
            self.db.add(db_brake_change)
            self.db.commit()
            self.db.refresh(db_brake_change)
            return db_brake_change.to_domain()
        except Exception as e:
            self.db.rollback()
            print("Error al crear el cambio de freno:", e)
            return None

    def get_services(self) -> list[Servicio]:
        try:
            return [servicio.to_domain() for servicio in self.db.query(ServicioModel).all()]
        except Exception as e:
            print("Error al obtener los servicios:", e)
            return []

    def create_service(self, data: CreateServiceDTO) -> Servicio:
        try:
            db_service = ServicioModel(**data.dict())
            self.db.add(db_service)
            self.db.commit()
            self.db.refresh(db_service)
            return db_service.to_domain()
        except Exception as e:
            self.db.rollback()
            print("Error al crear el servicio:", e)
            return None