from app.crud.operation_crud import OperationRepository
from app.schemas.api_contracts import ServiceCreateResponse
from app.schemas.domain import Cambio, CreateCambioDTO, CreateReeplaceDTO, CreateServiceDTO, Reemplazo, Servicio
from app.services.base import DatabaseBackedService


class OperationService():
    def __init__(self, repository: OperationRepository) -> None:
        self.repository = repository

    def list_replacements(self) -> list[Reemplazo]:
        return self.repository.get_replacements()

    def create_replacement(self, data: CreateReeplaceDTO) -> Reemplazo:
        return self.repository.create_replacement(data)

    def list_brake_changes(self) -> list[Cambio]:
        return self.repository.get_brake_changes()

    def create_brake_change(self, data: CreateCambioDTO) -> Cambio:
       return self.repository.create_brake_change(data)

    def list_services(self) -> list[Servicio]:
       return self.repository.get_services()

    def create_service(self, data: CreateServiceDTO) -> ServiceCreateResponse:
       return self.repository.create_service(data)
