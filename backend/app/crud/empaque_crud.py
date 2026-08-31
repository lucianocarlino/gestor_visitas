from sqlalchemy.orm import Session
from datetime import date
from app.models.location import EmpaqueModel, BancoModel
from app.schemas.api_contracts import EmpaqueCreateRequest, EmpaqueUpdateRequest
from app.schemas.domain import Empaque

class EmpaqueRepository:
    def __init__(self, db: Session):
        self.db = db

    def read_all(self) -> list[EmpaqueModel]:
        try:
            return self.db.query(EmpaqueModel).all()
        except Exception as e:
            self.db.rollback()
            print("Error al leer todos los empaques:", e)
            return []

    def create_empaque(self, data: EmpaqueCreateRequest) -> EmpaqueModel | None:
        try:
            new_empaque = EmpaqueModel.from_create_dto(data)
            self.db.add(new_empaque)
            self.db.flush()
            self.db.refresh(new_empaque)
            return new_empaque
        except Exception as e:
            self.db.rollback()
            print("Error al crear un empaque:", e)
            return None

    def update(self, empaque_id: str, data: EmpaqueUpdateRequest) -> EmpaqueModel | None:
        try:
            empaque = self.db.query(EmpaqueModel).filter(EmpaqueModel.id == empaque_id).first()
            if not empaque:
                return None
            empaque = empaque.from_update_dto(empaque, data)
            self.db.flush()
            self.db.refresh(empaque)
            return empaque
        except Exception as e:
            self.db.rollback()
            print("Error al modificar un empaque:", e)
            return None

    def _update_bancos(self, empaque: EmpaqueModel, bancos: list[BancoModel]) -> None:
        existing_by_id = {
            banco.id: banco
            for banco in empaque.bancos
        }

        updated_bancos: list[BancoModel] = []

        for banco_data in bancos:
            banco = existing_by_id.get(
                banco_data.id
            )

            installation_date = date.fromisoformat(
                banco_data.fecha_instalacion
            )

            if banco is None:
                banco = BancoModel(
                    id=banco_data.id,
                    fecha_instalacion=installation_date,
                    lineas=banco_data.lineas,
                )
            else:
                banco.fecha_instalacion = installation_date
                banco.lineas = banco_data.lineas

            updated_bancos.append(banco)

        empaque.bancos = updated_bancos

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

    def get_empaque_by_id(self, empaque_id: str) -> Empaque | None:
        try:
            empaque = self.db.query(EmpaqueModel).filter(EmpaqueModel.id == empaque_id).first()
            if not empaque:
                return None
            return empaque.to_domain()
        except Exception as e:
            self.db.rollback()
            print("Error al obtener un empaque por ID:", e)
            return None

    def get_taller(self) -> Empaque | None:
        try:
            taller = self.db.query(EmpaqueModel).filter(EmpaqueModel.nombre == "Taller").first()
            if not taller:
                return None
            return taller.to_domain()
        except Exception as e:
            self.db.rollback()
            print("Error al obtener el taller:", e)
            return None