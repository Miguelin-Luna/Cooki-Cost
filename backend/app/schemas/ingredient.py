from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, computed_field, Field, field_validator

def normalize_unit_name(u: str) -> str:
    if not u: return u
    u = u.lower().strip()
    mapping = {
        'tazas': 'taza', 'cup': 'taza', 'cups': 'taza',
        'cda': 'cucharada', 'cdas': 'cucharada', 'cucharadas': 'cucharada',
        'cdta': 'cucharadita', 'cdtas': 'cucharadita', 'cucharaditas': 'cucharadita',
        'unidades': 'unidad', 'pieza': 'unidad', 'piezas': 'unidad',
        'funda': 'funda', 'fundas': 'funda'
    }
    return mapping.get(u, u)

class IngredientConversionBase(BaseModel):
    unit_name: str
    equivalent_in_grams: float = Field(gt=0, description="Equivalent in grams must be > 0")

    @field_validator('unit_name')
    @classmethod
    def validate_unit(cls, v: str) -> str:
        return normalize_unit_name(v)

class IngredientConversionCreate(IngredientConversionBase):
    pass

class IngredientConversionResponse(IngredientConversionBase):
    id: int
    ingredient_id: int
    model_config = ConfigDict(from_attributes=True)

class IngredientBase(BaseModel):
    name: str
    brand: Optional[str] = None
    unit: str
    package_quantity: float = Field(gt=0)
    package_cost: float = Field(ge=0)

    @field_validator('unit')
    @classmethod
    def validate_unit(cls, v: str) -> str:
        return normalize_unit_name(v)

class IngredientCreate(IngredientBase):
    conversions: Optional[List[IngredientConversionCreate]] = None

class IngredientUpdate(BaseModel):
    name: Optional[str] = None
    brand: Optional[str] = None
    unit: Optional[str] = None
    package_quantity: Optional[float] = Field(None, gt=0)
    package_cost: Optional[float] = Field(None, ge=0)
    conversions: Optional[List[IngredientConversionCreate]] = None

class IngredientBulkUpdateItem(BaseModel):
    id: int
    package_quantity: Optional[float] = Field(None, gt=0)
    package_cost: Optional[float] = Field(None, ge=0)

class IngredientResponse(IngredientBase):
    id: int
    last_price_update: datetime
    created_at: datetime
    conversions: List[IngredientConversionResponse] = []

    @computed_field
    @property
    def cost_per_unit(self) -> float:
        if self.package_quantity > 0:
            return self.package_cost / self.package_quantity
        return 0.0

    model_config = ConfigDict(from_attributes=True)

class IngredientAliasBase(BaseModel):
    alias_name: str
    ingredient_id: int

class IngredientAliasCreate(IngredientAliasBase):
    pass

class IngredientAliasResponse(IngredientAliasBase):
    id: int
    normalized_alias: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
