from datetime import date, datetime

from sqlalchemy import Date, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin
from app.models.common import generate_id
from app.schemas.domain import Tecnico


class TecnicoModel(TimestampMixin, Base):
    __tablename__ = "tecnicos"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    nombre: Mapped[str] = mapped_column(String(150), index=True)
    ultima_conexion: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    estado: Mapped[str] = mapped_column(String(30), default="Disponible")
    cumpleanos: Mapped[date | None] = mapped_column(Date)
    rol: Mapped[str] = mapped_column(String(20), default="tecnico")
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))

    def to_domain(self) -> Tecnico:
        return Tecnico(
            id=self.id,
            nombre=self.nombre,
            ultima_conexion=self.ultima_conexion.strftime("%Y-%m-%d %H:%M:%S") if self.ultima_conexion else "",
            estado=self.estado,
            cumpleanos=self.cumpleanos.strftime("%Y-%m-%d"),
            rol=self.rol,
            email=self.email,
        )
