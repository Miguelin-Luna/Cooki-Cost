from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, computed_field, Field, field_validator
from app.schemas.ingredient import IngredientResponse, normalize_unit_name
from app.services.costing_service import calculate_ingredient_cost

class RecipeIngredientItem(BaseModel):
    ingredient_id: int
    quantity: float = Field(gt=0)
    unit: str

    @field_validator('unit')
    @classmethod
    def validate_unit(cls, v: str) -> str:
        return normalize_unit_name(v)

class RecipeIngredientResponse(BaseModel):
    ingredient: IngredientResponse
    quantity: float
    unit: str

    @computed_field
    @property
    def unit_cost(self) -> float:
        if self.ingredient.package_quantity > 0:
            return self.ingredient.package_cost / self.ingredient.package_quantity
        return 0.0

    @computed_field
    @property
    def line_cost(self) -> float:
        cost, _ = calculate_ingredient_cost(self.ingredient, self.quantity, self.unit)
        return cost

    @computed_field
    @property
    def conversion_details(self) -> str:
        _, details = calculate_ingredient_cost(self.ingredient, self.quantity, self.unit)
        return details

    model_config = ConfigDict(from_attributes=True)

class RecipeBase(BaseModel):
    name: str
    yield_quantity: int = Field(gt=0, default=1)
    yield_unit: str = "unidades"
    protection_margin: float = 10.0
    profit_margin: float = 60.0
    image_url: Optional[str] = None
    category: Optional[str] = None
    is_favorite: bool = False

class RecipeCreate(RecipeBase):
    ingredients: List[RecipeIngredientItem]

class RecipeUpdate(BaseModel):
    name: Optional[str] = None
    yield_quantity: Optional[int] = Field(None, gt=0)
    yield_unit: Optional[str] = None
    protection_margin: Optional[float] = None
    profit_margin: Optional[float] = None
    ingredients: Optional[List[RecipeIngredientItem]] = None

class RecipeResponse(RecipeBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    ingredients: List[RecipeIngredientResponse]
    overhead_total: float = 0.0

    @computed_field
    @property
    def total_cost(self) -> float:
        ingredients_cost = sum(item.line_cost for item in self.ingredients)
        protection_cost = ingredients_cost * (self.protection_margin / 100)
        return ingredients_cost + protection_cost + self.overhead_total

    @computed_field
    @property
    def cost_per_unit(self) -> float:
        if self.yield_quantity > 0:
            return self.total_cost / self.yield_quantity
        return 0.0

    @computed_field
    @property
    def suggested_price(self) -> float:
        if self.profit_margin < 100:
            return self.cost_per_unit / (1 - (self.profit_margin / 100))
        return 0.0

    @computed_field
    @property
    def total_profit(self) -> float:
        return (self.suggested_price * self.yield_quantity) - self.total_cost

    model_config = ConfigDict(from_attributes=True)

class SimulationRequest(BaseModel):
    quantity: int

class SimulationResponse(BaseModel):
    quantity: int
    revenue: float
    total_cost: float
    profit: float
    profit_per_unit: float

class ParseRequest(BaseModel):
    text: str

class ParseItem(BaseModel):
    raw_name: str
    quantity: Optional[float] = None
    unit: Optional[str] = None
    ingredient_id: Optional[int] = None
    ingredient_name: Optional[str] = None
    status: str = "valid"

class ParseResponse(BaseModel):
    items: List[ParseItem]
