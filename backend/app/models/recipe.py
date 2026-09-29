from datetime import datetime, timezone
from sqlalchemy import String, Float, Integer, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class Recipe(Base):
    __tablename__ = "recipes"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(150), index=True)
    yield_quantity: Mapped[int] = mapped_column(Integer, default=1)
    yield_unit: Mapped[str] = mapped_column(String(50), default="unidades")
    protection_margin: Mapped[float] = mapped_column(Float, default=10.0)
    profit_margin: Mapped[float] = mapped_column(Float, default=60.0)
    category: Mapped[str | None] = mapped_column(String(50), nullable=True)
    is_favorite: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=True, onupdate=lambda: datetime.now(timezone.utc))
    image_url: Mapped[str | None] = mapped_column(String(255), nullable=True)

    ingredients: Mapped[list["RecipeIngredient"]] = relationship(
        "RecipeIngredient",
        back_populates="recipe",
        lazy="selectin",
        cascade="all, delete-orphan"
    )
