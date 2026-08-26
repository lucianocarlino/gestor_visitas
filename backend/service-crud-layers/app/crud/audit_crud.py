from datetime import datetime

from sqlalchemy import Select, select
from sqlalchemy.orm import Session

from app.models.audit import AuditEntryModel
from app.schemas.api_contracts import AuditEntryCreateRequest, AuditLogFilters


class AuditRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def read_all(self, filters: AuditLogFilters) -> list[AuditEntryModel]:
        statement = select(AuditEntryModel)
        statement = self._apply_filters(statement, filters)
        statement = statement.order_by(AuditEntryModel.timestamp.desc())
        if filters.limit is not None:
            statement = statement.limit(filters.limit)
        return list(self.db.scalars(statement).all())

    def create(self, data: AuditEntryCreateRequest) -> AuditEntryModel:
        values = data.model_dump(exclude_none=True)
        aliases = {
            "userId": "user_id", "userName": "user_name", "userRole": "user_role",
            "targetId": "target_id", "targetName": "target_name",
            "previousValue": "previous_value", "newValue": "new_value", "metadata": "metadata_json",
        }
        normalized = {aliases.get(field, field): value for field, value in values.items()}
        model = AuditEntryModel(**normalized)
        self.db.add(model)
        self.db.flush()
        self.db.refresh(model)
        return model

    def _apply_filters(
        self, statement: Select[tuple[AuditEntryModel]], filters: AuditLogFilters,
    ) -> Select[tuple[AuditEntryModel]]:
        if filters.category:
            statement = statement.where(AuditEntryModel.category == filters.category)
        if filters.userId:
            statement = statement.where(AuditEntryModel.user_id == filters.userId)
        if filters.search:
            statement = statement.where(AuditEntryModel.details.ilike(f"%{filters.search}%"))
        if filters.startDate:
            statement = statement.where(AuditEntryModel.timestamp >= datetime.fromisoformat(filters.startDate))
        if filters.endDate:
            statement = statement.where(AuditEntryModel.timestamp <= datetime.fromisoformat(filters.endDate))
        return statement
