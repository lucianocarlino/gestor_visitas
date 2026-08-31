from __future__ import annotations

from datetime import datetime, date, time, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin
from app.models.common import generate_id
from app.schemas.domain import (
    Cambio,
    ConsumibleItem,
    CreateCambioDTO,
    CreateReeplaceDTO,
    CreateServiceDTO,
    Reemplazo,
    Servicio,
)


class ReemplazoModel(TimestampMixin, Base):
    __tablename__ = "reemplazos"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    fecha: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    motivo: Mapped[str] = mapped_column(String(500))
    retirado_id: Mapped[str] = mapped_column(String(80), index=True)
    retirado_tipo: Mapped[str] = mapped_column(String(20))
    instalado_id: Mapped[str] = mapped_column(String(80), index=True)
    instalado_tipo: Mapped[str] = mapped_column(String(20))
    empaque_id: Mapped[str] = mapped_column(ForeignKey("empaques.id"), index=True)
    empaque_nombre: Mapped[str] = mapped_column(String(150))
    tecnico_id: Mapped[str | None] = mapped_column(ForeignKey("tecnicos.id"), index=True)
    tecnico_nombre: Mapped[str | None] = mapped_column(String(150))

    @classmethod
    def from_create_dto(
        cls, data: CreateReeplaceDTO, *, empaque_nombre: str, tecnico_nombre: str | None = None
    ) -> "ReemplazoModel":
        kwargs: dict[str, object] = {
            "fecha": datetime.now(),
            "motivo": data.motivo,
            "retirado_id": data.retirado_id,
            "retirado_tipo": data.retirado_tipo,
            "instalado_id": data.instalado_id,
            "instalado_tipo": data.instalado_tipo,
            "empaque_id": data.empaque_id,
            "empaque_nombre": empaque_nombre,
        }
        if data.tecnico_id is not None:
            kwargs["tecnico_id"] = data.tecnico_id
        if tecnico_nombre is not None:
            kwargs["tecnico_nombre"] = tecnico_nombre
        return cls(**kwargs)

    def to_domain(self) -> Reemplazo:
        return Reemplazo(
            id=self.id,
            fecha=self.fecha.strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
            motivo=self.motivo,
            retirado_id=self.retirado_id,
            retirado_tipo=self.retirado_tipo,
            instalado_id=self.instalado_id,
            instalado_tipo=self.instalado_tipo,
            empaque_id=self.empaque_id,
            empaque_nombre=self.empaque_nombre,
            tecnico_id=self.tecnico_id,
            tecnico_nombre=self.tecnico_nombre
        )


class CambioModel(TimestampMixin, Base):
    __tablename__ = "cambios"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    fecha: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    motivo: Mapped[str] = mapped_column(String(500))
    lugar: Mapped[str] = mapped_column(String(255))
    retirado_freno_id: Mapped[str | None] = mapped_column(ForeignKey("frenos.id"), index=True, nullable=True)
    instalado_freno_id: Mapped[str] = mapped_column(ForeignKey("frenos.id"), index=True)
    cabezal_id: Mapped[str] = mapped_column(ForeignKey("cabezales.id"), index=True)
    tecnico_id: Mapped[str | None] = mapped_column(ForeignKey("tecnicos.id"), index=True)
    tecnico_nombre: Mapped[str | None] = mapped_column(String(150))

    @classmethod
    def from_create_dto(
        cls, data: CreateCambioDTO, *, tecnico_nombre: str | None = None
    ) -> "CambioModel":
        kwargs: dict[str, object] = {
            "fecha": (
                        datetime.combine(
                            date.fromisoformat(data.fecha),
                            time.min,
                            tzinfo=timezone.utc,
                        )
                        if data.fecha
                        else datetime.now(timezone.utc)
                     ),
            "motivo": data.motivo,
            "lugar": data.lugar,
            "instalado_freno_id": data.freno_instalado_id,
            "cabezal_id": data.cabezal_id,
        }
        if data.freno_retirado_id == "Sin freno":
            kwargs["retirado_freno_id"] = None
        else:
            kwargs["retirado_freno_id"] = data.freno_retirado_id
        if data.tecnico_id is not None:
            kwargs["tecnico_id"] = data.tecnico_id
        if tecnico_nombre is not None:
            kwargs["tecnico_nombre"] = tecnico_nombre
        return cls(**kwargs)

    def to_domain(self) -> Cambio:
        return Cambio(
            id=self.id,
            fecha=self.fecha.strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
            motivo=self.motivo,
            lugar=self.lugar,
            retirado_freno_id=self.retirado_freno_id,
            instalado_freno_id=self.instalado_freno_id,
            cabezal_id=self.cabezal_id,
            tecnico_id=self.tecnico_id,
            tecnico_nombre=self.tecnico_nombre
        )


