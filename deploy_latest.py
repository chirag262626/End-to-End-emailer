import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

RENDER_API_KEY = os.getenv("RENDER_API_KEY")
h = {"Authorization": f"Bearer {RENDER_API_KEY}", "Content-Type": "application/json"}

# Trigger deploy on the latest service
res = requests.get("https://api.render.com/v1/services", headers=h)
services = res.json()
for s in services:
    svc = s.get("service", s)
    service_id = svc["id"]
    deploy_res = requests.post(f"https://api.render.com/v1/services/{service_id}/deploys", headers=h)
    print(f"Deploy triggered for {svc['name']}: {deploy_res.status_code}")
    print(json.dumps(deploy_res.json(), indent=2))
