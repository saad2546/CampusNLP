"""
NLP Step 7 — Priority Prediction Engine
Method: Rule-based scoring using severity, urgency, and impact keywords.

IMPORTANT DESIGN DECISION:
    Sentiment ≠ Priority.
    Example 1: "I hate the canteen food" → Negative sentiment, LOW priority
    Example 2: "There is exposed electrical wiring in Lab 3" → Neutral sentiment, CRITICAL priority
    This distinction is explicitly enforced here.
"""

import re
from typing import Tuple

# ── Keyword Sets ──────────────────────────────────────────────────────────────

CRITICAL_KEYWORDS = {
    "fire", "electrical hazard", "exposed wiring", "short circuit",
    "medical emergency", "accident", "injury", "flood", "collapse",
    "security breach", "threat", "violence", "assault", "gas leak",
    "unsafe", "danger", "life threatening", "emergency",
}

HIGH_KEYWORDS = {
    "not working", "broken", "out of order", "not functioning",
    "exam tomorrow", "exam next week", "practical exam", "university exam",
    "deadline", "urgent", "multiple students", "entire class",
    "no water", "no electricity", "power cut", "server down",
    "portal down", "cannot access", "hall ticket", "result",
    "fail", "failed", "incorrect marks", "wrong result",
}

MEDIUM_KEYWORDS = {
    "slow", "delay", "delayed", "sometimes", "inconvenient",
    "limited", "insufficient", "poor quality", "not available",
    "request", "suggestion", "improvement",
}

# Boosters that escalate priority level
ESCALATION_BOOSTERS = {
    "all students", "entire batch", "everyone", "nobody", "days",
    "weeks", "months", "repeatedly", "multiple times", "again and again",
    "still not fixed", "no response", "ignored",
}

# Dampeners that reduce severity of an otherwise harsh complaint
DAMPENERS = {
    "once", "maybe", "perhaps", "usually", "generally", "sometimes",
    "minor", "small issue", "slight",
}


def _keyword_score(text: str, keyword_set: set) -> int:
    """Count keyword matches (multi-word phrases first, then single words)."""
    text_lower = text.lower()
    score = 0
    for kw in sorted(keyword_set, key=len, reverse=True):  # longest first
        if kw in text_lower:
            score += 1
    return score


def predict_priority(text: str, title: str = "", sentiment: str = "Neutral") -> dict:
    """
    Rule-based priority prediction.

    Scoring:
        severity_score  = critical(×4) + high(×2) + medium(×1)
        urgency_score   = escalation_boosters(×2)
        dampener_score  = dampeners(×1) [subtracted]

    Priority thresholds:
        score >= 8  → Critical
        score >= 5  → High
        score >= 2  → Medium
        else        → Low
    """
    combined = f"{title} {text}".lower()

    critical_count = _keyword_score(combined, CRITICAL_KEYWORDS)
    high_count     = _keyword_score(combined, HIGH_KEYWORDS)
    medium_count   = _keyword_score(combined, MEDIUM_KEYWORDS)
    booster_count  = _keyword_score(combined, ESCALATION_BOOSTERS)
    dampener_count = _keyword_score(combined, DAMPENERS)

    severity_score = (critical_count * 4) + (high_count * 2) + (medium_count * 1)
    urgency_score  = booster_count * 2
    total_score    = severity_score + urgency_score - dampener_count

    # Sentiment DOES NOT directly map to priority (design decision)
    # but it provides a minor +1 nudge for Negative if no keywords matched
    if total_score == 0 and sentiment == "Negative":
        total_score = 1  # small nudge, still likely Low or Medium

    if total_score >= 8 or critical_count > 0:
        priority = "Critical"
    elif total_score >= 5:
        priority = "High"
    elif total_score >= 2:
        priority = "Medium"
    else:
        priority = "Low"

    return {
        "priority": priority,
        "priority_score": total_score,
        "priority_breakdown": {
            "critical_keywords": critical_count,
            "high_keywords": high_count,
            "medium_keywords": medium_count,
            "escalation_boosters": booster_count,
            "dampeners": dampener_count,
        },
    }
