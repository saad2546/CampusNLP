"""NLP debug router — run pipeline on raw text without authentication (dev only)."""

import os
from fastapi import APIRouter
from app.nlp.pipeline import run_pipeline
from app.schemas.complaint import NLPAnalyzeRequest

router = APIRouter()


@router.post("/analyze")
async def analyze_text(body: NLPAnalyzeRequest):
    """
    Debug endpoint: run full NLP pipeline on raw text.
    Returns complete analysis JSON.
    Available in all environments for testing.
    """
    result = run_pipeline(
        title=body.title or "",
        description=body.text,
        existing_complaints=[],
        corpus_texts=[],
    )
    return result
