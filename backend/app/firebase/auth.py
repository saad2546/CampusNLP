"""Firebase ID Token verification — FastAPI dependency."""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth, firestore

bearer_scheme = HTTPBearer()

# Lazy Firestore client
_db = None
def _get_db():
    global _db
    if _db is None:
        _db = firestore.client()
    return _db


def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """
    Verify Firebase ID Token from Authorization header.
    Returns the decoded token payload enriched with the role from Firestore.
    """
    try:
        token = credentials.credentials
        decoded = auth.verify_id_token(token)

        # Enrich with role from Firestore (custom claims may not be set yet)
        uid = decoded.get("uid")
        role_from_claims = decoded.get("role") or decoded.get("custom_claims", {}).get("role")
        if not role_from_claims and uid:
            try:
                doc = _get_db().collection("users").document(uid).get()
                if doc.exists:
                    decoded["role"] = doc.to_dict().get("role", "student")
            except Exception:
                decoded["role"] = "student"
        elif role_from_claims:
            decoded["role"] = role_from_claims

        return decoded
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {str(e)}",
        )


def require_student(decoded: dict = Depends(verify_token)) -> dict:
    """Allow only students (or admins, who can also act as students)."""
    return decoded


def require_admin(decoded: dict = Depends(verify_token)) -> dict:
    """Allow only users with role == 'admin'."""
    role = decoded.get("role") or decoded.get("custom_claims", {}).get("role", "student")
    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return decoded
