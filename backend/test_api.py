import urllib.request
import json

# Update Nutella (ID 11) with 1 cda = 15.5g
req_get = urllib.request.Request("http://127.0.0.1:8000/api/v1/ingredients/11")
with urllib.request.urlopen(req_get) as response:
    nutella = json.loads(response.read().decode())
    
nutella['conversions'] = [{'unit_name': 'cucharada', 'equivalent_in_grams': 15.5}]
req_put = urllib.request.Request("http://127.0.0.1:8000/api/v1/ingredients/11", method="PUT")
req_put.add_header('Content-Type', 'application/json')
with urllib.request.urlopen(req_put, data=json.dumps(nutella).encode()) as response:
    print("Nutella updated")

# Update Kinder Bueno (ID 10) with 1 unidad = 43g, 1 taza = 120g
req_get = urllib.request.Request("http://127.0.0.1:8000/api/v1/ingredients/10")
with urllib.request.urlopen(req_get) as response:
    kinder = json.loads(response.read().decode())

kinder['conversions'] = [
    {'unit_name': 'unidad', 'equivalent_in_grams': 43},
    {'unit_name': 'taza', 'equivalent_in_grams': 120}
]
req_put = urllib.request.Request("http://127.0.0.1:8000/api/v1/ingredients/10", method="PUT")
req_put.add_header('Content-Type', 'application/json')
with urllib.request.urlopen(req_put, data=json.dumps(kinder).encode()) as response:
    print("Kinder Bueno updated")

# Get Recipe (ID 1)
req_get = urllib.request.Request("http://127.0.0.1:8000/api/v1/recipes/1")
with urllib.request.urlopen(req_get) as response:
    recipe = json.loads(response.read().decode())
    for ing in recipe['ingredients']:
        if ing['ingredient']['name'] in ['Nutella', 'Barras de kinder bueno']:
            print(f"{ing['ingredient']['name']}: {ing['line_cost']} ({ing.get('conversion_details', '')})")