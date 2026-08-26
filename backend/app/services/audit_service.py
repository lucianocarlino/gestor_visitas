from app.crud.audit_crud import AuditRepository
from app.schemas.api_contracts import AuditEntryCreateRequest, AuditLogFilters
from app.schemas.domain import AuditEntry
from app.services.base import DatabaseBackedService


class AuditService(DatabaseBackedService):
    def __init__(self, repository: AuditRepository) -> None:
        self.repository = repository
        
    def list_entries(self, filters: AuditLogFilters) -> list[AuditEntry]:
        try:
            return self.repository.get_audit_logs(skip=filters.skip, limit=filters.limit)
        except Exception as e:
            print(f"Error listing audit entries: {str(e)}")
            return []

    def create_entry(self, data: AuditEntryCreateRequest) -> AuditEntry:
        try:
            audit_entry = AuditEntry(
                action=data.action,
                category=data.category,
                description=data.description,
                user_id=data.user_id,
                timestamp=data.timestamp
            )
            return self.repository.create_audit_log(audit_entry)
        except Exception as e:
            print(f"Error creating audit entry: {str(e)}")
            return AuditEntry.empty()
