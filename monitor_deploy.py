import os
import requests
import json
import time
from dotenv import load_dotenv

load_dotenv()

RENDER_API_KEY = os.getenv("RENDER_API_KEY")
h = {"Authorization": f"Bearer {RENDER_API_KEY}", "Accept": "application/json"}


def get_services():
    res = requests.get("https://api.render.com/v1/services", headers=h)
    return res.json()


def get_deploys(service_id):
    res = requests.get(f"https://api.render.com/v1/services/{service_id}/deploys", headers=h)
    return res.json()


services = get_services()
for s in services:
    svc = s.get("service", s)
    print(f"Service: {svc['name']} ({svc['id']})")
    deploys = get_deploys(svc["id"])
    for d in deploys[:3]:
        dep = d.get("deploy", d)
        print(f"  Deploy {dep['id']}: status={dep.get('status')} created={dep.get('createdAt')}")
