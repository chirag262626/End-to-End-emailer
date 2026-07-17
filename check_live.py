import os
import requests
from dotenv import load_dotenv

load_dotenv()

RENDER_API_KEY = os.getenv("RENDER_API_KEY")
h = {"Authorization": f"Bearer {RENDER_API_KEY}"}

res = requests.get("https://api.render.com/v1/services", headers=h)
services = res.json()
for s in services:
    svc = s.get("service", s)
    url = svc.get("serviceDetails", {}).get("url", "N/A")
    try:
        live_res = requests.get(url, timeout=10)
        print(f"{svc['name']}: {url} -> {live_res.status_code}")
    except Exception as e:
        print(f"{svc['name']}: {url} -> ERROR: {e}")
