"""Complaints router — CRUD + NLP pipeline trigger."""

import uuid
import traceback
from fastapi import APIRouter, Depends, HTTPException, status

from app.firebase.auth      import verify_token, require_admin
from app.firebase.firestore import (
    create_complaint, get_complaint, update_complaint,
    delete_complaint, list_complaints, get_all_complaint_texts
)
from app.nlp.pipeline import run_pipeline
from app.schemas.complaint import (
    ComplaintCreateRequest, ComplaintResponse,
    StatusUpdateRequest, AssignRequest, ResponseRequest,
)

router = APIRouter()


@router.post("/", status_code=status.HTTP_201_CREATED)
async def submit_complaint(
    body: ComplaintCreateRequest,
    user: dict = Depends(verify_token),
):
    """
    Student submits a complaint.
    Triggers the full NLP pipeline before storing in Firestore.
    """
    uid  = user["uid"]
    name = user.get("name", user.get("email", "Unknown"))

    try:
        # Fetch existing complaints for duplicate detection + keyword IDF
        existing = get_all_complaint_texts()
        corpus   = [c["description"] for c in existing if c.get("description")]

        # Run full NLP pipeline
        analysis = run_pipeline(
            title=body.title,
            description=body.description,
            existing_complaints=existing,
            corpus_texts=corpus,
        )

        # Build Firestore document
        complaint_id = f"CMP-{str(uuid.uuid4())[:8].upper()}"
        doc = {
            "complaintId":       complaint_id,
            "studentId":         uid,
            "studentName":       name,
            "title":             body.title,
            "description":       body.description,
            "attachmentUrl":     body.attachmentUrl,

            # NLP outputs
            "category":          analysis["category"],
            "subcategory":       analysis["subcategory"],
            "sentiment":         analysis["sentiment"],
            "priority":          analysis["priority"],
            "entities":          analysis["entities"],
            "keywords":          analysis["keywords"],
            "summary":           analysis["summary"],
            "confidence":        analysis["confidence"],
            "contributing_terms": analysis["contributing_terms"],
            "priority_breakdown": analysis["priority_breakdown"],
            "is_duplicate":      analysis["is_duplicate"],
            "similar_complaints": analysis["similar_complaints"],

            # Management fields
            "status":            "Pending",
            "assignedDepartment": analysis["assigned_department"],
            "adminResponse":     None,
        }

        doc_id = create_complaint(doc)
        doc["id"] = doc_id

        return {
            "id":           doc_id,
            "complaintId":  complaint_id,
            "category":     analysis["category"],
            "subcategory":  analysis["subcategory"],
            "sentiment":    analysis["sentiment"],
            "priority":     analysis["priority"],
            "status":       "Pending",
            "is_duplicate": analysis["is_duplicate"],
            "similar_complaints": analysis["similar_complaints"],
            "summary":      analysis["summary"],
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to process complaint: {str(e)}")


@router.get("/")
async def get_complaints(
    category:  str = None,
    status:    str = None,
    priority:  str = None,
    sentiment: str = None,
    limit:     int = 100,
    user: dict = Depends(verify_token),
):
    """
    List complaints.
    Students see only their own. Admins see all.
    """
    role = user.get("role") or user.get("custom_claims", {}).get("role", "student")
    student_id = None if role == "admin" else user["uid"]

    complaints = list_complaints(
        student_id=student_id,
        category=category,
        status=status,
        priority=priority,
        sentiment=sentiment,
        limit=limit,
    )
    return {"complaints": complaints, "total": len(complaints)}


@router.get("/{complaint_id}")
async def get_complaint_detail(
    complaint_id: str,
    user: dict = Depends(verify_token),
):
    """Get a single complaint with full NLP analysis."""
    doc = get_complaint(complaint_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Complaint not found")

    role = user.get("role") or user.get("custom_claims", {}).get("role", "student")
    if role != "admin" and doc.get("studentId") != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied")

    # Serialize datetimes
    for key in ("createdAt", "updatedAt"):
        if key in doc and hasattr(doc[key], "isoformat"):
            doc[key] = doc[key].isoformat()

    return doc


@router.delete("/{complaint_id}", status_code=status.HTTP_204_NO_CONTENT)
async def withdraw_complaint(
    complaint_id: str,
    user: dict = Depends(verify_token),
):
    """Student may withdraw a complaint only if it's still Pending."""
    doc = get_complaint(complaint_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Complaint not found")
    if doc.get("studentId") != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied")
    if doc.get("status") != "Pending":
        raise HTTPException(status_code=400, detail="Only Pending complaints can be withdrawn")
    delete_complaint(complaint_id)
