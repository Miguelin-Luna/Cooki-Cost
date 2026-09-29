import urllib.request
import json
import urllib.error

try:
    req = urllib.request.Request("http://127.0.0.1:8000/api/v1/recipes")
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode('utf-8'))
        if data:
            print(json.dumps(data[0], indent=2))
        else:
            print("No recipes")
except urllib.error.URLError as e:
    print(e)