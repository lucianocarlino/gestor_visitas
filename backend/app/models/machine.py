from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin
from app.models.common import generate_id
from app.schemas.api_contracts import (
    CabezalCreateRequest,
    CaseteraCreateRequest,
    FrenoCreateRequest,
    MovimientoCreateRequest, FrenoUpdateRequest, CabezalUpdateRequest, CaseteraUpdateRequest,
)
from app.schemas.domain import Cabezal, Casetera, Freno, Movimiento


class CabezalModel(TimestampMixin, Base):
    __tablename__ = "cabezales"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    estado: Mapped[str] = mapped_column(String(30), index=True)
    ubicacion: Mapped[str] = mapped_column(String(255), index=True)
    empaque_id: Mapped[str | None] = mapped_column(ForeignKey("empaques.id"), index=True)
    freno_actual_id: Mapped[str | None] = mapped_column(
        ForeignKey("frenos.id", use_alter=True, name="fk_cabezal_freno_actual")
    )

    freno_actual: Mapped[FrenoModel | None] = relationship(
        foreign_keys=[freno_actual_id], post_update=True
    )

    @classmethod
    def from_create_request(cls, data: CabezalCreateRequest) -> "CabezalModel":
        kwargs: dict[str, object] = {}
        if data.id is not None:
            kwargs["id"] = data.id
        if data.estado is not None:
            kwargs["estado"] = data.estado
        if data.ubicacion is not None:
            kwargs["ubicacion"] = data.ubicacion
        if data.empaque_id is not None:
            kwargs["empaque_id"] = data.empaque_id
        if data.freno_actual_id is not None:
            kwargs["freno_actual_id"] = data.freno_actual_id
        return cls(**kwargs)

    @classmethod
    def from_update_dto(
            cls,
            current: "CabezalModel",
            data: CabezalUpdateRequest,
    ) -> "CabezalModel":
        if data.estado is not None:
            current.estado = data.estado
        if data.empaque_id is not None:
            current.empaque_id = data.empaque_id
        if data.ubicacion is not None:
            current.ubicacion = data.ubicacion
        if data.freno_actual_id is not None:
            current.freno_actual_id = data.freno_actual_id
        return current

    def to_domain(self) -> Cabezal:
        return Cabezal(
            id=self.id,
            tipo="Cabezal",
            estado=self.estado,
            ubicacion=self.ubicacion,
            freno_actual_id=self.freno_actual_id,
            historial_movimientos=None,
            historial_reemplazos=None,
            historial_servicios=None,
        )


class CaseteraModel(TimestampMixin, Base):
    __tablename__ = "caseteras"

    numero: Mapped[int] = mapped_column(Integer, primary_key=True)
    estado: Mapped[str] = mapped_column(String(30), index=True)
    ubicacion: Mapped[str] = mapped_column(String(255), index=True)
    empaque_id: Mapped[str | None] = mapped_column(ForeignKey("empaques.id"), index=True)

    @classmethod
    def from_create_request(cls, data: CaseteraCreateRequest) -> "CaseteraModel":
        kwargs: dict[str, object] = {}
        if data.numero is not None:
            kwargs["numero"] = data.numero
        if data.estado is not None:
            kwargs["estado"] = data.estado
        if data.ubicacion is not None:
            kwargs["ubicacion"] = data.ubicacion
        if data.empaque_id is not None:
            kwargs["empaque_id"] = data.empaque_id
        return cls(**kwargs)

    @classmethod
    def from_update_dto(
            cls,
            current: "CaseteraModel",
            data: CaseteraUpdateRequest,
    ) -> "CaseteraModel":
        if data.numero is not None:
            current.numero = data.numero
        if data.estado is not None:
            current.estado = data.estado
        if data.ubicacion is not None:
            current.ubicacion = data.ubicacion
        if data.empaque_id is not None:
            current.empaque_id = data.empaque_id
        return current

    def to_domain(self) -> Casetera:
        return Casetera(
            id=self.numero,
            tipo="Casetera",
            estado=self.estado,
            ubicacion=self.ubicacion,
            historial_movimientos=None,
            historial_reemplazos=None,
            historial_servicios=None,

        )


