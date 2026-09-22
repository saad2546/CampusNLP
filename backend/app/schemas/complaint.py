"""Pydantic schemas for complaint requests and responses."""

from typing import Optional
from pydantic import BaseModel, Field


# ── Inbound ───────────────────────────────────────────────────────────────────

class ComplaintCreateRequest(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=20, max_length=5000)
    department: Optional[str] = None          # student's optional hint
    attachmentUrl: Optional[str] = None       # uploaded via Firebase Storage


# ── NLP Output ────────────────────────────────────────────────────────────────

class EntityItem(BaseModel):
    text: str
    type: str


class SimilarComplaint(BaseModel):
    id: str
    title: str
    similarity: float


class NLPAnalysis(BaseModel):
    category: str
    subcategory: str
    sentiment: str
    priority: str
    entities: list[EntityItem]
    keywords: list[str]
    summary: str
    confidence: float
    contributing_terms: list[str]
    is_duplicate: bool
    similar_complaints: list[SimilarComplaint]


# ── Complaint Document ────────────────────────────────────────────────────────

class ComplaintResponse(BaseModel):
    id: str
    complaintId: str
    studentId: str
    studentName: Optional[str] = None
    title: str
    description: str
    category: str
    subcategory: str
    sentiment: str
    priority: str
    entities: list[EntityItem]
    keywords: list[str]
    summary: str
    status: str
    assignedDepartment: Optional[str] = None
    adminResponse: Optional[str] = None
    attachmentUrl: Optional[str] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None


# ── Admin Operations ──────────────────────────────────────────────────────────

class StatusUpdateRequest(BaseModel):
    status: str   # Pending | Under Review | Assigned | In Progress | Resolved | Rejected


class AssignRequest(BaseModel):
    department: str


class ResponseRequest(BaseModel):
    response: str = Field(..., min_length=5)


# ── NLP Debug ────────────────────────────────────────────────────────────────

class NLPAnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=10)
    title: Optional[str] = None
