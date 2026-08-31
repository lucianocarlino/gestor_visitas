from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin
from app.models.common import generate_id
from app.schemas.domain import CreateVisitDTO, ItemEstructura, ReporteSinclair, Visita


class VisitaModel(TimestampMixin, Base):
    __tablename__ = "visitas"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    fecha: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    motivo: Mapped[str] = mapped_column(String(500))
    solicitado_por: Mapped[str] = mapped_column(String(150))
    vehiculo: Mapped[str] = mapped_column(String(30))
    empaque_id: Mapped[str] = mapped_column(ForeignKey("empaques.id"), index=True)
    estado_sincronizacion: Mapped[str] = mapped_column(String(20), default="synced", index=True)

    tecnicos: Mapped[list[VisitaTecnicoModel]] = relationship(
        back_populates="visita", cascade="all, delete-orphan"
    )
    reporte: Mapped[ReporteSinclairModel] = relationship(
        back_populates="visita", cascade="all, delete-orphan", uselist=False
    )

    @classmethod
    def from_create_dto(
        cls,
        data: CreateVisitDTO,
        *,
        fecha: datetime | None = None,
        estado_sincronizacion: str = "synced",
    ) -> "VisitaModel":
        kwargs: dict[str, object] = {
            "fecha": fecha or datetime.now(),
            "motivo": data.motivo,
            "solicitado_por": data.solicitado_por,
            "vehiculo": data.vehiculo,
            "empaque_id": data.empaque_id,
            "estado_sincronizacion": estado_sincronizacion,
        }
        if data.id is not None:
            kwargs["id"] = data.id
        return cls(**kwargs)

    def to_domain(self) -> Visita:
        return Visita(
            id=self.id,
            fecha=self.fecha,
            motivo=self.motivo,
            solicitado_por=self.solicitado_por,
            vehiculo=self.vehiculo,
            tecnicos=[vt.tecnico.to_domain() for vt in self.tecnicos],
            reporte=self.reporte.to_domain() if self.reporte else None,
            empaque_id=self.empaque_id,
            estado_sincronizacion=self.estado_sincronizacion
        )

