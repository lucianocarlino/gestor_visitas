from app.crud.audit_crud import AuditRepository
from app.models.audit import AuditEntryModel
from app.schemas.api_contracts import AuditEntryCreateRequest, AuditLogFilters
from app.schemas.domain import AuditEntry


class AuditService:
    def __init__(self, repository: AuditRepository) -> None:
        self.repository = repository

    def list_entries(self, filters: AuditLogFilters) -> list[AuditEntry]:
        return [self._domain(item) for item in self.repository.read_all(filters)]

    def create_entry(self, data: AuditEntryCreateRequest) -> AuditEntry:
        return self._domain(self.repository.create(data))

    @staticmethod
    def _domain(model: AuditEntryModel) -> AuditEntry:
        return AuditEntry(
            id=model.id, timestamp=model.timestamp.isoformat(), userId=model.user_id,
            userName=model.user_name, userRole=model.user_role, category=model.category,
            action=model.action, targetId=model.target_id, targetName=model.target_name,
            details=model.details, previousValue=model.previous_value,
            newValue=model.new_value, metadata=model.metadata_json,
        )
