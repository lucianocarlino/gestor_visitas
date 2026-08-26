from app.crud.technician_crud import TechnicianRepository
from app.models.technician import TecnicoModel
from app.schemas.api_contracts import TecnicoCreateRequest, TecnicoStats, TecnicoUpdateRequest
from app.schemas.domain import Tecnico
from app.services.exceptions import EntityNotFoundError
from app.services.security import hash_password


class TechnicianService:
    def __init__(self, repository: TechnicianRepository) -> None:
        self.repository = repository

    def list_all(self) -> list[Tecnico]:
        return [self._domain(item) for item in self.repository.read_all()]

    def activity_stats(self) -> list[TecnicoStats]:
        return [TecnicoStats(tecnico_id=item[0], tecnico_nombre=item[1],
                             visitas=item[2], horas=item[3])
                for item in self.repository.read_activity()]

    def create(self, data: TecnicoCreateRequest) -> Tecnico:
        if not data.password:
            raise ValueError("La contraseña es obligatoria")
        return self._domain(self.repository.create(data, hash_password(data.password)))

    def update(self, technician_id: str, data: TecnicoUpdateRequest) -> Tecnico:
        model = self._find(technician_id)
        updated = self.repository.update(model, data)
        if data.password:
            updated.password_hash = hash_password(data.password)
        return self._domain(updated)

    def delete(self, technician_id: str) -> bool:
        self.repository.delete(self._find(technician_id))
        return True

    def _find(self, technician_id: str) -> TecnicoModel:
        model = self.repository.read_by_id(technician_id)
        if model is None:
            raise EntityNotFoundError("Tecnico", technician_id)
        return model

    @staticmethod
    def _domain(model: TecnicoModel) -> Tecnico:
        return Tecnico(id=model.id, nombre=model.nombre,
                       ultima_conexion=model.ultima_conexion.isoformat() if model.ultima_conexion else "",
                       estado=model.estado, cumpleanos=model.cumpleanos.isoformat() if model.cumpleanos else "",
                       rol=model.rol, email=model.email, password=None)
