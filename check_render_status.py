import os
from dotenv import load_dotenv
import requests
import json

load_dotenv()

RENDER_API_KEY = os.getenv("RENDER_API_KEY")
h = {"Authorization": f"Bearer {RENDER_API_KEY}", "Accept": "application/json"}

# Get services
res = requests.get("https://api.render.com/v1/services", headers=h)
services = res.json()

for s in services:
    svc = s.get("service", s)
    url = svc.get("serviceDetails", {}).get("url", "N/A")
    print(f"Service: {svc['name']}")
    print(f"  ID: {svc['id']}")
    print(f"  URL: {url}")
    
    # Get latest deploy
    dep_res = requests.get(f"https://api.render.com/v1/services/{svc['id']}/deploys?limit=1", headers=h)
    deploys = dep_res.json()
    if deploys:
        d = deploys[0].get("deploy", deploys[0])
        print(f"  Latest deploy: status={d.get('status')} id={d.get('id')}")
    print()
