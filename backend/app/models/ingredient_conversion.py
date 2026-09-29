from sqlalchemy import String, Float, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.ingredient import Ingredient

class IngredientConversion(Base):
    __tablename__ = "ingredient_conversions"
    __table_args__ = (
        UniqueConstraint('ingredient_id', 'unit_name', name='uix_ingredient_unit'),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    ingredient_id: Mapped[int] = mapped_column(ForeignKey("ingredients.id", ondelete="CASCADE"), index=True)
    unit_name: Mapped[str] = mapped_column(String(20))
    equivalent_in_grams: Mapped[float] = mapped_column(Float)

    ingredient: Mapped["Ingredient"] = relationship("Ingredient", back_populates="conversions")
