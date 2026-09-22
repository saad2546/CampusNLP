"""
NLP Pipeline Orchestrator
Runs all 8 steps in sequence and returns a unified ComplaintAnalysis.
"""

from typing import List, Dict, Any

from app.nlp.classifier  import predict_category
from app.nlp.sentiment   import predict_sentiment
from app.nlp.ner         import extract_entities
from app.nlp.keywords    import extract_keywords
from app.nlp.summarizer  import summarize
from app.nlp.priority    import predict_priority
from app.nlp.similarity  import detect_duplicates


def run_pipeline(
    title: str,
    description: str,
    existing_complaints: List[Dict[str, Any]] = None,
    corpus_texts: List[str] = None,
) -> dict:
    """
    Full NLP analysis pipeline.

    Pipeline Steps:
        1. Category classification  (TF-IDF + ML / rule-based fallback)
        2. Subcategory classification
        3. Sentiment analysis        (ML / lexicon fallback)
        4. Named Entity Recognition  (spaCy + custom EntityRuler)
        5. Keyword extraction        (TF-IDF / frequency fallback)
        6. Extractive summarization  (TextRank)
        7. Priority prediction       (rule-based scoring)
        8. Duplicate detection       (cosine similarity)

    Args:
        title                — complaint title
        description          — complaint description
        existing_complaints  — list of {id, title, description} for duplicate check
        corpus_texts         — list of existing descriptions for TF-IDF keyword IDF

    Returns:
        dict matching NLPAnalysis schema
    """
    existing_complaints = existing_complaints or []
    corpus_texts        = corpus_texts or []

    # 1 + 2. Category + Subcategory
    category_result = predict_category(description, title)

    # 3. Sentiment
    sentiment_result = predict_sentiment(description, title)

    # 4. NER
    entities = extract_entities(f"{title}. {description}")

    # 5. Keywords
    keywords = extract_keywords(description, corpus=corpus_texts, top_n=8)

    # 6. Summarization
    summary = summarize(description, num_sentences=1)

    # 7. Priority (takes sentiment as minor input but does NOT equate them)
    priority_result = predict_priority(description, title, sentiment_result["sentiment"])

    # 8. Duplicate detection
    duplicate_result = detect_duplicates(
        new_text=description,
        new_title=title,
        existing_complaints=existing_complaints,
    )

    return {
        # Classification
        "category":            category_result["category"],
        "subcategory":         category_result["subcategory"],
        "confidence":          category_result["confidence"],
        "contributing_terms":  category_result["contributing_terms"],
        "assigned_department": category_result["assigned_department"],

        # Sentiment
        "sentiment":            sentiment_result["sentiment"],
        "sentiment_confidence": sentiment_result["sentiment_confidence"],

        # Information extraction
        "entities": [{"text": e["text"], "type": e["type"]} for e in entities],
        "keywords": keywords,

        # Summarization
        "summary": summary,

        # Priority
        "priority":           priority_result["priority"],
        "priority_score":     priority_result["priority_score"],
        "priority_breakdown": priority_result["priority_breakdown"],

        # Duplicate detection
        "is_duplicate":       duplicate_result["is_duplicate"],
        "similar_complaints": duplicate_result["similar_complaints"],
    }