class FrenoModel(TimestampMixin, Base):
    __tablename__ = "frenos"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    fecha_inicio: Mapped[date] = mapped_column(Date)
    estado: Mapped[str] = mapped_column(String(30), index=True)
    cabezal_id: Mapped[str | None] = mapped_column(
        ForeignKey("cabezales.id", use_alter=True, name="fk_freno_cabezal"), index=True
    )
    ubicacion: Mapped[str] = mapped_column(String(255), index=True)
    empaque_id: Mapped[str | None] = mapped_column(ForeignKey("empaques.id"), index=True)

    @classmethod
    def from_create_request(cls, data: FrenoCreateRequest) -> "FrenoModel":
        kwargs: dict[str, object] = {}
        if data.id is not None:
            kwargs["id"] = data.id
        if data.fecha_inicio is not None:
            kwargs["fecha_inicio"] = date.fromisoformat(data.fecha_inicio)
        if data.estado is not None:
            kwargs["estado"] = data.estado
        if data.cabezal_id is not None:
            kwargs["cabezal_id"] = data.cabezal_id
        if data.ubicacion is not None:
            kwargs["ubicacion"] = data.ubicacion
        if getattr(data, "empaque_id", None) is not None:
            kwargs["empaque_id"] = data.empaque_id
        return cls(**kwargs)

    @classmethod
    def from_update_dto(
            cls,
            current: "FrenoModel",
            data: FrenoUpdateRequest,
    ) -> "FrenoModel":
        if data.empaque_id is not None:
            current.empaque_id = data.empaque_id
        if data.ubicacion is not None:
            current.ubicacion = data.ubicacion
        if data.fecha_inicio is not None:
            current.fecha_inicio = date.fromisoformat(data.fecha_inicio)
        if data.cabezal_id is not None:
            current.cabezal_id = data.cabezal_id
        if data.estado is not None:
            current.estado = data.estado
        return current

    def to_domain(self) -> Freno:
        return Freno(
            id=self.id,
            tipo="Freno",
            fecha_inicio=self.fecha_inicio.strftime("%Y-%m-%d"),
            estado=self.estado,
            cabezal_id=self.cabezal_id,
            ubicacion=self.ubicacion,
            historial_movimientos=None,
            historial_cambios=None,
            historial_servicios=None,

        )


class MovimientoModel(TimestampMixin, Base):
    __tablename__ = "movimientos"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    machine_id: Mapped[str] = mapped_column(String(80), index=True)
    machine_type: Mapped[str] = mapped_column(String(20), index=True)
    fecha: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    tecnico_id: Mapped[str | None] = mapped_column(ForeignKey("tecnicos.id"), index=True)
    tecnico_nombre: Mapped[str] = mapped_column(String(150))
    motivo: Mapped[str] = mapped_column(String(500))
    origen: Mapped[str] = mapped_column(String(255))
    destino: Mapped[str] = mapped_column(String(255))

    @classmethod
    def from_create_request(cls, data: MovimientoCreateRequest) -> "MovimientoModel":
        return cls(
            machine_id=str(data.machine_id),
            machine_type=data.machine_type,
            fecha=datetime.fromisoformat(data.fecha.replace("Z", "+00:00")),
            tecnico_nombre=data.tecnico_nombre,
            motivo=data.motivo,
            origen=data.origen,
            destino=data.destino,
        )

    def to_domain(self) -> Movimiento:
        return Movimiento(
            id=self.id,
            machine_id=self.machine_id,
            machine_type=self.machine_type,
            fecha=self.fecha,
            tecnico_id=self.tecnico_id,
            tecnico_nombre=self.tecnico_nombre,
            motivo=self.motivo,
            origen=self.origen,
            destino=self.destino
        )
