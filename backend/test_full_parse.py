import urllib.request
import json
import pprint

recipe = """Mantequilla sin sal (113 g / ½ taza)
Azúcar blanca (67 g / ⅓ taza)
Azúcar morena (150 g / ½ taza)
Huevo grande (1)
Esencia de vainilla (1 cdta)
Bicarbonato de sodio (½ cdta)
Sal (¼ cdta)
Harina (186 g / 1½ taza)
Chispas de chocolate (225 g / 1½ taza)
Barras de Kinder Bueno (½ taza)
Nutella 10 cucharadas"""

req = urllib.request.Request("http://127.0.0.1:8000/api/v1/recipes/parse", data=json.dumps({"text": recipe}).encode('utf-8'), headers={'Content-Type': 'application/json'})
with urllib.request.urlopen(req) as response:
    data = json.loads(response.read().decode('utf-8'))
    for item in data['items']:
        print(f"Name: {item['raw_name']:<25} Qty: {str(item['quantity']):<5} Unit: {str(item['unit']):<10} ID: {str(item['ingredient_id']):<4} Status: {item['status']}")