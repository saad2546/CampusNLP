"""
NLP Step 4 — Named Entity Recognition (NER)
Uses spaCy en_core_web_sm + custom EntityRuler patterns for college-specific entities.
"""

from typing import List, Dict
import spacy
from spacy.pipeline import EntityRuler

from app.nlp.preprocessing import get_spacy_nlp

# ── College-specific entity patterns ─────────────────────────────────────────
# These patterns identify A.P. Shah Institute-specific locations/facilities
# that general-purpose NER models won't recognize.

COLLEGE_PATTERNS = [
    # Labs
    {"label": "FACILITY", "pattern": "Lab 1"},
    {"label": "FACILITY", "pattern": "Lab 2"},
    {"label": "FACILITY", "pattern": "Lab 3"},
    {"label": "FACILITY", "pattern": "Lab 4"},
    {"label": "FACILITY", "pattern": "Lab 5"},
    {"label": "FACILITY", "pattern": "Computer Lab"},
    {"label": "FACILITY", "pattern": "Physics Lab"},
    {"label": "FACILITY", "pattern": "Chemistry Lab"},
    {"label": "FACILITY", "pattern": "Electronics Lab"},
    {"label": "FACILITY", "pattern": "Drawing Hall"},

    # Rooms & Blocks
    {"label": "FACILITY", "pattern": [{"LOWER": "room"}, {"IS_DIGIT": True}]},
    {"label": "FACILITY", "pattern": [{"LOWER": "block"}, {"TEXT": {"IN": ["A", "B", "C", "D"]}}]},
    {"label": "FACILITY", "pattern": "Block A"},
    {"label": "FACILITY", "pattern": "Block B"},
    {"label": "FACILITY", "pattern": "Block C"},
    {"label": "FACILITY", "pattern": "Room 201"},
    {"label": "FACILITY", "pattern": "Room 302"},
    {"label": "FACILITY", "pattern": "Room 101"},
    {"label": "FACILITY", "pattern": "Room 401"},

    # Common facilities
    {"label": "FACILITY", "pattern": "Library"},
    {"label": "FACILITY", "pattern": "Canteen"},
    {"label": "FACILITY", "pattern": "Auditorium"},
    {"label": "FACILITY", "pattern": "Gymnasium"},
    {"label": "FACILITY", "pattern": "Hostel"},
    {"label": "FACILITY", "pattern": "Boys Hostel"},
    {"label": "FACILITY", "pattern": "Girls Hostel"},
    {"label": "FACILITY", "pattern": "Parking"},
    {"label": "FACILITY", "pattern": "Seminar Hall"},
    {"label": "FACILITY", "pattern": "Conference Room"},
    {"label": "FACILITY", "pattern": "Workshop"},

    # Organization
    {"label": "ORG", "pattern": "A.P. Shah Institute of Technology"},
    {"label": "ORG", "pattern": "APSIT"},
    {"label": "ORG", "pattern": "Exam Cell"},
    {"label": "ORG", "pattern": "Examination Cell"},
    {"label": "ORG", "pattern": "IT Department"},
    {"label": "ORG", "pattern": "Maintenance Department"},
    {"label": "ORG", "pattern": "Transport Office"},
    {"label": "ORG", "pattern": "Finance Department"},
    {"label": "ORG", "pattern": "Library Administration"},

    # Academic entities
    {"label": "EVENT", "pattern": "Practical Examination"},
    {"label": "EVENT", "pattern": "Practical Exam"},
    {"label": "EVENT", "pattern": "University Exam"},
    {"label": "EVENT", "pattern": "Internal Exam"},
    {"label": "EVENT", "pattern": "Mid Sem"},
    {"label": "EVENT", "pattern": "End Sem"},
    {"label": "EVENT", "pattern": "Viva"},

    # Degree programs
    {"label": "PROGRAM", "pattern": "Computer Engineering"},
    {"label": "PROGRAM", "pattern": "Information Technology"},
    {"label": "PROGRAM", "pattern": "Electronics Engineering"},
    {"label": "PROGRAM", "pattern": "Mechanical Engineering"},
    {"label": "PROGRAM", "pattern": "Civil Engineering"},
]

# Entity types to include in output (filter spaCy general labels)
RELEVANT_LABELS = {"FACILITY", "ORG", "PERSON", "DATE", "TIME", "EVENT", "PROGRAM", "GPE", "LOC"}

# ── Build the NER pipeline ────────────────────────────────────────────────────

_ner_nlp = None


def _build_ner_pipeline():
    """Build spaCy pipeline with custom EntityRuler inserted before NER."""
    global _ner_nlp
    nlp = get_spacy_nlp()

    # Add EntityRuler BEFORE the existing NER for higher priority
    if "college_entity_ruler" not in nlp.pipe_names:
        ruler = nlp.add_pipe("entity_ruler", name="college_entity_ruler", before="ner")
        ruler.add_patterns(COLLEGE_PATTERNS)

    _ner_nlp = nlp
    return nlp


def extract_entities(text: str) -> List[Dict[str, str]]:
    """
    Extract named entities from complaint text.
    Returns list of {text, type} dicts.
    """
    global _ner_nlp
    if _ner_nlp is None:
        _build_ner_pipeline()

    doc = _ner_nlp(text)
    seen = set()
    entities = []

    for ent in doc.ents:
        if ent.label_ in RELEVANT_LABELS:
            key = (ent.text.strip().lower(), ent.label_)
            if key not in seen:
                seen.add(key)
                entities.append({"text": ent.text.strip(), "type": ent.label_})

    return entities
