"""
Synthetic Dataset Generator
Generates ~2,000 labeled college complaint examples across 11 categories.
Output: backend/datasets/complaints.csv

NOTE: This is a synthetic dataset created for training purposes.
      Real anonymized data should be added to improve accuracy.
      This is clearly documented in the project methodology.
"""

import random
import csv
import os

random.seed(42)

# ── Templates per category ───────────────────────────────────────────────────

TEMPLATES = {
    "Infrastructure": {
        "subcategories": {
            "Computer Lab": [
                "The computers in {lab} are extremely slow and half of them are not working.",
                "Most of the PCs in {lab} have been broken for {duration}.",
                "The systems in {lab} crash every few minutes. We cannot complete our practicals.",
                "{lab} computers are running very slow. We have a practical exam {urgency}.",
                "All computers in {lab} are hanging. The internet is also not working.",
                "Several machines in {lab} have missing keyboards and non-functional monitors.",
                "The lab software is not installed on {lab} computers.",
                "Computer systems in {lab} do not boot properly.",
            ],
            "Air Conditioning": [
                "The AC in {room} is not working since {duration}. The room is unbearably hot.",
                "Air conditioning in {room} is making a loud noise and cooling poorly.",
                "The AC in classroom {room} has been broken for {duration}.",
                "None of the ACs in {block} are functioning. Students cannot study in this heat.",
                "The cooling in {room} is inadequate. Temperature is very high.",
            ],
            "Electricity": [
                "There are frequent power cuts in {block}. This disrupts lectures and lab work.",
                "The lights in {room} are flickering and two of them have stopped working.",
                "There is no electricity in {block} since morning. Classes are being disrupted.",
                "The fans in {room} are not working due to an electrical fault.",
                "Exposed wiring was noticed near {lab}. This is a safety hazard.",
                "Power sockets in {lab} are not working. Students cannot charge laptops.",
            ],
            "Water Supply": [
                "There is no water supply in the {block} washrooms since {duration}.",
                "The water cooler near {block} is not working.",
                "Washrooms in {block} are in very poor condition with no running water.",
                "The drinking water dispenser near the library has not been working for {duration}.",
            ],
            "Classroom": [
                "The projector in {room} is not working. Lectures are being affected.",
                "Benches in {room} are broken and uncomfortable for students.",
                "The whiteboard in {room} is in very poor condition and cannot be used properly.",
                "There is insufficient seating in {room} for all students.",
                "The classroom {room} needs painting. The walls are in very bad condition.",
            ],
        },
        "sentiments": {"Negative": 0.85, "Neutral": 0.12, "Positive": 0.03},
        "priorities": {"Critical": 0.05, "High": 0.35, "Medium": 0.40, "Low": 0.20},
    },
    "Academics": {
        "subcategories": {
            "Study Material": [
                "The professor has not uploaded the lecture notes for {subject} on the portal.",
                "Study material for {subject} has not been shared with students yet.",
                "We have not received any notes or reference material for {subject}.",
                "The slides for {subject} are outdated and do not match the current syllabus.",
            ],
            "Attendance": [
                "My attendance is marked incorrectly in {subject}. I was present but marked absent.",
                "There seems to be an error in my attendance record for {subject}.",
                "My attendance percentage is showing lower than actual in {subject}.",
                "The attendance system is not updating correctly for {subject}.",
            ],
            "Lectures": [
                "Lectures for {subject} have not been conducted for the past {duration}.",
                "The scheduled lecture for {subject} is frequently cancelled without notice.",
                "We have been unable to complete the syllabus for {subject} due to lack of lectures.",
                "The professor for {subject} frequently arrives late or skips lectures.",
            ],
            "Timetable": [
                "There is a clash in the timetable. Two subjects are scheduled at the same time.",
                "The updated timetable has not been communicated to students.",
                "The timetable was changed without prior notice, causing confusion.",
                "Practical sessions are scheduled during lecture hours, creating conflicts.",
            ],
            "Assignments": [
                "The deadline for {subject} assignment was changed without notice.",
                "Assignment submissions for {subject} have not been acknowledged by the professor.",
                "We have not received feedback on submitted assignments for {subject}.",
            ],
        },
        "sentiments": {"Negative": 0.75, "Neutral": 0.20, "Positive": 0.05},
        "priorities": {"Critical": 0.02, "High": 0.30, "Medium": 0.45, "Low": 0.23},
    },
    "Examination": {
        "subcategories": {
            "Marks / Result": [
                "My marks for {subject} are incorrectly entered. I scored higher in the exam.",
                "The result for {subject} shows wrong marks. Please review my answer sheet.",
                "My internal marks for {subject} do not match what was announced in class.",
                "There is a discrepancy in my result for {subject}.",
            ],
            "Exam Timetable": [
                "The exam timetable has a mistake. Two exams are scheduled on the same day.",
                "The timetable released for university exams has incorrect dates.",
                "Exam schedule was changed at the last minute causing problems for students.",
                "The practical exam timetable clashes with the theory exam for many students.",
            ],
            "Hall Ticket": [
                "I have not received my hall ticket for the upcoming exam.",
                "There is an error in the details on my hall ticket.",
                "The hall ticket download link on the portal is not working.",
                "My photograph on the hall ticket is incorrect.",
            ],
            "Revaluation": [
                "I have applied for revaluation of {subject} but have not received any update.",
                "The revaluation process is taking too long. No status update has been given.",
                "My revaluation application for {subject} has been pending for {duration}.",
            ],
        },
        "sentiments": {"Negative": 0.80, "Neutral": 0.15, "Positive": 0.05},
        "priorities": {"Critical": 0.05, "High": 0.45, "Medium": 0.35, "Low": 0.15},
    },
    "Faculty": {
        "subcategories": {
            "Faculty Behavior": [
                "A faculty member behaved in a disrespectful manner with students in class.",
                "The professor made inappropriate comments during the lecture.",
                "A teacher was rude and dismissive when students asked questions.",
            ],
            "Faculty Availability": [
                "The professor for {subject} is frequently absent. We are falling behind.",
                "The faculty member is not available during scheduled consultation hours.",
                "We cannot contact the professor for {subject} for doubt solving.",
            ],
            "Teaching Quality": [
                "The teaching methodology for {subject} is not effective. Students are struggling.",
                "The professor is unable to explain concepts clearly for {subject}.",
                "The pace of teaching in {subject} is too fast for students to follow.",
            ],
        },
        "sentiments": {"Negative": 0.80, "Neutral": 0.15, "Positive": 0.05},
        "priorities": {"Critical": 0.02, "High": 0.25, "Medium": 0.48, "Low": 0.25},
    },
    "Fees & Finance": {
        "subcategories": {
            "Fee Payment": [
                "The fee payment portal is not accepting my payment.",
                "I paid the fees but the receipt has not been generated.",
                "The online fee payment gateway is showing errors repeatedly.",
                "My fee payment is showing as failed even though the amount was deducted.",
            ],
            "Scholarship": [
                "My scholarship amount has not been credited for this semester.",
                "The scholarship application portal is not working.",
                "I have not received any update on my scholarship application.",
            ],
            "Fee Structure": [
                "The updated fee structure has not been communicated to students.",
                "Additional fees were charged without any prior notice or explanation.",
            ],
        },
        "sentiments": {"Negative": 0.78, "Neutral": 0.18, "Positive": 0.04},
        "priorities": {"Critical": 0.03, "High": 0.38, "Medium": 0.40, "Low": 0.19},
    },
    "Hostel": {
        "subcategories": {
            "Hostel Facilities": [
                "The hostel bathroom taps are leaking and have not been repaired for {duration}.",
                "The hostel room does not have proper ventilation or fans.",
                "The hostel electricity supply is irregular and affects studying at night.",
                "There is no hot water facility available in the hostel.",
            ],
            "Hostel Food": [
                "The quality of food served in the hostel mess has deteriorated significantly.",
                "The food served in the mess is not hygienic and has made students unwell.",
                "Meals are not being served on time in the hostel mess.",
            ],
            "Room Allocation": [
                "I have not been allocated a hostel room despite applying on time.",
                "My hostel room allocation is incorrect as per my preferences.",
            ],
        },
        "sentiments": {"Negative": 0.82, "Neutral": 0.13, "Positive": 0.05},
        "priorities": {"Critical": 0.05, "High": 0.33, "Medium": 0.40, "Low": 0.22},
    },
    "Library": {
        "subcategories": {
            "Book Availability": [
                "The books required for {subject} are not available in the library.",
                "The library does not have enough copies of the reference books for our course.",
                "Several requested books have been out of stock for {duration}.",
            ],
            "Working Hours": [
                "The library closes too early. Students need access during evening hours.",
                "The library was closed on a working day without prior notice.",
                "Library timing should be extended during examination season.",
            ],
            "Digital Resources": [
                "The e-library portal is not accessible from college computers.",
                "Online journal access has been unavailable for {duration}.",
            ],
            "Seating": [
                "There is insufficient seating in the library for all students.",
                "Library seating is damaged and uncomfortable for long study sessions.",
            ],
        },
        "sentiments": {"Negative": 0.60, "Neutral": 0.30, "Positive": 0.10},
        "priorities": {"Critical": 0.01, "High": 0.20, "Medium": 0.45, "Low": 0.34},
    },
    "Transport": {
        "subcategories": {
            "Bus Timing": [
                "The college bus is consistently arriving {duration} late every day.",
                "Bus number {bus} has not been following the scheduled timings.",
                "The return bus leaves before the scheduled time, leaving students stranded.",
                "There is no bus service on certain routes during examination days.",
            ],
            "Bus Condition": [
                "The college bus {bus} is in very poor condition with damaged seats.",
                "The AC in bus {bus} is not working and the journey is very uncomfortable.",
                "The college bus is overcrowded with insufficient space for all students.",
            ],
            "Bus Route": [
                "The bus route has been changed without notifying students.",
                "Our locality has been removed from the bus route without any reason.",
            ],
        },
        "sentiments": {"Negative": 0.72, "Neutral": 0.22, "Positive": 0.06},
        "priorities": {"Critical": 0.02, "High": 0.25, "Medium": 0.45, "Low": 0.28},
    },
    "IT Services": {
        "subcategories": {
            "College Portal": [
                "The college student portal has been down for {duration}. We cannot access results.",
                "Login to the college portal is not working for many students.",
                "The college portal shows an error when trying to download documents.",
                "I am unable to submit my assignments through the college portal.",
            ],
            "Wi-Fi": [
                "The Wi-Fi in {block} is extremely slow and frequently disconnects.",
                "There is no Wi-Fi coverage in {block}. Students cannot access online resources.",
                "The Wi-Fi password has been changed without notifying students.",
            ],
            "Lab Software": [
                "Required software for {subject} is not installed in {lab}.",
                "The software license for {subject} practical tools has expired.",
                "Antivirus software on {lab} computers keeps blocking the required programs.",
            ],
        },
        "sentiments": {"Negative": 0.75, "Neutral": 0.20, "Positive": 0.05},
        "priorities": {"Critical": 0.05, "High": 0.35, "Medium": 0.40, "Low": 0.20},
    },
    "Canteen": {
        "subcategories": {
            "Food Quality": [
                "The quality of food at the canteen has been very poor recently.",
                "The food served in the canteen is not fresh and sometimes stale.",
                "The canteen is not maintaining hygiene standards.",
            ],
            "Pricing": [
                "The canteen prices have been increased significantly without any notice.",
                "The canteen charges more than the displayed price for items.",
            ],
            "Service": [
                "The canteen service is very slow during lunch hours causing long queues.",
                "The canteen staff is rude and unhelpful to students.",
                "The canteen runs out of food items very early every day.",
            ],
        },
        "sentiments": {"Negative": 0.70, "Neutral": 0.20, "Positive": 0.10},
        "priorities": {"Critical": 0.01, "High": 0.15, "Medium": 0.45, "Low": 0.39},
    },
    "Other": {
        "subcategories": {
            "General": [
                "I would like to suggest improvements to the overall college facilities.",
                "The college events calendar has not been updated for this semester.",
                "Student feedback is not being taken seriously by the administration.",
                "The notice board in {block} has outdated information.",
                "There is no proper system for student grievance redressal.",
            ],
        },
        "sentiments": {"Negative": 0.50, "Neutral": 0.35, "Positive": 0.15},
        "priorities": {"Critical": 0.01, "High": 0.15, "Medium": 0.40, "Low": 0.44},
    },
}

