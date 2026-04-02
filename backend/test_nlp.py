"""
Test script for the NLP Pipeline.
Demonstrates language detection, sentiment analysis, and text preprocessing.
"""
import sys
sys.path.insert(0, ".")

from app.nlp.language import LanguageDetector
from app.nlp.preprocessor import TextPreprocessor
from app.nlp.sentiment import SentimentAnalyzer

print("=" * 60)
print("  LenguaTrends — NLP Pipeline Test")
print("=" * 60)

# Test comments in 3 languages
test_comments = [
    ("This movie was absolutely amazing! Best film of the year.", "en"),
    ("Worst movie I have ever seen. Complete waste of time.", "en"),
    ("It was okay, nothing special about it.", "en"),
    ("¡Esta película fue increíble! Me encantaron los efectos.", "es"),
    ("Qué película tan mala, no la recomiendo para nada.", "es"),
    ("La película estuvo bien, ni buena ni mala.", "es"),
    ("Этот фильм потрясающий! Лучший фильм года!", "ru"),
    ("Ужасный фильм, зря потратил время.", "ru"),
    ("Фильм нормальный, ничего особенного.", "ru"),
]

# Step 1: Language Detection
print("\n--- Step 1: Language Detection ---")
detector = LanguageDetector()
for text, expected in test_comments:
    detected = detector.detect(text)
    status = "✓" if detected == expected else "✗"
    print(f"  {status} [{detected}] (expected: {expected}) → {text[:50]}...")

# Step 2: Text Preprocessing
print("\n--- Step 2: Text Preprocessing ---")
preprocessor = TextPreprocessor()
dirty_texts = [
    "Check this out https://example.com it's great! 😍🔥",
    "Visit /r/movies for more info /u/someone posted it",
    "This   has    lots   of   spaces   and <b>HTML</b> tags",
]
for text in dirty_texts:
    cleaned = preprocessor.clean(text)
    print(f"  Original:  {text}")
    print(f"  Cleaned:   {cleaned}")
    print()

# Step 3: Sentiment Analysis
print("--- Step 3: Sentiment Analysis (XLM-RoBERTa) ---")
print("  (Loading model, this may take a moment...)")
analyzer = SentimentAnalyzer()

for text, lang in test_comments:
    result = analyzer.analyze(text)
    emoji = {"positive": "😊", "negative": "😞", "neutral": "😐"}.get(result["label"], "?")
    print(f"  {emoji} [{result['label']:8s}] (score: {result['score']:.4f}) [{lang}] → {text[:50]}...")

print("\n" + "=" * 60)
print("  NLP Pipeline Test Complete!")
print("=" * 60)
