from sqlalchemy.orm import Session
from app.schemas.domain import AuditEntry
from app.models.audit import AuditEntryModel

class AuditRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_audit_log(self, audit_log) -> AuditEntry:
        try:
            self.db.add(audit_log)
            self.db.commit()
            self.db.refresh(audit_log)
            return audit_log.to_domain()
        except Exception as e:
            print(f"Error creating audit log: {str(e)}")
            return AuditEntry.empty()

    def get_audit_logs(self, skip: int = 0, limit: int = 100) -> list[AuditEntry]:
        try:
            return [audit_log.to_domain() for audit_log in self.db.query(AuditEntryModel).offset(skip).limit(limit).all()]
        except Exception as e:
            print(f"Error retrieving audit logs: {str(e)}")
            return []

    def get_audit_log_by_id(self, audit_log_id: int) -> AuditEntry:
        try:
            return self.db.query(AuditEntryModel).filter(AuditEntryModel.id == audit_log_id).first().to_domain()
        except Exception as e:
            print(f"Error retrieving audit log by ID: {str(e)}")
            return AuditEntry.empty()


    def delete_audit_log(self, audit_log_id: int) -> bool:
        try:
            audit_log = self.get_audit_log_by_id(audit_log_id)
            if audit_log:
                self.db.delete(audit_log)
                self.db.commit()
                return True
            return False
        except Exception as e:
            print(f"Error deleting audit log: {str(e)}")
            return False