# ── Fill-in values ─────────────────────────────────────────────────────────────

LABS      = ["Lab 1", "Lab 2", "Lab 3", "Lab 4", "Computer Lab"]
ROOMS     = ["Room 101", "Room 201", "Room 302", "Room 401", "Classroom A", "Classroom B"]
BLOCKS    = ["Block A", "Block B", "Block C"]
DURATIONS = ["2 days", "3 days", "a week", "more than a week", "2 weeks", "a month"]
URGENCY   = ["next week", "tomorrow", "in 2 days", "this Friday"]
SUBJECTS  = ["Data Structures", "Computer Networks", "Operating Systems", "DBMS", "Machine Learning",
             "Digital Electronics", "Engineering Mathematics", "Software Engineering"]
BUSES     = ["Bus 1", "Bus 2", "Bus 3", "Bus A", "Bus B"]

POSITIVE_TEMPLATES = [
    "The library has received excellent new reference books this semester. Very useful.",
    "The college infrastructure has improved significantly. The new lab facilities are great.",
    "The faculty for {subject} is very helpful and explains concepts very clearly.",
    "The canteen has introduced healthy food options recently. Very appreciated.",
    "The college Wi-Fi speed has improved significantly. Thank you.",
    "The administration handled my previous complaint very efficiently. Appreciate the prompt response.",
    "The library digital resources are now much better. Excellent initiative.",
    "The new projectors installed in classrooms are very helpful for learning.",
    "The college transport is now more punctual. Students are satisfied.",
    "The online portal has been updated and is now working smoothly.",
]


