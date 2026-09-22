"""Admin router — status management, assignment, responses, dashboard summary."""

from fastapi import APIRouter, Depends, HTTPException

from app.firebase.auth      import require_admin
from app.firebase.firestore import (
    get_complaint, update_complaint, get_analytics_data
)
from app.schemas.complaint import (
    StatusUpdateRequest, AssignRequest, ResponseRequest
)

router = APIRouter()

VALID_STATUSES = ["Pending", "Under Review", "Assigned", "In Progress", "Resolved", "Rejected"]


@router.get("/dashboard")
async def dashboard_summary(admin: dict = Depends(require_admin)):
    """Return high-level dashboard statistics."""
    all_complaints = get_analytics_data()
    total = len(all_complaints)

    status_counts   = {}
    priority_counts = {}
    category_counts = {}
    sentiment_counts = {}

    for c in all_complaints:
        s = c.get("status", "Pending")
        p = c.get("priority", "Low")
        cat = c.get("category", "Other")
        sent = c.get("sentiment", "Neutral")
        status_counts[s]    = status_counts.get(s, 0) + 1
        priority_counts[p]  = priority_counts.get(p, 0) + 1
        category_counts[cat] = category_counts.get(cat, 0) + 1
        sentiment_counts[sent] = sentiment_counts.get(sent, 0) + 1

    pending     = status_counts.get("Pending", 0)
    in_progress = status_counts.get("In Progress", 0) + status_counts.get("Under Review", 0) + status_counts.get("Assigned", 0)
    resolved    = status_counts.get("Resolved", 0)
    high_priority = priority_counts.get("High", 0) + priority_counts.get("Critical", 0)

    return {
        "total":         total,
        "pending":       pending,
        "in_progress":   in_progress,
        "resolved":      resolved,
        "high_priority": high_priority,
        "status_counts":    status_counts,
        "priority_counts":  priority_counts,
        "category_counts":  category_counts,
        "sentiment_counts": sentiment_counts,
    }


@router.put("/complaints/{complaint_id}/status")
async def update_status(
    complaint_id: str,
    body: StatusUpdateRequest,
    admin: dict = Depends(require_admin),
):
    if body.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Choose from: {VALID_STATUSES}")
    doc = get_complaint(complaint_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Complaint not found")
    update_complaint(complaint_id, {"status": body.status})
    return {"message": "Status updated", "status": body.status}


@router.put("/complaints/{complaint_id}/assign")
async def assign_complaint(
    complaint_id: str,
    body: AssignRequest,
    admin: dict = Depends(require_admin),
):
    doc = get_complaint(complaint_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Complaint not found")
    update_complaint(complaint_id, {
        "assignedDepartment": body.department,
        "status": "Assigned",
    })
    return {"message": "Complaint assigned", "department": body.department}


@router.post("/complaints/{complaint_id}/response")
async def respond_to_complaint(
    complaint_id: str,
    body: ResponseRequest,
    admin: dict = Depends(require_admin),
):
    doc = get_complaint(complaint_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Complaint not found")
    update_complaint(complaint_id, {
        "adminResponse": body.response,
        "status": "In Progress",
    })
    return {"message": "Response recorded"}
