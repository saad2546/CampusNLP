"""
NLP Step 2 — Category & Subcategory Classifier
Model: TF-IDF + best of {Naive Bayes, Logistic Regression, SVM}
Trained offline, loaded at startup via load_classifier().
"""

import os
import joblib
from typing import Optional

from app.nlp.preprocessing import preprocess

# ── Constants ─────────────────────────────────────────────────────────────────

CATEGORIES = [
    "Infrastructure",
    "Academics",
    "Examination",
    "Faculty",
    "Fees & Finance",
    "Hostel",
    "Library",
    "Transport",
    "IT Services",
    "Canteen",
    "Other",
]

SUBCATEGORY_MAP = {
    "Infrastructure": [
        "Computer Lab", "Classroom", "Electricity", "Air Conditioning",
        "Furniture", "Water Supply", "Sanitation", "Auditorium", "Other",
    ],
    "Academics": [
        "Study Material", "Attendance", "Lectures", "Assignments",
        "Timetable", "Syllabus", "Other",
    ],
    "Examination": [
        "Marks / Result", "Exam Timetable", "Hall Ticket",
        "Revaluation", "Paper Pattern", "Other",
    ],
    "Faculty": [
        "Faculty Behavior", "Faculty Availability", "Teaching Quality", "Other",
    ],
    "Fees & Finance": [
        "Fee Payment", "Scholarship", "Refund", "Fee Structure", "Other",
    ],
    "Hostel": [
        "Room Allocation", "Hostel Facilities", "Hostel Food", "Security", "Other",
    ],
    "Library": [
        "Book Availability", "Working Hours", "Digital Resources", "Seating", "Other",
    ],
    "Transport": [
        "Bus Timing", "Bus Route", "Bus Condition", "Driver Behavior", "Other",
    ],
    "IT Services": [
        "College Portal", "Wi-Fi", "Lab Software", "Email / ID", "Other",
    ],
    "Canteen": [
        "Food Quality", "Hygiene", "Pricing", "Service", "Other",
    ],
    "Other": ["General", "Other"],
}

DEPARTMENT_ROUTING = {
    "Infrastructure": "Maintenance Department",
    "Academics":      "Academic Department",
    "Examination":    "Examination Cell",
    "Faculty":        "Academic Department",
    "Fees & Finance": "Finance Department",
    "Hostel":         "Hostel Warden",
    "Library":        "Library Administration",
    "Transport":      "Transport Office",
    "IT Services":    "IT Department",
    "Canteen":        "Canteen Administration",
    "Other":          "Administration",
}

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "ml_models")
CATEGORY_MODEL_PATH  = os.path.join(MODEL_DIR, "category_model.pkl")
TFIDF_VECTORIZER_PATH = os.path.join(MODEL_DIR, "tfidf_vectorizer.pkl")
SUBCATEGORY_MODEL_PATH = os.path.join(MODEL_DIR, "subcategory_model.pkl")

# ── Globals (loaded once) ─────────────────────────────────────────────────────

_category_model   = None
_tfidf_vectorizer = None
_subcategory_model = None


def load_classifier():
    """Load trained models from disk. Called once at startup."""
    global _category_model, _tfidf_vectorizer, _subcategory_model

    if os.path.exists(CATEGORY_MODEL_PATH) and os.path.exists(TFIDF_VECTORIZER_PATH):
        _category_model   = joblib.load(CATEGORY_MODEL_PATH)
        _tfidf_vectorizer = joblib.load(TFIDF_VECTORIZER_PATH)
        print(f"✅ Category classifier loaded from {CATEGORY_MODEL_PATH}")
    else:
        print(f"⚠️  Category model not found at {CATEGORY_MODEL_PATH} — using rule-based fallback.")

    if os.path.exists(SUBCATEGORY_MODEL_PATH):
        _subcategory_model = joblib.load(SUBCATEGORY_MODEL_PATH)
        print(f"✅ Subcategory classifier loaded")


