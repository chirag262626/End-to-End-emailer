import os
import io
import csv
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

from chains import Chain
from portfolio import Portfolio
from utils import clean_text

# --- Globals initialized at startup ---
chain: Chain = None
portfolio: Portfolio = None

PORTFOLIO_PATH = os.path.join(os.path.dirname(__file__), "resource", "my_portfolio.csv")


@asynccontextmanager
async def lifespan(app: FastAPI):
    global chain, portfolio
    chain = Chain()
    portfolio = Portfolio(file_path=PORTFOLIO_PATH)
    yield


app = FastAPI(
    title="Cold Email Generator API",
    description="Generate cold emails from job posting URLs using AI",
    version="1.0.0",
    lifespan=lifespan,
)

# --- CORS ---
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Pydantic models ---
class GenerateEmailRequest(BaseModel):
    url: str


class GenerateEmailResponse(BaseModel):
    emails: list[str]
    jobs: list[dict]


class PortfolioEntry(BaseModel):
    techstack: str
    link: str


class PortfolioResponse(BaseModel):
    entries: list[PortfolioEntry]


# --- Routes ---
@app.get("/api/health")
async def health_check():
    return {"status": "ok"}


@app.post("/api/generate-email", response_model=GenerateEmailResponse)
async def generate_email(request: GenerateEmailRequest):
    try:
        from langchain_community.document_loaders import WebBaseLoader

        loader = WebBaseLoader([request.url])
        data = clean_text(loader.load().pop().page_content)
        portfolio.load_portfolio()
        jobs = chain.extract_jobs(data)

        emails = []
        for job in jobs:
            skills = job.get("skills", [])
            links = portfolio.query_links(skills)
            email = chain.write_mail(job, links)
            emails.append(email)

        return GenerateEmailResponse(emails=emails, jobs=jobs)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/portfolio", response_model=PortfolioResponse)
async def get_portfolio():
    try:
        import pandas as pd

        df = pd.read_csv(PORTFOLIO_PATH)
        entries = [
            PortfolioEntry(techstack=row["Techstack"], link=row["Links"])
            for _, row in df.iterrows()
        ]
        return PortfolioResponse(entries=entries)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/portfolio/upload", response_model=PortfolioResponse)
async def upload_portfolio(file: UploadFile = File(...)):
    global portfolio
    try:
        content = await file.read()
        text = content.decode("utf-8")

        # Validate CSV format
        reader = csv.DictReader(io.StringIO(text))
        if "Techstack" not in reader.fieldnames or "Links" not in reader.fieldnames:
            raise HTTPException(
                status_code=400,
                detail="CSV must have 'Techstack' and 'Links' columns",
            )

        # Save to disk
        with open(PORTFOLIO_PATH, "w", encoding="utf-8", newline="") as f:
            f.write(text)

        # Reload portfolio
        portfolio = Portfolio(file_path=PORTFOLIO_PATH)

        # Return new entries
        return await get_portfolio()

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
