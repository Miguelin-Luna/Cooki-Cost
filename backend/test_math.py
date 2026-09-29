from pydantic import BaseModel, ConfigDict, computed_field

class RecipeResponse(BaseModel):
    yield_quantity: int
    protection_margin: float
    profit_margin: float
    ingredients_cost: float
    overhead_total: float = 0.0
    
    @computed_field
    @property
    def total_cost(self) -> float:
        protection_cost = self.ingredients_cost * (self.protection_margin / 100)
        return self.ingredients_cost + protection_cost + self.overhead_total

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

r = RecipeResponse(yield_quantity=10, protection_margin=5.0, profit_margin=30.0, ingredients_cost=5.90)
print(f"Total cost: {r.total_cost}")
print(f"Cost per unit: {r.cost_per_unit}")
print(f"Suggested price: {r.suggested_price}")