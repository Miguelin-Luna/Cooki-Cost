import urllib.request
import json

req_get = urllib.request.Request("http://127.0.0.1:8000/api/v1/ingredients/11")
with urllib.request.urlopen(req_get) as response:
    nutella = json.loads(response.read().decode())
    
update_data = {
    "name": nutella["name"],
    "unit": nutella["unit"],
    "package_quantity": nutella["package_quantity"],
    "package_cost": nutella["package_cost"],
    "conversions": [{'unit_name': 'cucharada', 'equivalent_in_grams': 15.5}]
}
req_put = urllib.request.Request("http://127.0.0.1:8000/api/v1/ingredients/11", method="PUT")
req_put.add_header('Content-Type', 'application/json')
try:
    with urllib.request.urlopen(req_put, data=json.dumps(update_data).encode()) as response:
        print("Nutella updated")
except Exception as e:
    print(e.read().decode())

req_get = urllib.request.Request("http://127.0.0.1:8000/api/v1/ingredients/10")
with urllib.request.urlopen(req_get) as response:
    kinder = json.loads(response.read().decode())

update_data2 = {
    "name": kinder["name"],
    "unit": kinder["unit"],
    "package_quantity": kinder["package_quantity"],
    "package_cost": kinder["package_cost"],
    "conversions": [
        {'unit_name': 'unidad', 'equivalent_in_grams': 43},
        {'unit_name': 'taza', 'equivalent_in_grams': 120}
    ]
}
req_put = urllib.request.Request("http://127.0.0.1:8000/api/v1/ingredients/10", method="PUT")
req_put.add_header('Content-Type', 'application/json')
with urllib.request.urlopen(req_put, data=json.dumps(update_data2).encode()) as response:
    print("Kinder Bueno updated")

req_get = urllib.request.Request("http://127.0.0.1:8000/api/v1/recipes/1")
with urllib.request.urlopen(req_get) as response:
    recipe = json.loads(response.read().decode())
    for ing in recipe['ingredients']:
        if ing['ingredient']['name'] in ['Nutella', 'Barras de kinder bueno']:
            print(f"{ing['ingredient']['name']}: {ing['line_cost']} ({ing.get('conversion_details', '')})")