def _rule_based_category(text: str) -> str:
    """Fallback keyword-based categorizer used before models are trained."""
    text_lower = text.lower()
    rules = [
        (["computer", "lab", "pc", "projector", "ac", "air condition", "classroom",
          "building", "infrastructure", "water", "electric", "furniture", "fan",
          "light", "room", "canteen structure"], "Infrastructure"),
        (["lecture", "notes", "attendance", "syllabus", "assignment", "study",
          "timetable", "course", "class", "material", "curriculum"], "Academics"),
        (["exam", "result", "marks", "grade", "paper", "hall ticket",
          "revaluation", "timetable", "examination"], "Examination"),
        (["professor", "teacher", "faculty", "sir", "ma'am", "lecturer",
          "instructor", "staff"], "Faculty"),
        (["fee", "fees", "payment", "scholarship", "refund", "finance",
          "challan", "receipt"], "Fees & Finance"),
        (["hostel", "dormitory", "room", "mess", "warden", "pg"], "Hostel"),
        (["library", "book", "journal", "reading", "periodical"], "Library"),
        (["bus", "transport", "vehicle", "route", "driver", "pickup", "drop"], "Transport"),
        (["wifi", "wi-fi", "internet", "portal", "website", "login", "software",
          "system", "network", "it", "computer"], "IT Services"),
        (["canteen", "food", "mess", "cafeteria", "eating", "menu", "meal"], "Canteen"),
    ]
    for keywords, category in rules:
        if any(kw in text_lower for kw in keywords):
            return category
    return "Other"


def _rule_based_subcategory(category: str, text: str) -> str:
    """Fallback subcategory detection."""
    text_lower = text.lower()
    subcategory_rules = {
        "Infrastructure": [
            (["computer", "pc", "lab", "system"], "Computer Lab"),
            (["ac", "air condition", "cooling"], "Air Conditioning"),
            (["electricity", "power", "light", "fan"], "Electricity"),
            (["water", "tap", "washroom", "toilet"], "Water Supply"),
            (["furniture", "chair", "desk", "bench"], "Furniture"),
            (["classroom", "room"], "Classroom"),
        ],
        "Academics": [
            (["notes", "material", "slides"], "Study Material"),
            (["attendance"], "Attendance"),
            (["lecture", "class"], "Lectures"),
            (["assignment", "homework"], "Assignments"),
            (["timetable", "schedule"], "Timetable"),
        ],
        "Examination": [
            (["marks", "result", "grade"], "Marks / Result"),
            (["timetable", "schedule"], "Exam Timetable"),
            (["hall ticket", "admit card"], "Hall Ticket"),
            (["revaluation", "rechecking"], "Revaluation"),
        ],
    }
    for keyword_list, subcategory in subcategory_rules.get(category, []):
        if any(kw in text_lower for kw in keyword_list):
            return subcategory
    subs = SUBCATEGORY_MAP.get(category, ["Other"])
    return subs[0] if subs else "Other"


def predict_category(text: str, title: str = "") -> dict:
    """
    Predict category, subcategory, confidence, and top contributing terms.
    Falls back to rule-based approach if models not loaded.
    """
    combined = f"{title} {text}".strip()
    _, clean = preprocess(combined)

    if _tfidf_vectorizer is not None and _category_model is not None:
        vec = _tfidf_vectorizer.transform([clean])
        category = _category_model.predict(vec)[0]
        proba = _category_model.predict_proba(vec)[0]
        confidence = float(proba.max())

        # Extract top contributing features for explainability
        feature_names = _tfidf_vectorizer.get_feature_names_out()
        dense = vec.toarray()[0]
        top_indices = dense.argsort()[::-1][:10]
        contributing_terms = [feature_names[i] for i in top_indices if dense[i] > 0]

        # Subcategory
        if _subcategory_model is not None:
            try:
                subcategory = _subcategory_model.predict(vec)[0]
            except Exception:
                subcategory = _rule_based_subcategory(category, combined)
        else:
            subcategory = _rule_based_subcategory(category, combined)
    else:
        category = _rule_based_category(combined)
        confidence = 0.70
        contributing_terms = []
        subcategory = _rule_based_subcategory(category, combined)

    return {
        "category": category,
        "subcategory": subcategory,
        "confidence": round(confidence, 4),
        "contributing_terms": contributing_terms[:8],
        "assigned_department": DEPARTMENT_ROUTING.get(category, "Administration"),
    }
