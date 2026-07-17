"""Deploy the FastAPI backend to Render — update existing service or create new one"""
import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

RENDER_API_KEY = os.getenv("RENDER_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
REPO = "https://github.com/chirag262626/End-to-End-emailer"

headers = {
    "Authorization": f"Bearer {RENDER_API_KEY}",
    "Accept": "application/json",
    "Content-Type": "application/json"
}

# 1. Get owner ID
res = requests.get("https://api.render.com/v1/owners", headers=headers)
owners = res.json()
owner_id = owners[0]["owner"]["id"]
print(f"Owner ID: {owner_id}")

# 2. List existing services
res = requests.get("https://api.render.com/v1/services", headers=headers)
services = res.json()

existing_service = None
for s in services:
    svc = s.get("service", s)
    print(f"Found service: {svc['name']} ({svc['id']})")
    if "cold-email" in svc["name"].lower() or "streamlit" in svc["name"].lower():
        existing_service = svc

if existing_service:
    service_id = existing_service["id"]
    print(f"\nUpdating existing service: {existing_service['name']} ({service_id})")

    # Update service settings
    update_payload = {
        "serviceDetails": {
            "envSpecificDetails": {
                "buildCommand": "pip install -r backend/requirements.txt",
                "startCommand": "cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT"
            }
        }
    }
    up_res = requests.patch(f"https://api.render.com/v1/services/{service_id}", headers=headers, json=update_payload)
    print(f"Update response: {up_res.status_code}")
    if up_res.status_code == 200:
        print("Service updated successfully!")
    else:
        print(f"Update response body: {up_res.text}")

    # Update env vars
    # First, check existing env vars
    env_res = requests.get(f"https://api.render.com/v1/services/{service_id}/env-vars", headers=headers)
    print(f"\nExisting env vars: {json.dumps(env_res.json(), indent=2)}")

    # Set ALLOWED_ORIGINS env var (will be updated after Vercel deploy)
    env_payload = [
        {"key": "GROQ_API_KEY", "value": GROQ_API_KEY},
        {"key": "ALLOWED_ORIGINS", "value": "http://localhost:3000"},
        {"key": "PYTHON_VERSION", "value": "3.11.0"}
    ]
    env_update = requests.put(f"https://api.render.com/v1/services/{service_id}/env-vars", headers=headers, json=env_payload)
    print(f"Env vars update: {env_update.status_code}")

    # Trigger a deploy
    deploy_res = requests.post(f"https://api.render.com/v1/services/{service_id}/deploys", headers=headers)
    print(f"\nDeploy triggered: {deploy_res.status_code}")
    deploy_data = deploy_res.json()
    print(json.dumps(deploy_data, indent=2))
else:
    print("\nNo existing service found. Creating new one...")
    create_payload = {
        "autoDeploy": "yes",
        "branch": "main",
        "name": "cold-email-api",
        "ownerId": owner_id,
        "repo": REPO,
        "type": "web_service",
        "envVars": [
            {"key": "GROQ_API_KEY", "value": GROQ_API_KEY},
            {"key": "ALLOWED_ORIGINS", "value": "http://localhost:3000"},
            {"key": "PYTHON_VERSION", "value": "3.11.0"}
        ],
        "serviceDetails": {
            "env": "python",
            "plan": "free",
            "region": "oregon",
            "envSpecificDetails": {
                "buildCommand": "pip install -r backend/requirements.txt",
                "startCommand": "cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT"
            }
        }
    }
    create_res = requests.post("https://api.render.com/v1/services", headers=headers, json=create_payload)
    print(f"Create response: {create_res.status_code}")
    print(json.dumps(create_res.json(), indent=2))
