from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin
from app.models.common import generate_id
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

    def to_domain(self) -> CabezalModel:
        return Cabezal(
            id=self.id,
            estado=self.estado,
            ubicacion=self.ubicacion,
            empaque_id=self.empaque_id,
            freno_actual_id=self.freno_actual_id
        )


class CaseteraModel(TimestampMixin, Base):
    __tablename__ = "caseteras"

    numero: Mapped[int] = mapped_column(Integer, primary_key=True)
    estado: Mapped[str] = mapped_column(String(30), index=True)
    ubicacion: Mapped[str] = mapped_column(String(255), index=True)
    empaque_id: Mapped[str | None] = mapped_column(ForeignKey("empaques.id"), index=True)

    def to_domain(self) -> Casetera:
        return Casetera(
            numero=self.numero,
            estado=self.estado,
            ubicacion=self.ubicacion,
            empaque_id=self.empaque_id
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

    def to_domain(self) -> Freno:
        return Freno(
            id=self.id,
            fecha_inicio=self.fecha_inicio,
            estado=self.estado,
            cabezal_id=self.cabezal_id,
            ubicacion=self.ubicacion,
            empaque_id=self.empaque_id
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
