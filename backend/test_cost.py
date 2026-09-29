from types import SimpleNamespace

# Mocks
UNIT_CONVERSIONS = {
    'kg': {'g': 1000, 'kg': 1},
    'g': {'g': 1, 'kg': 0.001},
    'unidad': {'unidad': 1, 'unidades': 1},
    'taza': {'taza': 1, 'tazas': 1},
}

def calculate_ingredient_cost(ingredient, quantity_used, recipe_unit):
    from_unit = recipe_unit.lower()
    to_unit = ingredient.unit.lower()
    cost_per_unit = ingredient.package_cost / ingredient.package_quantity if ingredient.package_quantity > 0 else 0
    
    if from_unit == to_unit:
        return quantity_used * cost_per_unit
        
    if from_unit in UNIT_CONVERSIONS and to_unit in UNIT_CONVERSIONS[from_unit]:
        return (quantity_used * UNIT_CONVERSIONS[from_unit][to_unit]) * cost_per_unit
        
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
            return final_qty * cost_per_unit
            
        for c2 in ingredient.conversions:
            if c2.unit_name.lower() in UNIT_CONVERSIONS.get(to_unit, {to_unit: 1}):
                if c2.equivalent_in_grams > 0:
                    final_qty = grams_used / c2.equivalent_in_grams
                    return final_qty * cost_per_unit

    return 0.0

ing = SimpleNamespace(
    unit='unidad',
    package_quantity=3,
    package_cost=4.47,
    conversions=[
        SimpleNamespace(unit_name='unidad', equivalent_in_grams=43),
        SimpleNamespace(unit_name='taza', equivalent_in_grams=120)
    ]
)

cost = calculate_ingredient_cost(ing, 0.5, 'taza')
print(f"Cost: {cost}")