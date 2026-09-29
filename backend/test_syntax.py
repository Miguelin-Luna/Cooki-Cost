import urllib.request

req = urllib.request.Request("http://127.0.0.1:8000/api/v1/recipes/1")
try:
    with urllib.request.urlopen(req) as response:
        print(response.status)
except Exception as e:
    print(e)