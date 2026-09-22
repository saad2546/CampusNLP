"""
Sentiment Classifier Training Script
Trains a TF-IDF + Logistic Regression sentiment model on complaints.csv.
Labels: Positive | Neutral | Negative

Run from backend/ directory:
    python training/train_sentiment.py
"""

import os
import sys
import joblib
import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import LinearSVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, f1_score, classification_report, confusion_matrix
)
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from app.nlp.preprocessing import preprocess

DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "datasets", "complaints.csv")
MODEL_DIR    = os.path.join(os.path.dirname(__file__), "..", "ml_models")
RESULTS_DIR  = os.path.join(os.path.dirname(__file__), "..", "training", "results")

os.makedirs(MODEL_DIR,   exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)


def preprocess_text(text: str) -> str:
    _, clean = preprocess(str(text))
    return clean


if __name__ == "__main__":
    df = pd.read_csv(DATASET_PATH)
    print(f"✅ Dataset: {len(df)} rows")
    print(f"Sentiment distribution:\n{df['sentiment'].value_counts()}\n")

    print("🔄 Preprocessing…")
    X_clean = [preprocess_text(t) for t in df["complaint"]]
    y       = df["sentiment"]

    X_train, X_test, y_train, y_test = train_test_split(
        X_clean, y, test_size=0.2, random_state=42, stratify=y
    )

    vectorizer = TfidfVectorizer(max_features=8000, ngram_range=(1, 2), sublinear_tf=True)
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec  = vectorizer.transform(X_test)

    models = {
        "Naive Bayes":         MultinomialNB(alpha=0.1),
        "Logistic Regression": LogisticRegression(max_iter=1000, C=1.0, solver="lbfgs", multi_class="multinomial"),
        "SVM":                 LinearSVC(max_iter=2000, C=1.0),
    }

    labels = ["Positive", "Neutral", "Negative"]
    results = {}

    print(f"\n{'Model':<25} {'Accuracy':>10} {'F1':>10}")
    print("="*50)
    for name, model in models.items():
        model.fit(X_train_vec, y_train)
        y_pred = model.predict(X_test_vec)
        acc = accuracy_score(y_test, y_pred)
        f1  = f1_score(y_test, y_pred, average="weighted", zero_division=0)
        results[name] = {"model": model, "accuracy": acc, "f1": f1, "y_pred": y_pred}
        print(f"{name:<25} {acc*100:>9.2f}% {f1*100:>9.2f}%")

    best_name = max(results, key=lambda k: results[k]["f1"])
    best      = results[best_name]
    print(f"\n🏆 Best model: {best_name} (F1 = {best['f1']*100:.2f}%)")

    print(f"\nClassification Report — {best_name}")
    print(classification_report(y_test, best["y_pred"], target_names=labels, zero_division=0))

    # Confusion matrix
    cm = confusion_matrix(y_test, best["y_pred"], labels=labels)
    plt.figure(figsize=(7, 5))
    sns.heatmap(cm, annot=True, fmt="d", xticklabels=labels, yticklabels=labels, cmap="Purples")
    plt.title(f"Confusion Matrix — Sentiment ({best_name})")
    plt.ylabel("Actual")
    plt.xlabel("Predicted")
    plt.tight_layout()
    plt.savefig(os.path.join(RESULTS_DIR, "sentiment_confusion_matrix.png"), dpi=150)
    print(f"✅ Confusion matrix saved")

    # Save model
    joblib.dump(best["model"], os.path.join(MODEL_DIR, "sentiment_model.pkl"))
    joblib.dump(vectorizer,    os.path.join(MODEL_DIR, "sentiment_tfidf.pkl"))
    print(f"✅ Sentiment model saved to {MODEL_DIR}/")
