from sqlalchemy.orm import Session
from app.models.location import EmpaqueModel
from app.schemas.api_contracts import EmpaqueCreateRequest
from app.schemas.domain import Empaque

class EmpaqueRepository:
    def __init__(self, db: Session):
        self.db = db

    def read_all(self) -> list[Empaque]:
        try:
            all_packages = self.db.query(EmpaqueModel).all()
            return [empaque.to_domain() for empaque in all_packages]
        except Exception as e:
            self.db.rollback()
            print("Error al leer todos los empaques:", e)
            return []

    def get_all(self) -> list[EmpaqueModel]:
        try:
            return self.db.query(EmpaqueModel).all()
        except Exception as e:
            self.db.rollback()
            print("Error al leer todos los empaques:", e)
            return []

    def create(self, data: EmpaqueCreateRequest) -> Empaque:
        try:
            new_empaque = EmpaqueModel(data)
            self.db.add(new_empaque)
            self.db.commit()
            self.db.refresh(new_empaque)
            return new_empaque.to_domain()
        except Exception as e:
            self.db.rollback()
            print("Error al crear un empaque:", e)
            return Empaque.empty()

    def update(self, empaque_id: str, data: EmpaqueCreateRequest) -> Empaque:
        try:
            empaque = self.db.query(EmpaqueModel).filter(EmpaqueModel.id == empaque_id).first()
            if not empaque:
                return Empaque.empty()
            for key, value in data.dict().items():
                setattr(empaque, key, value)
            self.db.commit()
            self.db.refresh(empaque)
            return empaque.to_domain()
        except Exception as e:
            self.db.rollback()
            print("Error al modificar un empaque:", e)
            return Empaque.empty()

    def delete(self, empaque_id: str) -> bool:
        try:
            empaque = self.db.query(EmpaqueModel).filter(EmpaqueModel.id == empaque_id).first()
            if not empaque:
                return False
            self.db.delete(empaque)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            print("Error al eliminar un empaque:", e)
            return False

def read_all(db: Session) -> list[Empaque]:
    try:
        all_packages = db.query(EmpaqueModel).all()
        return [empaque.to_domain() for empaque in all_packages]
    except Exception as e:
        db.rollback()
        print("Error al leer todos los empaques:", e)
        return []

def create_empaque(db: Session, data: EmpaqueCreateRequest) -> Empaque:
    try:
        new_empaque = EmpaqueModel(data)
        db.add(new_empaque)
        db.commit()
        db.refresh(new_empaque)
        return new_empaque.to_domain()
    except Exception as e:
        db.rollback()
        print("Error al crear un empaque:", e)
        return Empaque.empty()

def modify_empaque(db: Session, empaque_id: str, data: EmpaqueCreateRequest) -> Empaque:
    try:
        empaque = db.query(EmpaqueModel).filter(EmpaqueModel.id == empaque_id).first()
        if not empaque:
            return Empaque.empty()
        for key, value in data.dict().items():
            setattr(empaque, key, value)
        db.commit()
        db.refresh(empaque)
        return empaque.to_domain()
    except Exception as e:
        db.rollback()
        print("Error al modificar un empaque:", e)
        return Empaque.empty()

def delete_empaque(db: Session, empaque_id: str) -> bool:
    try:
        empaque = db.query(EmpaqueModel).filter(EmpaqueModel.id == empaque_id).first()
        if not empaque:
            return False
        db.delete(empaque)
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        print("Error al eliminar un empaque:", e)
        return False

