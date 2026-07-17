import os
import requests
from dotenv import load_dotenv

load_dotenv()

RENDER_API_KEY = os.getenv("RENDER_API_KEY")
h = {"Authorization": f"Bearer {RENDER_API_KEY}", "Accept": "application/json"}

res = requests.get("https://api.render.com/v1/services", headers=h)
services = res.json()
for s in services:
    svc = s.get("service", s)
    service_id = svc["id"]
    logs_res = requests.get(f"https://api.render.com/v1/services/{service_id}/deploys", headers=h)
    deploys = logs_res.json()
    if deploys:
        dep = deploys[0].get("deploy", deploys[0])
        print(f"Service: {svc['name']}")
        print(f"  Latest deploy: {dep['id']} status={dep.get('status')}")
