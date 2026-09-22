# 🎓 Intelligent College Complaint Analyzer
### A.P. Shah Institute of Technology — Final Year NLP Project

> An end-to-end complaint management platform powered by a custom 8-step NLP pipeline built with Python, FastAPI, React, and Firebase.

---

## ✨ Features

| Feature | Technology |
|---|---|
| Auto-categorization into 11 categories | TF-IDF + Naive Bayes / SVM |
| Sentiment analysis (Positive / Neutral / Negative) | TF-IDF + SVM + Lexicon Fallback |
| Named entity recognition (locations, people, dates) | spaCy + Custom EntityRuler |
| Keyword extraction | TF-IDF corpus ranking |
| Extractive summarization | TextRank (PageRank on sentences) |
| Priority scoring (Critical / High / Medium / Low) | Rule-based weighted engine |
| Duplicate detection | TF-IDF Cosine Similarity |
| Role-based admin & student portals | Firebase Auth + JWT |
| Real-time analytics dashboard | Recharts |

---

## 📋 Prerequisites

Make sure the following are installed on your machine:

- **Python 3.11** (⚠️ Must be 3.11 — spaCy doesn't support 3.13 yet)
- **Node.js 18+** and npm
- A **Firebase project** (free tier is fine)

---

## 🚀 Setup Guide (New Users — Follow These Steps Exactly)

### Step 1: Clone / Download the Project

```bash
# If using git:
git clone <your-repo-url>
cd NLP1
```

---

### Step 2: Firebase Setup

This project uses Firebase for authentication and the database. You need to configure two things:

#### 2a. Get the Service Account Key (for the backend)

1. Go to [Firebase Console](https://console.firebase.google.com/) → select your project
2. Click the **gear icon** → **Project Settings**
3. Go to the **Service Accounts** tab
4. Click **Generate new private key** → confirm → download the JSON file
5. Rename it to `serviceAccountKey.json`
6. Place it inside the `backend/` folder:
   ```
   NLP1/
   └── backend/
       └── serviceAccountKey.json  ← place here
   ```

#### 2b. Enable Firebase Services in the Console

1. Go to **Authentication** → **Get Started** → **Sign-in method** tab → enable **Email/Password**
2. Go to **Firestore Database** → **Create database** → choose **Test mode** → **Enable**
3. In Firestore, go to the **Rules** tab and replace the rules with:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
   Click **Publish**.

---

### Step 3: Backend Setup

Open a terminal and navigate to the `backend/` folder:

```bash
cd backend
```

#### 3a. Create a Python 3.11 Virtual Environment

```bash
# Windows
py -3.11 -m venv venv
.\venv\Scripts\Activate.ps1

# macOS / Linux
python3.11 -m venv venv
source venv/bin/activate
```

> You should see `(venv)` at the start of your terminal prompt.

#### 3b. Install Python Dependencies

```bash
pip install -r requirements.txt
```

#### 3c. Run the One-Time Setup Script

This script automatically handles everything: downloads NLTK data, downloads the spaCy model, generates the training dataset, and trains the ML models.

```bash
python setup.py
```

Expected output:
```
[1/4] Downloading NLTK corpora...      ✅
[2/4] Downloading spaCy English model... ✅
[3/4] Generating synthetic training dataset... ✅
[4/4] Training ML models...            ✅
Setup complete!
```

> ⏱️ This takes about 2–3 minutes on first run. Subsequent runs skip already-downloaded data.

#### 3d. Start the Backend Server

```bash
uvicorn app.main:app --reload
```

The API will be available at: **http://localhost:8000**

You can view the auto-generated API docs at: **http://localhost:8000/docs**

---

### Step 4: Frontend Setup

Open a **new terminal** and navigate to the `frontend/` folder:

```bash
cd frontend
```

#### 4a. Install Node Dependencies

```bash
npm install
```

#### 4b. Start the Frontend Dev Server

```bash
npm run dev
```

The app will be available at: **http://localhost:5173**

---

### Step 5: Test the System

1. Open **http://localhost:5173/register** in your browser
2. Register as a **Student** and submit a test complaint:
   > *"The AC in Lab 3 is not working since Monday. We have a practical exam tomorrow."*
3. The system will automatically analyze it and show: **Category: Infrastructure | Priority: Critical | Sentiment: Negative**
4. Register a second account as **Administrator** to access the admin dashboard
5. Log in as admin and view all complaints, NLP results, and analytics charts

---

## 📁 Project Structure

```
NLP1/
├── backend/
│   ├── app/
│   │   ├── firebase/
│   │   │   ├── config.py        # Firebase Admin SDK initialization
│   │   │   ├── auth.py          # JWT token verification
│   │   │   └── firestore.py     # Firestore CRUD operations
│   │   ├── nlp/
│   │   │   ├── pipeline.py      # Orchestrates all 8 NLP steps
│   │   │   ├── preprocessing.py # Text cleaning + negation handling
│   │   │   ├── classifier.py    # TF-IDF + ML categorization
│   │   │   ├── sentiment.py     # Hybrid sentiment analysis
│   │   │   ├── ner.py           # spaCy + custom EntityRuler
│   │   │   ├── keywords.py      # TF-IDF keyword extraction
│   │   │   ├── summarizer.py    # TextRank summarization
│   │   │   ├── priority.py      # Rule-based priority engine
│   │   │   └── similarity.py    # Cosine similarity duplicate detection
│   │   ├── routes/
│   │   │   ├── complaints.py    # Student complaint endpoints
│   │   │   ├── admin.py         # Admin management endpoints
│   │   │   ├── analytics.py     # Chart data endpoints
│   │   │   └── nlp.py           # NLP debug endpoint
│   │   ├── schemas/
│   │   │   └── complaint.py     # Pydantic request/response models
│   │   └── main.py              # FastAPI app entry point
│   ├── training/
│   │   ├── generate_dataset.py  # Synthetic dataset generator
│   │   ├── train_category.py    # Category model trainer
│   │   └── train_sentiment.py   # Sentiment model trainer
│   ├── ml_models/               # Trained .pkl files (auto-generated)
│   ├── datasets/                # CSV dataset (auto-generated)
│   ├── setup.py                 # ← Run this once after cloning!
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.jsx  # Firebase auth state management
    │   ├── services/
    │   │   └── api.js           # Axios + auto JWT injection
    │   ├── pages/               # All UI pages
    │   ├── components/          # Reusable UI components
    │   └── firebase/
    │       └── config.js        # Firebase Web SDK config
    └── package.json
```

---

## ❓ Common Issues & Fixes

| Error | Cause | Fix |
|---|---|---|
| `spaCy install fails` | Wrong Python version (3.12/3.13) | Use Python 3.11 specifically |
| `serviceAccountKey.json not found` | Key not placed in `backend/` | Follow Step 2a above |
| `NLTK Resource not found` | Didn't run `setup.py` | Run `python setup.py` |
| `403 Forbidden on /admin/*` | Admin role not set | Register with role = "Administrator" |
| `500 on /complaints/` | ML models not trained | Run `python setup.py` again |
| `CORS error in browser` | Backend not running | Start `uvicorn app.main:app --reload` |

---

## 👥 Team

**College:** A.P. Shah Institute of Technology

---

## 📄 License

This project is for academic purposes only.
