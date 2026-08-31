from sentry_sdk.traces import new_trace
from sqlalchemy.orm import Session

from app.models.technician import TecnicoModel
from app.schemas.api_contracts import TecnicoCreateRequest, TecnicoUpdateRequest

class TechnicianRepository:
    def __init__(self, db: Session):
        self.db = db
        
    def get_all_technician(self) -> list[TecnicoModel]:
        return self.db.query(TecnicoModel).all()

    def get_technician(self, tecnico_id: str) -> TecnicoModel:
        try:
            technician = self.db.query(TecnicoModel).filter(TecnicoModel.id == tecnico_id).first()
            if technician is not None:
                return technician
            else:
                return TecnicoModel()
        except Exception as e:
            print(f"Error retrieving technician: {e}")
            return TecnicoModel()

    def create_technician(self, tecnico: TecnicoCreateRequest) -> TecnicoModel:
        try:
            new_tecnico = TecnicoModel()
            new_tecnico.email = tecnico.email
            new_tecnico.nombre = tecnico.nombre
            new_tecnico.password_hash = tecnico.password
            new_tecnico.cumpleanos = tecnico.cumpleanos
            new_tecnico.estado = tecnico.estado
            new_tecnico.rol = tecnico.rol
            self.db.add(new_tecnico)
            self.db.commit()
            self.db.refresh(new_tecnico)
            return new_tecnico
        except Exception as e:
            print(f"Error creating technician: {e}")
            return TecnicoModel()

    def update_technician(self, tecnico_id: int, tecnico: TecnicoUpdateRequest) -> TecnicoModel:
        try:
            db_tecnico = self.get_technician(tecnico_id)
            if not db_tecnico:
                return None
            db_tecnico.rol = tecnico.rol
            db_tecnico.nombre = tecnico.nombre
            db_tecnico.estado = tecnico.estado
            db_tecnico.email = tecnico.email
            db_tecnico.password_hash = tecnico.password
            self.db.commit()
            self.db.refresh(db_tecnico)
            return db_tecnico
        except Exception as e:
            print(f"Error updating technician: {e}")
            return TecnicoModel()

    def delete_technician(self, tecnico_id: int) -> bool:
        try:
            db_tecnico = self.get_technician(tecnico_id)
            if not db_tecnico:
                return False
            self.db.delete(db_tecnico)
            self.db.commit()
            return True
        except Exception as e:
            print(f"Error deleting technician: {e}")
            return False

    def get_technician_by_email(self, email: str) -> TecnicoModel:
        try:
            tech = self.db.query(TecnicoModel).filter(TecnicoModel.email == email).first()
            if tech is not None:
                return tech
            else:
                return TecnicoModel()
        except Exception as e:
            print(f"Error retrieving technician by email: {e}")
            return TecnicoModel.empty()