#!/usr/bin/env python3
"""
setup.py — One-time setup script for the APSIT Complaint Analyzer backend.
Run this ONCE after cloning the repository to prepare the ML environment.
Usage: python setup.py
"""

import subprocess
import sys
import os

def run(cmd, **kwargs):
    print(f"\n>>> {cmd}")
    result = subprocess.run(cmd, shell=True, **kwargs)
    if result.returncode != 0:
        print(f"❌ Command failed: {cmd}")
        sys.exit(1)

print("=" * 60)
print("  APSIT Intelligent Complaint Analyzer — Setup")
print("=" * 60)

# 1. Download NLTK data
print("\n[1/4] Downloading NLTK corpora...")
import nltk
for pkg in ["punkt", "punkt_tab", "stopwords", "wordnet",
            "omw-1.4", "averaged_perceptron_tagger", "vader_lexicon"]:
    nltk.download(pkg, quiet=False)
print("✅ NLTK data ready")

# 2. Download spaCy model
print("\n[2/4] Downloading spaCy English model...")
run(f"{sys.executable} -m spacy download en_core_web_sm")
print("✅ spaCy model ready")

# 3. Generate synthetic dataset
print("\n[3/4] Generating synthetic training dataset (~2000 rows)...")
run(f"{sys.executable} training/generate_dataset.py")
print("✅ Dataset ready")

# 4. Train ML models
print("\n[4/4] Training ML models (this may take 1-2 minutes)...")
run(f"{sys.executable} training/train_category.py")
run(f"{sys.executable} training/train_sentiment.py")
print("✅ Models trained and saved to ml_models/")

print("\n" + "=" * 60)
print("  ✅ Setup complete!")
print("  Next step: Add your serviceAccountKey.json to this folder")
print("  Then run:  uvicorn app.main:app --reload")
print("=" * 60)
