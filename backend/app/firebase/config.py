"""Firebase Admin SDK initialization."""

import os
import firebase_admin
from firebase_admin import credentials


def initialize_firebase():
    """Initialize Firebase Admin SDK (idempotent)."""
    if firebase_admin._apps:
        return  # already initialized

    cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "./serviceAccountKey.json")

    if not os.path.exists(cred_path):
        raise FileNotFoundError(
            f"Firebase service account key not found at: {cred_path}\n"
            "Download it from Firebase Console → Project Settings → "
            "Service Accounts → Generate new private key"
        )

    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
