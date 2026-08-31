from datetime import date, datetime

from sqlalchemy import Date, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin
from app.models.common import generate_id
from app.schemas.api_contracts import TecnicoCreateRequest
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

    @classmethod
    def from_create_request(cls, data: TecnicoCreateRequest) -> "TecnicoModel":
        kwargs: dict[str, object] = {}
        if data.id is not None:
            kwargs["id"] = data.id
        if data.nombre is not None:
            kwargs["nombre"] = data.nombre
        if data.ultima_conexion is not None:
            kwargs["ultima_conexion"] = datetime.fromisoformat(data.ultima_conexion.replace("Z", "+00:00"))
        if data.estado is not None:
            kwargs["estado"] = data.estado
        if data.cumpleanos is not None:
            kwargs["cumpleanos"] = date.fromisoformat(data.cumpleanos)
        if data.rol is not None:
            kwargs["rol"] = data.rol
        if data.email is not None:
            kwargs["email"] = data.email
        if data.password is not None:
            kwargs["password_hash"] = data.password
        return cls(**kwargs)

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
