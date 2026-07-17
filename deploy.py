import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

RENDER_API_KEY = os.getenv("RENDER_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

headers = {
    "Authorization": f"Bearer {RENDER_API_KEY}",
    "Accept": "application/json",
    "Content-Type": "application/json"
}

payload = {
    "autoDeploy": "yes",
    "branch": "main",
    "name": "cold-email-generator",
    "ownerId": "",  # we will find ownerId first
    "repo": "https://github.com/chirag262626/End-to-End-emailer",
    "type": "web_service",
    "envVars": [
        {
            "key": "GROQ_API_KEY",
            "value": GROQ_API_KEY
        }
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

# Get Owner ID
res = requests.get("https://api.render.com/v1/owners", headers=headers)
if res.status_code != 200:
    print("Failed to get owners:", res.text)
    exit(1)

owners = res.json()
print("Owners:", owners)
owner_id = owners[0]["owner"]["id"]
payload["ownerId"] = owner_id

# Create Service
res_create = requests.post("https://api.render.com/v1/services", headers=headers, json=payload)
if res_create.status_code not in [200, 201]:
    print("Failed to create service:", res_create.status_code, res_create.text)
    exit(1)

service = res_create.json()
print("Service Created successfully:")
print(json.dumps(service, indent=2))
