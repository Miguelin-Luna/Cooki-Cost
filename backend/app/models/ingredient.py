from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Float, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class Ingredient(Base):
    __tablename__ = "ingredients"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    brand: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    unit: Mapped[str] = mapped_column(String(20))
    package_quantity: Mapped[float] = mapped_column(Float)
    package_cost: Mapped[float] = mapped_column(Float)
    last_price_update: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    recipe_associations: Mapped[list["RecipeIngredient"]] = relationship("RecipeIngredient", back_populates="ingredient")
    conversions: Mapped[list["IngredientConversion"]] = relationship("IngredientConversion", back_populates="ingredient", cascade="all, delete-orphan")
