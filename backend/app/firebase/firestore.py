"""Firestore CRUD helpers for complaints and users."""

from datetime import datetime, timezone
from typing import Optional

from firebase_admin import firestore

# Lazy singleton
_db = None


def get_db():
    global _db
    if _db is None:
        _db = firestore.client()
    return _db


# ── Users ─────────────────────────────────────────────────────────────────────

def upsert_user(uid: str, data: dict):
    """Create or update user document."""
    db = get_db()
    db.collection("users").document(uid).set(data, merge=True)


def get_user(uid: str) -> Optional[dict]:
    db = get_db()
    doc = db.collection("users").document(uid).get()
    return doc.to_dict() if doc.exists else None


def set_user_role(uid: str, role: str):
    """Set custom role on Firestore user doc AND Firebase Auth custom claims."""
    from firebase_admin import auth as fb_auth
    db = get_db()
    db.collection("users").document(uid).update({"role": role})
    fb_auth.set_custom_user_claims(uid, {"role": role})


# ── Complaints ────────────────────────────────────────────────────────────────

def create_complaint(data: dict) -> str:
    """Add complaint document, return auto-generated doc ID."""
    db = get_db()
    ts = datetime.now(timezone.utc)
    data["createdAt"] = ts
    data["updatedAt"] = ts
    _, ref = db.collection("complaints").add(data)
    return ref.id


def get_complaint(complaint_id: str) -> Optional[dict]:
    db = get_db()
    doc = db.collection("complaints").document(complaint_id).get()
    if not doc.exists:
        return None
    d = doc.to_dict()
    d["id"] = doc.id
    return d


def update_complaint(complaint_id: str, data: dict):
    db = get_db()
    data["updatedAt"] = datetime.now(timezone.utc)
    db.collection("complaints").document(complaint_id).update(data)


def delete_complaint(complaint_id: str):
    db = get_db()
    db.collection("complaints").document(complaint_id).delete()


def list_complaints(
    student_id: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    sentiment: Optional[str] = None,
    limit: int = 100,
) -> list[dict]:
    """List complaints with optional filters."""
    db = get_db()
    query = db.collection("complaints")

    if student_id:
        query = query.where("studentId", "==", student_id)
    if category:
        query = query.where("category", "==", category)
    if status:
        query = query.where("status", "==", status)
    if priority:
        query = query.where("priority", "==", priority)
    if sentiment:
        query = query.where("sentiment", "==", sentiment)

    docs = query.limit(limit).stream()

    results = []
    for doc in docs:
        d = doc.to_dict()
        d["id"] = doc.id
        # Serialize datetimes
        for key in ("createdAt", "updatedAt"):
            if key in d and hasattr(d[key], "isoformat"):
                d[key] = d[key].isoformat()
        results.append(d)

    # Sort in Python (avoids needing a Firestore composite index)
    results.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
    return results


def get_all_complaint_texts() -> list[dict]:
    """
    Fetch all complaint IDs + descriptions for similarity computation.
    Returns lightweight dicts: {id, description}
    """
    try:
        db = get_db()
        docs = db.collection("complaints").stream()
        results = []
        for doc in docs:
            d = doc.to_dict()
            results.append({"id": doc.id, "description": d.get("description", "")})
        return results
    except Exception:
        return []


def get_analytics_data() -> list[dict]:
    """Fetch all complaints for analytics aggregation."""
    db = get_db()
    docs = db.collection("complaints").stream()
    results = []
    for doc in docs:
        d = doc.to_dict()
        d["id"] = doc.id
        for key in ("createdAt", "updatedAt"):
            if key in d and hasattr(d[key], "isoformat"):
                d[key] = d[key].isoformat()
        results.append(d)
    return results
