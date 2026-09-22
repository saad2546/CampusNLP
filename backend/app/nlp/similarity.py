"""
NLP Step 8 — Duplicate Complaint Detection
Method: TF-IDF + Cosine Similarity against existing complaints in Firestore.
Threshold: similarity > 0.80 → flag as potential duplicate.
"""

from typing import List, Dict, Any

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.nlp.preprocessing import preprocess

DUPLICATE_THRESHOLD = 0.72   # complaints above this score are flagged


def detect_duplicates(
    new_text: str,
    new_title: str,
    existing_complaints: List[Dict[str, Any]],
    top_k: int = 5,
) -> dict:
    """
    Compare new complaint against existing ones using TF-IDF cosine similarity.

    Args:
        new_text            — description of the new complaint
        new_title           — title of the new complaint
        existing_complaints — list of {id, title, description} dicts from Firestore
        top_k               — max similar complaints to return

    Returns:
        {
            is_duplicate: bool,
            similar_complaints: [{id, title, similarity}]
        }
    """
    if not existing_complaints:
        return {"is_duplicate": False, "similar_complaints": []}

    # Prepare documents
    new_combined = f"{new_title} {new_text}".strip()
    _, new_clean  = preprocess(new_combined)

    corpus_clean = []
    corpus_meta  = []
    for c in existing_complaints:
        combined = f"{c.get('title', '')} {c.get('description', '')}".strip()
        _, cleaned = preprocess(combined)
        corpus_clean.append(cleaned if cleaned.strip() else "placeholder")
        corpus_meta.append({"id": c["id"], "title": c.get("title", "Untitled")})

    if not any(c.strip() for c in corpus_clean):
        return {"is_duplicate": False, "similar_complaints": []}

    try:
        vectorizer = TfidfVectorizer(min_df=1, ngram_range=(1, 2))
        all_docs   = corpus_clean + [new_clean]
        tfidf_mat  = vectorizer.fit_transform(all_docs)

        new_vec    = tfidf_mat[-1]                   # last row = new complaint
        corpus_mat = tfidf_mat[:-1]                  # all existing

        similarities = cosine_similarity(new_vec, corpus_mat).flatten()

        # Rank by similarity descending
        ranked_idx = similarities.argsort()[::-1][:top_k]

        similar_complaints = []
        for idx in ranked_idx:
            sim = float(similarities[idx])
            if sim >= DUPLICATE_THRESHOLD:
                similar_complaints.append({
                    "id":         corpus_meta[idx]["id"],
                    "title":      corpus_meta[idx]["title"],
                    "similarity": round(sim, 4),
                })

        is_duplicate = len(similar_complaints) > 0

        return {
            "is_duplicate":       is_duplicate,
            "similar_complaints": similar_complaints,
        }

    except Exception as e:
        print(f"Similarity computation error: {e}")
        return {"is_duplicate": False, "similar_complaints": []}
