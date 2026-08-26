from datetime import datetime

from pydantic import JsonValue
from sqlalchemy import DateTime, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.common import generate_id
from app.schemas.domain import AuditEntry


class AuditEntryModel(Base):
    __tablename__ = "audit_entries"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    user_id: Mapped[str] = mapped_column(String(36), index=True)
    user_name: Mapped[str] = mapped_column(String(150))
    user_role: Mapped[str | None] = mapped_column(String(20))
    category: Mapped[str] = mapped_column(String(30), index=True)
    action: Mapped[str] = mapped_column(String(30), index=True)
    target_id: Mapped[str] = mapped_column(String(80), index=True)
    target_name: Mapped[str] = mapped_column(String(150))
    details: Mapped[str] = mapped_column(Text)
    previous_value: Mapped[str | None] = mapped_column(Text)
    new_value: Mapped[str | None] = mapped_column(Text)
    metadata_json: Mapped[dict[str, JsonValue] | None] = mapped_column(JSON)

    def to_domain(self) -> "AuditEntry":
        return AuditEntry(
            id=self.id,
            timestamp=self.timestamp,
            user_id=self.user_id,
            user_name=self.user_name,
            user_role=self.user_role,
            category=self.category,
            action=self.action,
            target_id=self.target_id,
            target_name=self.target_name,
            details=self.details,
            previous_value=self.previous_value,
            new_value=self.new_value,
            metadata=self.metadata_json
        )
