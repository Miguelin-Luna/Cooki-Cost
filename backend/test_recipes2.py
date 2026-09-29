import urllib.request
import json
import urllib.error

try:
    req = urllib.request.Request("http://127.0.0.1:8000/api/v1/recipes/1")
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode('utf-8'))
        print(f"Total Cost: {data['total_cost']}")
        for ing in data['ingredients']:
            if ing['ingredient']['name'] in ['Nutella', 'Barras de kinder bueno']:
                print(f"{ing['ingredient']['name']}: {ing['line_cost']}")
except urllib.error.URLError as e:
    print(e)