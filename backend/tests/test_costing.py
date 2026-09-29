import pytest
from app.services.costing_service import calculate_ingredient_cost, calculate_recipe_cost

class MockIngredient:
    def __init__(self, name, unit, package_quantity, package_cost):
        self.name = name
        self.unit = unit
        self.package_quantity = package_quantity
        self.package_cost = package_cost

class MockRecipeIngredient:
    def __init__(self, ingredient, quantity, unit):
        self.ingredient = ingredient
        self.quantity = quantity
        self.unit = unit

class MockRecipe:
    def __init__(self, ingredients, yield_quantity=1, protection_margin=0.0, profit_margin=0.0):
        self.ingredients = ingredients
        self.yield_quantity = yield_quantity
        self.protection_margin = protection_margin
        self.profit_margin = profit_margin

def test_ingredient_line_cost():
    # Harina YA
    harina = MockIngredient("Harina", "g", 900, 1.92)
    # Receta usa 186g
    cost = calculate_ingredient_cost(harina, 186, "g")
    assert round(cost, 2) == 0.40  # 186 * (1.92 / 900) = 0.3968 -> 0.40

    # Mantequilla
    mantequilla = MockIngredient("Mantequilla", "g", 100, 1.79)
    cost = calculate_ingredient_cost(mantequilla, 113, "g")
    assert round(cost, 2) == 2.02  # 113 * (1.79 / 100) = 2.0227 -> 2.02

    # Chispas
    chispas = MockIngredient("Chispas", "g", 500, 6.11)
    cost = calculate_ingredient_cost(chispas, 225, "g")
    assert round(cost, 2) == 2.75  # 225 * (6.11 / 500) = 2.7495 -> 2.75

def test_full_recipe_integration():
    harina = MockIngredient("Harina", "g", 900, 1.92)
    mantequilla = MockIngredient("Mantequilla", "g", 100, 1.79)
    huevos = MockIngredient("Huevos", "unidad", 30, 6.67)

    ingredients = [
        MockRecipeIngredient(harina, 186, "g"),
        MockRecipeIngredient(mantequilla, 113, "g"),
        MockRecipeIngredient(huevos, 1, "unidad")
    ]
    
    # 186g harina = 0.3968
    # 113g mantequilla = 2.0227
    # 1 huevo = 0.2223
    # Total Base = 2.6418
    
    # Rinde 10, protection 5%, margin 30%
    recipe = MockRecipe(ingredients, yield_quantity=10, protection_margin=5.0, profit_margin=30.0)
    
    result = calculate_recipe_cost(recipe)
    
    assert round(result["ingredients_cost"], 4) == 2.6418
    
    # Protection = 2.6418 * 0.05 = 0.1321
    assert round(result["protection_cost"], 4) == 0.1321
    
    # Total Cost = 2.7739
    assert round(result["total_cost"], 4) == 2.7739
    
    # Cost per unit = 2.7739 / 10 = 0.2774
    assert round(result["cost_per_unit"], 4) == 0.2774
    
    # Suggested Price (30% margin on sales price)
    # Price = Cost / (1 - Margin) = 0.2774 / 0.7 = 0.3963
    assert round(result["suggested_price"], 4) == 0.3963
