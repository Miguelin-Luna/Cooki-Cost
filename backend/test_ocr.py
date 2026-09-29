import requests
import sys

image_path = r'C:\Users\Usuario iTC\.gemini\antigravity\brain\197edd60-73c8-427d-86d4-3c789c6736c5\.user_uploaded\media_1786001137239.png'
with open(image_path, 'rb') as f:
    files = {'file': ('test.png', f, 'image/png')}
    resp = requests.post('http://127.0.0.1:8000/api/v1/recipes/parse-image', files=files)
    
print(resp.status_code)
print(resp.text)