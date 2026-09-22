"""
A.P. Shah Institute of Technology
Intelligent College Complaint Analyzer — FastAPI Entry Point
"""

import os
from contextlib import asynccontextmanager

import nltk
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.firebase.config import initialize_firebase
from app.nlp.classifier import load_classifier
from app.nlp.sentiment import load_sentiment_model
from app.routes import complaints, admin, analytics, nlp

load_dotenv()

# ── Startup / Shutdown ────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load all heavy resources once on startup."""
    print("🚀 Starting A.P. Shah Complaint Analyzer API…")

    # Firebase
    initialize_firebase()
    print("✅ Firebase initialized")

    # Download NLTK data (idempotent — safe to run every startup)
    for pkg in ["punkt", "punkt_tab", "stopwords", "wordnet", "omw-1.4",
                "averaged_perceptron_tagger", "vader_lexicon"]:
        nltk.download(pkg, quiet=True)
    print("✅ NLTK data ready")

    # Load ML models into memory
    load_classifier()
    load_sentiment_model()
    print("✅ ML models loaded")

    yield
    print("🛑 Shutting down…")


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="A.P. Shah College Complaint Analyzer",
    description="NLP-powered intelligent complaint management system for A.P. Shah Institute of Technology",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow the React dev server
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────

app.include_router(complaints.router, prefix="/complaints", tags=["Complaints"])
app.include_router(admin.router,      prefix="/admin",      tags=["Admin"])
app.include_router(analytics.router,  prefix="/analytics",  tags=["Analytics"])
app.include_router(nlp.router,        prefix="/nlp",        tags=["NLP"])


@app.get("/", tags=["Health"])
async def root():
    return {
        "service": "A.P. Shah College Complaint Analyzer API",
        "status": "running",
        "version": "1.0.0",
    }


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok"}
