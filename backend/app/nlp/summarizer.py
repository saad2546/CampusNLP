"""
NLP Step 6 — Extractive Summarization (TextRank)
Method: Build a sentence similarity graph using TF-IDF cosine similarity,
        then rank sentences using PageRank. Return top sentence(s).

No LLM required — fully explainable to examiners.
"""

import re
from typing import List

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.nlp.preprocessing import clean_text


def _split_sentences(text: str) -> List[str]:
    """Split text into sentences."""
    # Handle abbreviations and decimal numbers crudely
    text = re.sub(r"([A-Z][a-z]+)\.", r"\1<PERIOD>", text)
    sentences = re.split(r"(?<=[.!?])\s+", text)
    sentences = [s.replace("<PERIOD>", ".").strip() for s in sentences if len(s.strip()) > 10]
    return sentences


def _pagerank(similarity_matrix: np.ndarray, damping: float = 0.85, iterations: int = 100) -> np.ndarray:
    """Simple PageRank implementation."""
    n = similarity_matrix.shape[0]
    scores = np.ones(n) / n

    # Row-normalize
    row_sums = similarity_matrix.sum(axis=1, keepdims=True)
    row_sums[row_sums == 0] = 1
    norm_matrix = similarity_matrix / row_sums

    for _ in range(iterations):
        scores = (1 - damping) / n + damping * norm_matrix.T @ scores

    return scores


def summarize(text: str, num_sentences: int = 1) -> str:
    """
    TextRank extractive summarization.

    Args:
        text          — raw complaint text
        num_sentences — number of sentences to include in summary

    Returns:
        Summary string (most representative sentence(s)).
    """
    sentences = _split_sentences(text)

    if len(sentences) == 0:
        return text.strip()[:200]
    if len(sentences) == 1:
        return sentences[0]
    if len(sentences) <= 2:
        return sentences[0]

    # Clean sentences for TF-IDF
    cleaned = [clean_text(s) for s in sentences]
    cleaned = [c if c.strip() else "placeholder" for c in cleaned]

    try:
        vectorizer = TfidfVectorizer(min_df=1)
        tfidf_matrix = vectorizer.fit_transform(cleaned)
        sim_matrix = cosine_similarity(tfidf_matrix, tfidf_matrix)

        scores = _pagerank(sim_matrix)
        ranked_idx = scores.argsort()[::-1]

        # Select top sentences in original order to maintain coherence
        top_idx = sorted(ranked_idx[:num_sentences])
        summary = " ".join(sentences[i] for i in top_idx)
        return summary

    except Exception:
        # Fallback: return first sentence
        return sentences[0]
