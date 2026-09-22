"""Analytics router — aggregated charts data for the admin dashboard."""

from collections import defaultdict
from datetime import datetime

from fastapi import APIRouter, Depends

from app.firebase.auth      import require_admin
from app.firebase.firestore import get_analytics_data

router = APIRouter()


def _parse_month(iso_str: str) -> str:
    """Extract YYYY-MM from ISO datetime string."""
    try:
        if isinstance(iso_str, str):
            dt = datetime.fromisoformat(iso_str.replace("Z", "+00:00"))
        else:
            dt = iso_str
        return dt.strftime("%Y-%m")
    except Exception:
        return "Unknown"


@router.get("/categories")
async def categories_breakdown(admin: dict = Depends(require_admin)):
    data = get_analytics_data()
    counts: dict[str, int] = defaultdict(int)
    for c in data:
        counts[c.get("category", "Other")] += 1
    return [{"category": k, "count": v} for k, v in sorted(counts.items(), key=lambda x: -x[1])]


@router.get("/sentiment")
async def sentiment_distribution(admin: dict = Depends(require_admin)):
    data = get_analytics_data()
    counts: dict[str, int] = defaultdict(int)
    for c in data:
        counts[c.get("sentiment", "Neutral")] += 1
    return [{"sentiment": k, "count": v} for k, v in counts.items()]


@router.get("/priority")
async def priority_distribution(admin: dict = Depends(require_admin)):
    data = get_analytics_data()
    counts: dict[str, int] = defaultdict(int)
    for c in data:
        counts[c.get("priority", "Low")] += 1
    order = ["Critical", "High", "Medium", "Low"]
    return [{"priority": p, "count": counts.get(p, 0)} for p in order]


@router.get("/trends")
async def monthly_trends(admin: dict = Depends(require_admin)):
    data = get_analytics_data()
    counts: dict[str, int] = defaultdict(int)
    for c in data:
        month = _parse_month(c.get("createdAt", ""))
        counts[month] += 1
    sorted_months = sorted(counts.items())
    return [{"month": m, "count": v} for m, v in sorted_months]


@router.get("/resolution")
async def resolution_stats(admin: dict = Depends(require_admin)):
    data = get_analytics_data()
    status_counts: dict[str, int] = defaultdict(int)
    for c in data:
        status_counts[c.get("status", "Pending")] += 1

    total = len(data)
    resolved = status_counts.get("Resolved", 0)
    resolution_rate = round((resolved / total * 100), 1) if total > 0 else 0

    return {
        "status_breakdown": [
            {"status": k, "count": v}
            for k, v in status_counts.items()
        ],
        "total": total,
        "resolved": resolved,
        "resolution_rate": resolution_rate,
    }


@router.get("/departments")
async def department_performance(admin: dict = Depends(require_admin)):
    data = get_analytics_data()
    dept_stats: dict[str, dict] = defaultdict(lambda: {"total": 0, "resolved": 0})
    for c in data:
        dept = c.get("assignedDepartment", "Administration")
        dept_stats[dept]["total"] += 1
        if c.get("status") == "Resolved":
            dept_stats[dept]["resolved"] += 1

    result = []
    for dept, stats in dept_stats.items():
        total    = stats["total"]
        resolved = stats["resolved"]
        result.append({
            "department":      dept,
            "total":           total,
            "resolved":        resolved,
            "resolution_rate": round(resolved / total * 100, 1) if total > 0 else 0,
        })
    return sorted(result, key=lambda x: -x["total"])
