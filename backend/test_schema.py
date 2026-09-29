from app.schemas.recipe import RecipeResponse, RecipeIngredientResponse
from app.schemas.ingredient import IngredientResponse
from datetime import datetime

ing = IngredientResponse(id=1, name="Harina", unit="g", package_quantity=1000, package_cost=1.0, created_at=datetime.now(), last_price_update=datetime.now())
ri = RecipeIngredientResponse(ingredient=ing, quantity=5900, unit="g")

recipe = RecipeResponse(
    id=1, name="Test", yield_quantity=10, yield_unit="uds",
    protection_margin=5.0, profit_margin=30.0,
    created_at=datetime.now(), ingredients=[ri]
)

print("Ingredients cost:", sum(i.line_cost for i in recipe.ingredients))
print("Total cost:", recipe.total_cost)
print("Cost per unit:", recipe.cost_per_unit)
print("Suggested price:", recipe.suggested_price)