class VisitaTecnicoModel(Base):
    __tablename__ = "visita_tecnicos"
    __table_args__ = (UniqueConstraint("visita_id", "tecnico_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    visita_id: Mapped[str] = mapped_column(
        ForeignKey("visitas.id", ondelete="CASCADE"), index=True
    )
    tecnico_id: Mapped[str] = mapped_column(ForeignKey("tecnicos.id"), index=True)

    visita: Mapped[VisitaModel] = relationship(back_populates="tecnicos")

    @classmethod
    def from_ids(cls, *, visita_id: str, tecnico_id: str) -> "VisitaTecnicoModel":
        return cls(
            visita_id=visita_id,
            tecnico_id=tecnico_id,
        )


class ReporteSinclairModel(TimestampMixin, Base):
    __tablename__ = "reportes_sinclair"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    visita_id: Mapped[str] = mapped_column(
        ForeignKey("visitas.id", ondelete="CASCADE"), unique=True, index=True
    )
    numero: Mapped[int] = mapped_column(Integer, unique=True, index=True)
    codigo_motivo: Mapped[str] = mapped_column(String(10))
    codigo_origen: Mapped[str] = mapped_column(String(10))
    codigo_tipo_servicio: Mapped[str] = mapped_column(String(10))
    hora_inicio: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    hora_fin: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    fuera_de_hora: Mapped[bool] = mapped_column(Boolean, default=False)
    comentarios: Mapped[str] = mapped_column(Text)
    firma_cliente: Mapped[str | None] = mapped_column(Text)
    nombre_cliente: Mapped[str] = mapped_column(String(150))
    hora_llamada: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    produccion_etiquetada: Mapped[str | None] = mapped_column(String(255))
    condicion_fruta: Mapped[str | None] = mapped_column(String(255))

    visita: Mapped[VisitaModel] = relationship(back_populates="reporte")
    estructura: Mapped[list[ItemEstructuraModel]] = relationship(
        back_populates="reporte", cascade="all, delete-orphan",
        order_by="ItemEstructuraModel.orden",
    )

    @classmethod
    def from_create_dto(
        cls, data: CreateVisitDTO, *, numero: int
    ) -> "ReporteSinclairModel":
        reporte = cls(
            numero=numero,
            codigo_motivo=data.codigo_motivo,
            codigo_origen=data.codigo_origen,
            codigo_tipo_servicio=data.codigo_tipo_servicio,
            hora_inicio=datetime.fromisoformat(data.hora_inicio.replace("Z", "+00:00")),
            hora_fin=datetime.fromisoformat(data.hora_fin.replace("Z", "+00:00")),
            fuera_de_hora=data.fuera_de_hora,
            comentarios=data.comentarios,
            firma_cliente=data.firma_cliente,
            nombre_cliente=data.nombre_cliente,
            hora_llamada=datetime.fromisoformat(data.hora_llamada.replace("Z", "+00:00")),
            produccion_etiquetada=data.produccion_etiquetada,
            condicion_fruta=data.condicion_fruta,
        )
        reporte.estructura = [
            ItemEstructuraModel.from_domain(item, orden=index)
            for index, item in enumerate(data.estructura, start=1)
        ]
        return reporte

    def to_domain(self) -> ReporteSinclair:
        return ReporteSinclair(
            numero=self.numero,
            codigo_motivo=self.codigo_motivo,
            codigo_origen=self.codigo_origen,
            codigo_tipo_servicio=self.codigo_tipo_servicio,
            estructura=[item.to_domain() for item in self.estructura],
            hora_inicio=self.hora_inicio.isoformat(),
            hora_fin=self.hora_fin.isoformat(),
            fuera_de_hora=self.fuera_de_hora,
            comentarios=self.comentarios,
            firma_cliente=self.firma_cliente,
            nombre_cliente=self.nombre_cliente,
            hora_llamada=self.hora_llamada.isoformat(),
            produccion_etiquetada=self.produccion_etiquetada,
            condicion_fruta=self.condicion_fruta,
            created_at=self.created_at.isoformat() if self.created_at else None
        )


class ItemEstructuraModel(Base):
    __tablename__ = "reporte_items"
    __table_args__ = (UniqueConstraint("reporte_id", "orden"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    reporte_id: Mapped[str] = mapped_column(
        ForeignKey("reportes_sinclair.id", ondelete="CASCADE"), index=True
    )
    orden: Mapped[int] = mapped_column(Integer)
    codigo_res: Mapped[str] = mapped_column(String(50))
    numero_partes: Mapped[str] = mapped_column(String(100))
    cantidad: Mapped[str] = mapped_column(String(100))
    otras_acciones: Mapped[str] = mapped_column(Text)
    pct_etiquetado_esperado: Mapped[float] = mapped_column(Float)
    pct_etiquetado_real: Mapped[float] = mapped_column(Float)
    tiempo_servicio: Mapped[float] = mapped_column(Float)

    reporte: Mapped[ReporteSinclairModel] = relationship(back_populates="estructura")

    @classmethod
    def from_domain(cls, data: ItemEstructura, *, orden: int) -> "ItemEstructuraModel":
        return cls(
            orden=orden,
            codigo_res=data.codigo_res,
            numero_partes=data.numero_partes,
            cantidad=data.cantidad,
            otras_acciones=data.otras_acciones,
            pct_etiquetado_esperado=data.pct_etiquetado_esperado,
            pct_etiquetado_real=data.pct_etiquetado_real,
            tiempo_servicio=data.tiempo_servicio,
        )

    def to_domain(self) -> ItemEstructura:
        return ItemEstructura(
            id=self.id,
            reporte_id=self.reporte_id,
            orden=self.orden,
            codigo_res=self.codigo_res,
            numero_partes=self.numero_partes,
            cantidad=self.cantidad,
            otras_acciones=self.otras_acciones,
            pct_etiquetado_esperado=self.pct_etiquetado_esperado,
            pct_etiquetado_real=self.pct_etiquetado_real,
            tiempo_servicio=self.tiempo_servicio
        )
