import urllib.request
try:
    print(urllib.request.urlopen("http://127.0.0.1:8000/api/v1/ingredients").getcode())
except Exception as e:
    print(e)