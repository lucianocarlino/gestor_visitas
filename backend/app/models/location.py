from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin
from app.models.common import generate_id
from app.schemas.api_contracts import EmpaqueUpdateRequest

from app.schemas.domain import Empaque, Banco, CreateEmpaqueDTO


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

    @classmethod
    def from_create_dto(cls, data: CreateEmpaqueDTO) -> "EmpaqueModel":
        kwargs: dict[str, object] = {
            "nombre": data.nombre,
            "ubicacion": data.ubicacion,
            "latitud": data.latitud,
            "longitud": data.longitud,
            "servicio": data.servicio,
            "distancia": data.distancia,
        }
        if data.id is not None:
            kwargs["id"] = data.id

        empaque = cls(**kwargs)
        empaque.bancos = [BancoModel.from_domain(item) for item in data.bancos]
        return empaque

    @classmethod
    def from_update_dto(
            cls,
            current: "EmpaqueModel",
            data: EmpaqueUpdateRequest,
    ) -> "EmpaqueModel":
        if data.nombre is not None:
            current.nombre = data.nombre
        if data.ubicacion is not None:
            current.ubicacion = data.ubicacion
        if data.latitud is not None:
            current.latitud = data.latitud
        if data.longitud is not None:
            current.longitud = data.longitud
        if data.servicio is not None:
            current.servicio = data.servicio
        if data.distancia is not None:
            current.distancia = data.distancia
        if data.ultima_visita is not None:
            current.ultima_visita = datetime.fromisoformat(
                data.ultima_visita.replace("Z", "+00:00")
            )
        if data.bancos is not None:
            current.bancos = [BancoModel.from_domain(item) for item in data.bancos]
        return current

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

    @classmethod
    def from_domain(cls, data: Banco) -> "BancoModel":
        return cls(
            id=data.id,
            fecha_instalacion=date.fromisoformat(data.fecha_instalacion),
            lineas=data.lineas,
        )

    def to_domain(self) -> Banco:
        return Banco(
            id=self.id,
            fecha_instalacion=self.fecha_instalacion.isoformat(),
            lineas=self.lineas,
        )
