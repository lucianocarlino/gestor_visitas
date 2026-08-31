from sqlalchemy import Boolean, CheckConstraint, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin
from app.models.common import generate_id
from app.schemas.api_contracts import ConsumibleCreateRequest, ConsumibleUpdateRequest
from app.schemas.domain import Consumible


class ConsumibleModel(TimestampMixin, Base):
    __tablename__ = "consumibles"
    __table_args__ = (
        CheckConstraint("stock >= 0", name="stock_non_negative"),
        CheckConstraint("stock_minimo >= 0", name="minimum_stock_non_negative"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    nombre: Mapped[str] = mapped_column(String(150), unique=True, index=True)
    stock: Mapped[int] = mapped_column(Integer, default=0)
    es_critico: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    stock_minimo: Mapped[int] = mapped_column(Integer, default=0)

    @classmethod
    def from_create_request(cls, data: ConsumibleCreateRequest) -> "ConsumibleModel":
        kwargs: dict[str, object] = {}
        if data.id is not None:
            kwargs["id"] = data.id
        if data.nombre is not None:
            kwargs["nombre"] = data.nombre
        if data.stock is not None:
            kwargs["stock"] = data.stock
        if data.es_critico is not None:
            kwargs["es_critico"] = data.es_critico
        if data.stock_minimo is not None:
            kwargs["stock_minimo"] = data.stock_minimo
        return cls(**kwargs)

    def from_update_dto(self, data: ConsumibleUpdateRequest) -> "ConsumibleModel":
        if data.nombre is not None:
            self.nombre = data.nombre
        if data.stock is not None:
            self.stock = data.stock
        if data.es_critico is not None:
            self.es_critico = data.es_critico
        if data.stock_minimo is not None:
            self.stock_minimo = data.stock_minimo
        return self

    @classmethod
    def from_domain(cls, data: Consumible) -> "ConsumibleModel":
        return cls(
            id=data.id,
            nombre=data.nombre,
            stock=data.stock,
            es_critico=data.es_critico,
            stock_minimo=data.stock_minimo,
        )

    def to_domain(self) -> Consumible:
        return Consumible(
            id=self.id,
            nombre=self.nombre,
            stock=self.stock,
            es_critico=self.es_critico,
            stock_minimo=self.stock_minimo,
            created_at=self.created_at,
            updated_at=self.updated_at
        )
