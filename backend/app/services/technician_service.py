from app.crud.operation_crud import OperationRepository
from app.crud.visit_crud import VisitsRepository
from app.schemas.api_contracts import TecnicoCreateRequest, TecnicoStats, TecnicoUpdateRequest
from app.schemas.domain import Tecnico, Visita
from app.services.base import DatabaseBackedService


class TechnicianService(DatabaseBackedService):

    def __init__(self, repository, visitas_repository: VisitsRepository, operations_repository: OperationRepository):
        self.repository = repository
        self.visitas_repository = visitas_repository
        self.operations_repository = operations_repository

    def list_all(self) -> list[Tecnico]:
        return [tecnico.to_domain() for tecnico in self.repository.get_all_technician()]

    def activity_stats(self) -> list[TecnicoStats]:
        tecnicos = self.repository.get_all_technician()
        visitas = self.visitas_repository.get_all_visits()
        reemplazos = self.operations_repository.get_replacements()
        cambios = self.operations_repository.get_brake_changes()
        servicios = self.operations_repository.get_services()

        return []

    def create(self, data: TecnicoCreateRequest) -> Tecnico:
        try:
            return self.repository.create_technician(data).to_domain()
        except Exception as e:
            print(f"Error creating technician: {e}")
            return Tecnico.empty()

    def update(self, technician_id: str, data: TecnicoUpdateRequest) -> Tecnico:
        try:
            return self.repository.update_technician(technician_id, data).to_domain()
        except Exception as e:
            print(f"Error updating technician: {e}")
            return Tecnico.empty()

    def delete(self, technician_id: str) -> bool:
        try:
            return self.repository.delete_technician(technician_id)
        except Exception as e:
            print(f"Error deleting technician: {e}")
            return False
