"""
Full pipeline test: YouTube Collection → Database → NLP Processing.
This demonstrates the complete LenguaTrends workflow.
"""
import sys
sys.path.insert(0, ".")

from app.database import create_tables, SessionLocal
from app.collectors.youtube import YouTubeCollector
from app.nlp.language import LanguageDetector
from app.nlp.preprocessor import TextPreprocessor
from app.nlp.sentiment import SentimentAnalyzer
from app.models.comment import Comment, SentimentResult, MediaEntity, CollectionLog

print("=" * 60)
print("  LenguaTrends — Full Pipeline Test")
print("=" * 60)

# Step 0: Create tables
print("\n[Step 0] Creating database tables...")
create_tables()
print("  Tables created successfully.")

db = SessionLocal()

# Step 1: Add a media entity
print("\n[Step 1] Adding media entity...")
movie = db.query(MediaEntity).filter(MediaEntity.title == "Dune: Part Two").first()
if not movie:
    movie = MediaEntity(title="Dune: Part Two", type="movie", search_keywords="Dune Part Two")
    db.add(movie)
    db.commit()
    db.refresh(movie)
    print(f"  Created: {movie.title} (id={movie.id})")
else:
    print(f"  Already exists: {movie.title} (id={movie.id})")

# Step 2: Collect comments from YouTube
print("\n[Step 2] Collecting comments from YouTube...")
collector = YouTubeCollector()
stats = collector.collect(
    db=db,
    query="Dune Part Two",
    media_entity_id=movie.id,
    max_videos=2,
    max_comments_per_video=20,
)
print(f"  Videos found: {stats['videos_found']}")
print(f"  New comments saved: {stats['comments_new']}")
print(f"  Duplicates skipped: {stats['comments_skipped']}")
print(f"  Status: {stats['status']}")

# Step 3: Process with NLP
print("\n[Step 3] Processing comments with NLP...")
unprocessed = db.query(Comment).filter(Comment.processed == False).all()
print(f"  Unprocessed comments: {len(unprocessed)}")

if unprocessed:
    detector = LanguageDetector()
    preprocessor = TextPreprocessor()
    print("  Loading sentiment model...")
    analyzer = SentimentAnalyzer()

    processed_count = 0
    lang_stats = {}
    sent_stats = {"positive": 0, "negative": 0, "neutral": 0}

    for comment in unprocessed:
        # Detect language
        lang = detector.detect(comment.text)
        comment.language = lang
        lang_stats[lang] = lang_stats.get(lang, 0) + 1

        if lang == "unsupported" or len(comment.text) < 10:
            comment.processed = True
            continue

        # Clean text
        cleaned = preprocessor.clean(comment.text)
        if len(cleaned) < 10:
            comment.processed = True
            continue

        # Analyze sentiment
        result = analyzer.analyze(cleaned)
        sentiment = SentimentResult(
            comment_id=comment.id,
            label=result["label"],
            score=result["score"],
            model_version="twitter-xlm-roberta-base-sentiment-multilingual",
        )
        db.add(sentiment)
        sent_stats[result["label"]] += 1
        comment.processed = True
        processed_count += 1

    db.commit()

    print(f"\n  Processed: {processed_count} comments")
    print(f"  Languages: {lang_stats}")
    print(f"  Sentiment: {sent_stats}")

# Step 4: Show results from database
print("\n[Step 4] Results from database:")
total_comments = db.query(Comment).count()
total_sentiments = db.query(SentimentResult).count()
total_logs = db.query(CollectionLog).count()

print(f"  Total comments in DB: {total_comments}")
print(f"  Total sentiment results: {total_sentiments}")
print(f"  Collection logs: {total_logs}")

# Show sample results
print("\n  Sample analyzed comments:")
samples = (
    db.query(Comment, SentimentResult)
    .join(SentimentResult, Comment.id == SentimentResult.comment_id)
    .limit(5)
    .all()
)
for comment, sentiment in samples:
    emoji = {"positive": "😊", "negative": "😞", "neutral": "😐"}.get(sentiment.label, "?")
    text = comment.text[:60].replace("\n", " ")
    print(f"  {emoji} [{sentiment.label:8s}] ({sentiment.score:.2f}) [{comment.language}] {text}...")

db.close()

print("\n" + "=" * 60)
print("  Full Pipeline Test Complete!")
print("=" * 60)