def _weighted_choice(weights: dict) -> str:
    keys = list(weights.keys())
    probs = [weights[k] for k in keys]
    return random.choices(keys, weights=probs)[0]


def _fill_template(template: str) -> str:
    return (
        template
        .replace("{lab}",      random.choice(LABS))
        .replace("{room}",     random.choice(ROOMS))
        .replace("{block}",    random.choice(BLOCKS))
        .replace("{duration}", random.choice(DURATIONS))
        .replace("{urgency}",  random.choice(URGENCY))
        .replace("{subject}",  random.choice(SUBJECTS))
        .replace("{bus}",      random.choice(BUSES))
    )


def generate_dataset(n_per_category: int = 180) -> list[dict]:
    rows = []

    for category, config in TEMPLATES.items():
        subcats = config["subcategories"]
        sentiments = config["sentiments"]
        priorities = config["priorities"]

        for subcat, templates in subcats.items():
            count = max(n_per_category // len(subcats), len(templates))
            for _ in range(count):
                template = random.choice(templates)
                complaint = _fill_template(template)
                sentiment = _weighted_choice(sentiments)
                priority  = _weighted_choice(priorities)
                rows.append({
                    "complaint":   complaint,
                    "category":    category,
                    "subcategory": subcat,
                    "sentiment":   sentiment,
                    "priority":    priority,
                })

    # Add positive examples
    for template in POSITIVE_TEMPLATES:
        complaint = _fill_template(template)
        rows.append({
            "complaint":   complaint,
            "category":    "Other",
            "subcategory": "General",
            "sentiment":   "Positive",
            "priority":    "Low",
        })

    random.shuffle(rows)
    return rows


def save_dataset(rows: list[dict], path: str):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["complaint", "category", "subcategory", "sentiment", "priority"])
        writer.writeheader()
        writer.writerows(rows)
    print(f"✅ Dataset saved: {path} ({len(rows)} rows)")


if __name__ == "__main__":
    output_path = os.path.join(os.path.dirname(__file__), "..", "datasets", "complaints.csv")
    rows = generate_dataset(n_per_category=180)
    save_dataset(rows, output_path)

    # Print summary
    from collections import Counter
    cats = Counter(r["category"] for r in rows)
    print("\nCategory distribution:")
    for cat, count in sorted(cats.items(), key=lambda x: -x[1]):
        print(f"  {cat:<20} {count}")
    print(f"\n  TOTAL: {len(rows)}")