class ServicioModel(TimestampMixin, Base):
    __tablename__ = "servicios"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    machine_id: Mapped[str] = mapped_column(String(80), index=True)
    machine_type: Mapped[str] = mapped_column(String(20), index=True)
    fecha: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    resumen: Mapped[str] = mapped_column(String(500))
    trabajo_hecho: Mapped[str] = mapped_column(Text)
    tecnico_id: Mapped[str | None] = mapped_column(ForeignKey("tecnicos.id"), index=True)
    tecnico_nombre: Mapped[str | None] = mapped_column(String(150))

    consumibles: Mapped[list[ServicioConsumibleModel]] = relationship(
        back_populates="servicio", cascade="all, delete-orphan"
    )

    @classmethod
    def from_create_dto(
        cls, data: CreateServiceDTO, *, tecnico_nombre: str | None = None
    ) -> "ServicioModel":
        kwargs: dict[str, object] = {
            "machine_id": data.machine_id,
            "machine_type": data.machine_type,
            "fecha": datetime.fromisoformat(data.fecha.replace("Z", "+00:00")) if data.fecha else datetime.now(),
            "resumen": data.resumen,
            "trabajo_hecho": data.trabajo_hecho,
        }
        if data.tecnico_id is not None:
            kwargs["tecnico_id"] = data.tecnico_id
        if tecnico_nombre is not None:
            kwargs["tecnico_nombre"] = tecnico_nombre

        servicio = cls(**kwargs)
        servicio.consumibles = [
            ServicioConsumibleModel.from_domain(item)
            for item in data.consumibles
        ]
        return servicio

    def to_domain(self) -> Servicio:
        return Servicio(
            id=self.id,
            machine_id=self.machine_id,
            machine_type=self.machine_type,
            fecha=self.fecha.strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
            resumen=self.resumen,
            trabajo_hecho=self.trabajo_hecho,
            tecnico_id=self.tecnico_id,
            tecnico_nombre=self.tecnico_nombre,
            consumibles=[consumible.to_domain() for consumible in self.consumibles]
        )


class ServicioConsumibleModel(Base):
    __tablename__ = "servicio_consumibles"
    __table_args__ = (UniqueConstraint("servicio_id", "consumible_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    servicio_id: Mapped[str] = mapped_column(
        ForeignKey("servicios.id", ondelete="CASCADE"), index=True
    )
    consumible_id: Mapped[str] = mapped_column(ForeignKey("consumibles.id"), index=True)
    nombre: Mapped[str] = mapped_column(String(150))
    cantidad: Mapped[int] = mapped_column(Integer)

    servicio: Mapped[ServicioModel] = relationship(back_populates="consumibles")

    @classmethod
    def from_domain(cls, data: ConsumibleItem) -> "ServicioConsumibleModel":
        return cls(
            consumible_id=data.consumible_id,
            nombre=data.nombre,
            cantidad=data.cantidad,
        )

    def to_domain(self) -> ConsumibleItem:
        return ConsumibleItem(
            consumible_id=self.consumible_id,
            nombre=self.nombre,
            cantidad=self.cantidad,
        )
