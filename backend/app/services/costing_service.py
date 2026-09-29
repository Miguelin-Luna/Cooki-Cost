from typing import Any, List

UNIT_CONVERSIONS = {
    'kg': {'g': 1000, 'kg': 1, 'ml': 1000, 'l': 1},
    'g': {'g': 1, 'kg': 0.001, 'ml': 1, 'l': 0.001},
    'l': {'ml': 1000, 'l': 1, 'g': 1000, 'kg': 1},
    'ml': {'ml': 1, 'l': 0.001, 'g': 1, 'kg': 0.001},
    'unidad': {'unidad': 1, 'unidades': 1},
    'unidades': {'unidad': 1, 'unidades': 1},
    'funda': {'funda': 1},
    'lb': {'g': 453.592, 'lb': 1, 'kg': 0.453592},
    'oz': {'g': 28.3495, 'oz': 1},
    'taza': {'taza': 1, 'tazas': 1},
    'tazas': {'taza': 1, 'tazas': 1},
    'cda': {'cda': 1, 'cdas': 1},
    'cdas': {'cda': 1, 'cdas': 1},
    'cucharada': {'cucharada': 1, 'cucharadas': 1},
    'cucharadas': {'cucharada': 1, 'cucharadas': 1},
    'cdta': {'cdta': 1, 'cdtas': 1},
    'cdtas': {'cdta': 1, 'cdtas': 1},
    'cucharadita': {'cucharadita': 1, 'cucharaditas': 1},
    'cucharaditas': {'cucharadita': 1, 'cucharaditas': 1},
}

def calculate_ingredient_cost(ingredient: Any, quantity_used: float, recipe_unit: str) -> tuple[float, str]:
    from_unit = recipe_unit.lower()
    to_unit = ingredient.unit.lower()
    cost_per_unit = ingredient.package_cost / ingredient.package_quantity if ingredient.package_quantity > 0 else 0
    
    if from_unit == to_unit:
        return quantity_used * cost_per_unit, "Conversión directa: unidades iguales"
        
    # Standard same-dimension conversion (e.g. kg -> g)
    if from_unit in UNIT_CONVERSIONS and to_unit in UNIT_CONVERSIONS[from_unit]:
        qty = quantity_used * UNIT_CONVERSIONS[from_unit][to_unit]
        return qty * cost_per_unit, f"Conversión estándar: {quantity_used} {from_unit} = {qty:.2f} {to_unit}"
        
    custom_conv = None
    if hasattr(ingredient, 'conversions') and ingredient.conversions:
        for c in ingredient.conversions:
            if c.unit_name.lower() in UNIT_CONVERSIONS.get(from_unit, {from_unit: 1}):
                custom_conv = c
                break
                
    if custom_conv:
        grams_used = quantity_used * custom_conv.equivalent_in_grams
        
        if to_unit in UNIT_CONVERSIONS.get('g', {}):
            final_qty = grams_used * UNIT_CONVERSIONS['g'][to_unit]
            return final_qty * cost_per_unit, f"Regla aplicada: 1 {custom_conv.unit_name} = {custom_conv.equivalent_in_grams}g. Total = {grams_used:.2f}g = {final_qty:.2f} {to_unit}"
            
        for c2 in ingredient.conversions:
            if c2.unit_name.lower() in UNIT_CONVERSIONS.get(to_unit, {to_unit: 1}):
                if c2.equivalent_in_grams > 0:
                    final_qty = grams_used / c2.equivalent_in_grams
                    return final_qty * cost_per_unit, f"Reglas aplicadas: 1 {custom_conv.unit_name} = {custom_conv.equivalent_in_grams}g y 1 {c2.unit_name} = {c2.equivalent_in_grams}g. Total = {final_qty:.2f} {to_unit}"

    return 0.0, "Requiere configuración de equivalencia (Ej: 1 taza = X gramos)"

def get_overhead_total(overheads: List[Any], base_cost: float) -> float:
    total = 0.0
    for oh in overheads:
        if oh.is_active:
            if oh.cost_type == 'fixed':
                total += oh.value
            elif oh.cost_type == 'percentage':
                total += base_cost * (oh.value / 100)
    return total

def calculate_recipe_cost(recipe_with_ingredients: Any, overheads: List[Any] = None) -> dict:
    if overheads is None:
        overheads = []
        
    ingredients_cost = 0.0
    for ri in recipe_with_ingredients.ingredients:
        ingredients_cost += calculate_ingredient_cost(ri.ingredient, ri.quantity, ri.unit)
        
    protection_cost = ingredients_cost * (recipe_with_ingredients.protection_margin / 100)
    base_cost = ingredients_cost + protection_cost
    overhead_cost = get_overhead_total(overheads, base_cost)
    
    total_cost = base_cost + overhead_cost
    yield_qty = recipe_with_ingredients.yield_quantity if recipe_with_ingredients.yield_quantity > 0 else 1
    cost_per_unit = total_cost / yield_qty
    
    profit_margin = recipe_with_ingredients.profit_margin
    if profit_margin < 100:
        suggested_price = cost_per_unit / (1 - (profit_margin / 100))
    else:
        suggested_price = cost_per_unit * 2
        
    total_profit = (suggested_price * yield_qty) - total_cost
    
    return {
        "ingredients_cost": ingredients_cost,
        "protection_cost": protection_cost,
        "overhead_cost": overhead_cost,
        "total_cost": total_cost,
        "cost_per_unit": cost_per_unit,
        "suggested_price": suggested_price,
        "total_profit": total_profit
    }

def calculate_simulation(recipe_cost_per_unit: float, suggested_price: float, quantity: int) -> dict:
    revenue = suggested_price * quantity
    total_cost = recipe_cost_per_unit * quantity
    profit = revenue - total_cost
    return {
        "quantity": quantity,
        "revenue": revenue,
        "total_cost": total_cost,
        "profit": profit,
        "profit_per_unit": suggested_price - recipe_cost_per_unit
    }
