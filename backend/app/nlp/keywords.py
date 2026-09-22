"""
NLP Step 5 — Keyword Extraction
Method: TF-IDF over complaint corpus (loaded at runtime from Firestore).
Falls back to frequency-based extraction when corpus is unavailable.
"""

from typing import List
from collections import Counter

from sklearn.feature_extraction.text import TfidfVectorizer

from app.nlp.preprocessing import preprocess, clean_text

# Stop-like words that add no keyword value beyond NLTK stopwords
EXTRA_STOP = {
    "college", "institute", "student", "professor", "teacher", "class",
    "apsit", "department", "semester", "year", "please", "kindly",
    "sir", "ma", "madam", "also", "would", "like", "really", "feel",
    "issue", "problem", "complaint", "request",
}


def _frequency_keywords(text: str, top_n: int = 8) -> List[str]:
    """Fallback: return top-N tokens by frequency (used when corpus is tiny)."""
    _, clean = preprocess(text)
    tokens = [t for t in clean.split() if t not in EXTRA_STOP and len(t) > 2]
    counter = Counter(tokens)
    return [word for word, _ in counter.most_common(top_n)]


def extract_keywords(text: str, corpus: List[str] = None, top_n: int = 8) -> List[str]:
    """
    TF-IDF-based keyword extraction.

    Args:
        text   — the complaint text to extract keywords from
        corpus — list of existing complaint texts (for IDF weighting)
        top_n  — number of keywords to return

    Returns:
        List of top keyword strings.
    """
    _, clean = preprocess(text)

    if not corpus or len(corpus) < 3:
        return _frequency_keywords(text, top_n)

    # Preprocess corpus
    processed_corpus = []
    for doc in corpus:
        _, c = preprocess(doc)
        processed_corpus.append(c)

    # Add current doc to corpus if not already present
    if clean not in processed_corpus:
        all_docs = processed_corpus + [clean]
        target_idx = len(all_docs) - 1
    else:
        all_docs = processed_corpus
        target_idx = all_docs.index(clean)

    try:
        vectorizer = TfidfVectorizer(
            max_features=5000,
            ngram_range=(1, 2),
            min_df=1,
        )
        tfidf_matrix = vectorizer.fit_transform(all_docs)
        feature_names = vectorizer.get_feature_names_out()

        target_vector = tfidf_matrix[target_idx].toarray()[0]
        top_indices   = target_vector.argsort()[::-1]

        keywords = []
        for idx in top_indices:
            word = feature_names[idx]
            if (
                target_vector[idx] > 0
                and word not in EXTRA_STOP
                and len(word) > 2
            ):
                keywords.append(word)
            if len(keywords) >= top_n:
                break

        return keywords if keywords else _frequency_keywords(text, top_n)

    except Exception:
        return _frequency_keywords(text, top_n)
