from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin
from app.models.common import generate_id


from app.schemas.domain import Empaque, Banco


class EmpaqueModel(TimestampMixin, Base):
    __tablename__ = "empaques"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    nombre: Mapped[str] = mapped_column(String(150), unique=True, index=True)
    ubicacion: Mapped[str] = mapped_column(String(255))
    latitud: Mapped[float] = mapped_column(Float)
    longitud: Mapped[float] = mapped_column(Float)
    servicio: Mapped[bool] = mapped_column(Boolean, default=True)
    distancia: Mapped[float] = mapped_column(Float, default=0)
    ultima_visita: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    bancos: Mapped[list[BancoModel]] = relationship(
        back_populates="empaque", cascade="all, delete-orphan"
    )

    def to_domain(self) -> Empaque:
        return Empaque(
            id=self.id,
            nombre=self.nombre,
            ubicacion=self.ubicacion,
            latitud=self.latitud,
            longitud=self.longitud,
            servicio=self.servicio,
            distancia=self.distancia,
            bancos=[banco.to_domain() for banco in self.bancos],
            ultima_visita=self.ultima_visita.isoformat() if self.ultima_visita else None,
        )


class BancoModel(TimestampMixin, Base):
    __tablename__ = "bancos"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    empaque_id: Mapped[str] = mapped_column(
        ForeignKey("empaques.id", ondelete="CASCADE"), index=True
    )
    fecha_instalacion: Mapped[date] = mapped_column(Date)
    lineas: Mapped[int] = mapped_column(Integer)

    empaque: Mapped[EmpaqueModel] = relationship(back_populates="bancos")

    def to_domain(self) -> Banco:
        return Banco(
            id=self.id,
            fecha_instalacion=self.fecha_instalacion.isoformat(),
            lineas=self.lineas,
        )
