"""
Category Classifier Training Script
Trains Naive Bayes, Logistic Regression, and SVM on complaints.csv.
Compares models and saves the best one.

Run from backend/ directory:
    python training/train_category.py
"""

import os
import sys
import joblib
import pandas as pd
import numpy as np

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import LinearSVC
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, classification_report, confusion_matrix
)
from sklearn.pipeline import Pipeline
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns

# Add backend root to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.nlp.preprocessing import preprocess

# ── Paths ─────────────────────────────────────────────────────────────────────

DATASET_PATH  = os.path.join(os.path.dirname(__file__), "..", "datasets", "complaints.csv")
MODEL_DIR     = os.path.join(os.path.dirname(__file__), "..", "ml_models")
RESULTS_DIR   = os.path.join(os.path.dirname(__file__), "..", "training", "results")

os.makedirs(MODEL_DIR,   exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)


def preprocess_text(text: str) -> str:
    _, clean = preprocess(str(text))
    return clean


def load_data():
    df = pd.read_csv(DATASET_PATH)
    print(f"✅ Dataset loaded: {len(df)} rows")
    print(f"\nCategory distribution:\n{df['category'].value_counts()}\n")
    return df


def train_and_evaluate(X_train, X_test, y_train, y_test, labels):
    """Train three models, compare, save best."""

    # ── Preprocess ────────────────────────────────────────────────────────────
    print("🔄 Preprocessing text (this may take a minute)…")
    X_train_clean = [preprocess_text(t) for t in X_train]
    X_test_clean  = [preprocess_text(t) for t in X_test]

    # ── TF-IDF ────────────────────────────────────────────────────────────────
    vectorizer = TfidfVectorizer(
        max_features=10000,
        ngram_range=(1, 2),
        sublinear_tf=True,
        min_df=2,
    )
    X_train_vec = vectorizer.fit_transform(X_train_clean)
    X_test_vec  = vectorizer.transform(X_test_clean)

    # ── Models ────────────────────────────────────────────────────────────────
    models = {
        "Naive Bayes":        MultinomialNB(alpha=0.1),
        "Logistic Regression": LogisticRegression(max_iter=1000, C=1.0, solver="lbfgs", multi_class="multinomial"),
        "SVM (LinearSVC)":    LinearSVC(max_iter=2000, C=1.0),
    }

    results = {}
    print("\n" + "="*70)
    print(f"{'Model':<25} {'Accuracy':>10} {'Precision':>10} {'Recall':>10} {'F1':>10}")
    print("="*70)

    for name, model in models.items():
        model.fit(X_train_vec, y_train)
        y_pred = model.predict(X_test_vec)

        acc  = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, average="weighted", zero_division=0)
        rec  = recall_score(y_test, y_pred, average="weighted", zero_division=0)
        f1   = f1_score(y_test, y_pred, average="weighted", zero_division=0)

        results[name] = {"model": model, "accuracy": acc, "precision": prec, "recall": rec, "f1": f1, "y_pred": y_pred}
        print(f"{name:<25} {acc*100:>9.2f}% {prec*100:>9.2f}% {rec*100:>9.2f}% {f1*100:>9.2f}%")

    print("="*70)

    # ── Best model ────────────────────────────────────────────────────────────
    best_name = max(results, key=lambda k: results[k]["f1"])
    best      = results[best_name]
    print(f"\n🏆 Best model: {best_name} (F1 = {best['f1']*100:.2f}%)")

    # ── Detailed report ───────────────────────────────────────────────────────
    print(f"\n{'='*70}")
    print(f"Classification Report — {best_name}")
    print(classification_report(y_test, best["y_pred"], target_names=labels, zero_division=0))

    # ── Confusion matrix ──────────────────────────────────────────────────────
    cm = confusion_matrix(y_test, best["y_pred"], labels=labels)
    plt.figure(figsize=(12, 10))
    sns.heatmap(cm, annot=True, fmt="d", xticklabels=labels, yticklabels=labels,
                cmap="Blues", linewidths=0.5)
    plt.title(f"Confusion Matrix — {best_name} (Category Classification)")
    plt.ylabel("Actual")
    plt.xlabel("Predicted")
    plt.tight_layout()
    cm_path = os.path.join(RESULTS_DIR, "category_confusion_matrix.png")
    plt.savefig(cm_path, dpi=150)
    print(f"✅ Confusion matrix saved: {cm_path}")

    # ── Comparison bar chart ──────────────────────────────────────────────────
    model_names = list(results.keys())
    f1_scores   = [results[m]["f1"] * 100 for m in model_names]
    acc_scores  = [results[m]["accuracy"] * 100 for m in model_names]

    x = np.arange(len(model_names))
    width = 0.35
    fig, ax = plt.subplots(figsize=(9, 5))
    bars1 = ax.bar(x - width/2, acc_scores, width, label="Accuracy", color="#6366f1")
    bars2 = ax.bar(x + width/2, f1_scores,  width, label="F1 Score",  color="#8b5cf6")
    ax.set_ylim(0, 105)
    ax.set_ylabel("Score (%)")
    ax.set_title("Model Comparison — Category Classification")
    ax.set_xticks(x)
    ax.set_xticklabels(model_names)
    ax.legend()
    ax.bar_label(bars1, fmt="%.1f%%", padding=3, fontsize=8)
    ax.bar_label(bars2, fmt="%.1f%%", padding=3, fontsize=8)
    plt.tight_layout()
    chart_path = os.path.join(RESULTS_DIR, "category_model_comparison.png")
    plt.savefig(chart_path, dpi=150)
    print(f"✅ Model comparison chart saved: {chart_path}")

    # ── Save best model + vectorizer ─────────────────────────────────────────
    joblib.dump(best["model"], os.path.join(MODEL_DIR, "category_model.pkl"))
    joblib.dump(vectorizer,    os.path.join(MODEL_DIR, "tfidf_vectorizer.pkl"))
    print(f"✅ Model saved: {MODEL_DIR}/category_model.pkl")
    print(f"✅ Vectorizer saved: {MODEL_DIR}/tfidf_vectorizer.pkl")

    # ── Save results CSV ──────────────────────────────────────────────────────
    results_rows = []
    for name, res in results.items():
        results_rows.append({
            "model":     name,
            "accuracy":  f"{res['accuracy']*100:.2f}%",
            "precision": f"{res['precision']*100:.2f}%",
            "recall":    f"{res['recall']*100:.2f}%",
            "f1":        f"{res['f1']*100:.2f}%",
        })
    pd.DataFrame(results_rows).to_csv(os.path.join(RESULTS_DIR, "category_results.csv"), index=False)

    return vectorizer, best["model"]


def train_subcategory(df, vectorizer):
    """Train a subcategory classifier on top of the same TF-IDF vectorizer."""
    print("\n🔄 Training subcategory classifier…")

    X_clean = [preprocess_text(t) for t in df["complaint"]]
    X_vec   = vectorizer.transform(X_clean)
    y       = df["subcategory"]

    X_train, X_test, y_train, y_test = train_test_split(X_vec, y, test_size=0.2, random_state=42, stratify=y)

    model = LogisticRegression(max_iter=1000, C=1.0, solver="lbfgs", multi_class="multinomial")
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)
    print(f"✅ Subcategory model F1: {f1*100:.2f}%")
    joblib.dump(model, os.path.join(MODEL_DIR, "subcategory_model.pkl"))
    print(f"✅ Subcategory model saved")


if __name__ == "__main__":
    df = load_data()

    X = df["complaint"]
    y = df["category"]
    labels = sorted(y.unique().tolist())

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"Train: {len(X_train)} | Test: {len(X_test)}")

    vectorizer, best_model = train_and_evaluate(X_train, X_test, y_train, y_test, labels)
    train_subcategory(df, vectorizer)

    print("\n✅ Training complete. Models saved to ml_models/")
