"""
NLP Step 3 — Sentiment Analysis
Model: TF-IDF + Logistic Regression (trained offline)
Labels: Positive | Neutral | Negative

Note: Sentiment ≠ Priority. This module only detects emotional tone.
"""

import os
import re
import joblib

from app.nlp.preprocessing import preprocess

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "ml_models")
SENTIMENT_MODEL_PATH    = os.path.join(MODEL_DIR, "sentiment_model.pkl")
SENTIMENT_TFIDF_PATH    = os.path.join(MODEL_DIR, "sentiment_tfidf.pkl")

_sentiment_model = None
_sentiment_tfidf = None

# ── Lexicon fallback ──────────────────────────────────────────────────────────

POSITIVE_WORDS = {
    "good", "great", "excellent", "wonderful", "amazing", "helpful",
    "useful", "efficient", "clean", "best", "superb", "fantastic",
    "improved", "happy", "satisfied", "appreciate", "thank", "love",
    "outstanding", "perfect", "nice", "well",
}

NEGATIVE_WORDS = {
    "bad", "poor", "terrible", "awful", "broken", "slow", "not working",
    "fail", "failed", "issue", "problem", "complaint", "annoying",
    "frustrated", "disappointed", "unfair", "wrong", "error", "fix",
    "worst", "horrible", "disgusting", "dirty", "damage", "delay",
    "closed", "unavailable", "missing", "unable", "cannot", "refuse",
    "useless", "waste", "corrupt", "cheating",
}


def load_sentiment_model():
    """Load trained sentiment model from disk."""
    global _sentiment_model, _sentiment_tfidf
    if os.path.exists(SENTIMENT_MODEL_PATH) and os.path.exists(SENTIMENT_TFIDF_PATH):
        _sentiment_model = joblib.load(SENTIMENT_MODEL_PATH)
        _sentiment_tfidf = joblib.load(SENTIMENT_TFIDF_PATH)
        print(f"✅ Sentiment model loaded")
    else:
        print("⚠️  Sentiment model not found — using lexicon fallback.")


def _lexicon_sentiment(text: str) -> tuple[str, float]:
    """Simple lexicon-based fallback."""
    text_lower = text.lower()
    pos_score = sum(1 for w in POSITIVE_WORDS if w in text_lower)
    neg_score = sum(1 for w in NEGATIVE_WORDS if w in text_lower)

    # Check for negation near positive words
    negation_pattern = re.compile(r"\b(not|no|never|cannot|can't|don't|doesn't)\b\s+\w+", re.IGNORECASE)
    negations = len(negation_pattern.findall(text_lower))
    neg_score += negations

    total = pos_score + neg_score
    if total == 0:
        return "Neutral", 0.60
    if neg_score > pos_score:
        conf = min(0.50 + (neg_score - pos_score) * 0.08, 0.92)
        return "Negative", round(conf, 4)
    elif pos_score > neg_score:
        conf = min(0.50 + (pos_score - neg_score) * 0.08, 0.92)
        return "Positive", round(conf, 4)
    return "Neutral", 0.60


def predict_sentiment(text: str, title: str = "") -> dict:
    """
    Predict sentiment of complaint text.
    Returns: {sentiment: str, sentiment_confidence: float}
    """
    combined = f"{title} {text}".strip()
    _, clean = preprocess(combined)

    if _sentiment_model is not None and _sentiment_tfidf is not None:
        vec = _sentiment_tfidf.transform([clean])
        label = _sentiment_model.predict(vec)[0]
        # LinearSVC doesn't have predict_proba — use decision_function scores instead
        if hasattr(_sentiment_model, "predict_proba"):
            proba = _sentiment_model.predict_proba(vec)[0]
            confidence = float(proba.max())
        else:
            # Softmax over decision function scores to get a confidence estimate
            import numpy as np
            scores = _sentiment_model.decision_function(vec)[0]
            if scores.ndim == 0:
                confidence = 0.70
            else:
                exp_scores = np.exp(scores - scores.max())
                softmax = exp_scores / exp_scores.sum()
                confidence = float(softmax.max())
    else:
        label, confidence = _lexicon_sentiment(combined)

    return {"sentiment": label, "sentiment_confidence": round(confidence, 4)}
