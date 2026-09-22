"""
NLP Step 1 — Text Preprocessing
Pipeline: lowercase → clean → expand contractions → tokenize → remove stopwords
          (preserving negations) → lemmatize
"""

import re
import string
from typing import List, Tuple

import nltk
import spacy
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

# Load spaCy model (lightweight)
try:
    _nlp = spacy.load("en_core_web_sm")
except OSError:
    import subprocess, sys
    subprocess.run([sys.executable, "-m", "spacy", "download", "en_core_web_sm"], check=True)
    _nlp = spacy.load("en_core_web_sm")

# Negation words that MUST be preserved (removing them breaks sentiment)
NEGATION_WORDS = {
    "not", "no", "never", "nor", "neither", "without", "nobody",
    "nothing", "nowhere", "cannot", "cant", "cant", "won't", "wont",
    "don't", "dont", "doesn't", "doesnt", "didn't", "didnt",
    "isn't", "isnt", "aren't", "arent", "wasn't", "wasnt",
    "weren't", "werent", "hasn't", "hasnt", "haven't", "havent",
    "hadn't", "hadnt", "wouldn't", "wouldnt", "shouldn't", "shouldnt",
    "couldn't", "couldnt", "mustn't", "mustnt"
}

# Contractions map
CONTRACTIONS = {
    "aren't": "are not", "can't": "cannot", "couldn't": "could not",
    "didn't": "did not", "doesn't": "does not", "don't": "do not",
    "hadn't": "had not", "hasn't": "has not", "haven't": "have not",
    "he'd": "he would", "he'll": "he will", "he's": "he is",
    "i'd": "i would", "i'll": "i will", "i'm": "i am", "i've": "i have",
    "isn't": "is not", "it's": "it is", "let's": "let us",
    "mustn't": "must not", "shan't": "shall not", "she'd": "she would",
    "she'll": "she will", "she's": "she is", "shouldn't": "should not",
    "that's": "that is", "there's": "there is", "they'd": "they would",
    "they'll": "they will", "they're": "they are", "they've": "they have",
    "we'd": "we would", "we're": "we are", "we've": "we have",
    "weren't": "were not", "what's": "what is", "where's": "where is",
    "who's": "who is", "won't": "will not", "wouldn't": "would not",
    "you'd": "you would", "you'll": "you will", "you're": "you are",
    "you've": "you have", "n't": " not",
}

# Base NLTK stopwords minus negations
_base_stopwords = set(stopwords.words("english")) - NEGATION_WORDS


def expand_contractions(text: str) -> str:
    """Expand English contractions: can't → cannot, don't → do not, etc."""
    pattern = re.compile(
        r"\b(" + "|".join(re.escape(k) for k in CONTRACTIONS.keys()) + r")\b",
        re.IGNORECASE,
    )
    def replace(match):
        word = match.group(0)
        expanded = CONTRACTIONS.get(word.lower(), word)
        # preserve original capitalization roughly
        return expanded.capitalize() if word[0].isupper() else expanded
    return pattern.sub(replace, text)


def clean_text(text: str) -> str:
    """Lowercase, expand contractions, remove extra punctuation/whitespace."""
    text = text.lower()
    text = expand_contractions(text)
    # Remove URLs
    text = re.sub(r"https?://\S+|www\.\S+", " ", text)
    # Remove emails
    text = re.sub(r"\S+@\S+", " ", text)
    # Remove special characters but keep alphanumeric + apostrophes + spaces
    text = re.sub(r"[^a-zA-Z0-9\s']", " ", text)
    # Collapse multiple spaces
    text = re.sub(r"\s+", " ", text).strip()
    return text


def tokenize(text: str) -> List[str]:
    """NLTK word tokenization."""
    return word_tokenize(text)


def remove_stopwords(tokens: List[str]) -> List[str]:
    """Remove stopwords, preserving negation words."""
    return [t for t in tokens if t not in _base_stopwords and len(t) > 1]


def lemmatize(tokens: List[str]) -> List[str]:
    """spaCy lemmatization."""
    doc = _nlp(" ".join(tokens))
    return [token.lemma_ for token in doc if not token.is_space]


def preprocess(text: str) -> Tuple[List[str], str]:
    """
    Full preprocessing pipeline.
    Returns:
        tokens  — list of lemmatized, stopword-filtered tokens
        clean   — single cleaned string (for TF-IDF)
    """
    cleaned = clean_text(text)
    tokens = tokenize(cleaned)
    tokens = remove_stopwords(tokens)
    tokens = lemmatize(tokens)
    clean_str = " ".join(tokens)
    return tokens, clean_str


def get_spacy_nlp():
    """Return the loaded spaCy model (used by NER)."""
    return _nlp
