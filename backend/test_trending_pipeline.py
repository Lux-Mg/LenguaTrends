"""
LenguaTrends — Trending Movies Multilingual Pipeline Test
Fetches trending movies from TMDB, collects YouTube comments in 3 languages,
and processes them through the NLP pipeline.
"""
import sys
sys.path.insert(0, ".")

from app.database import SessionLocal, create_tables
from app.collectors.tmdb import TMDBCollector
from app.collectors.youtube import YouTubeCollector
from app.nlp.orchestrator import NLPOrchestrator
from app.models.comment import MediaEntity, Comment, SentimentResult

def main():
    print("=" * 60)
    print("  LenguaTrends — Trending Multilingual Pipeline")
    print("=" * 60)

    # Step 0: Create tables
    print("\n[Step 0] Creating database tables...")
    create_tables()
    print("  Tables ready.")

    db = SessionLocal()

    try:
        # Step 1: Get trending movies from TMDB
        print("\n[Step 1] Fetching trending movies from TMDB...")
        tmdb = TMDBCollector()
        result = tmdb.get_and_save_trending(db, max_results=5)

        # Step 2: Collect YouTube comments in 3 languages
        print("\n[Step 2] Collecting YouTube comments in 3 languages...")
        yt = YouTubeCollector()

        movies = db.query(MediaEntity).filter(MediaEntity.tmdb_id.isnot(None)).all()
        print(f"  Movies to process: {len(movies)}")

        for movie in movies[:3]:  # Process top 3 to save API quota
            print(f"\n  --- {movie.title} ---")
            print(f"      ES: {movie.title_es}")
            print(f"      RU: {movie.title_ru}")
            stats = yt.collect_multilingual(
                db=db,
                media_entity=movie,
                max_videos=2,
                max_comments_per_video=30,
            )
            print(f"  Total new: {stats['total_new']}, skipped: {stats['total_skipped']}")

        # Step 3: NLP Processing
        print("\n[Step 3] Processing comments with NLP...")
        unprocessed = db.query(Comment).filter(Comment.processed == False).count()
        print(f"  Unprocessed comments: {unprocessed}")

        if unprocessed > 0:
            print("  Loading NLP models...")
            orchestrator = NLPOrchestrator()
            nlp_stats = orchestrator.process_new_comments(db)
            print(f"  Processed: {nlp_stats.get('total', 0)} comments")
            print(f"  Languages: {nlp_stats.get('by_language', {})}")
            print(f"  Sentiment: {nlp_stats.get('sentiment', {})}")

        # Step 4: Summary
        print("\n[Step 4] Database summary:")
        total_comments = db.query(Comment).count()
        total_sentiment = db.query(SentimentResult).count()
        total_movies = db.query(MediaEntity).count()

        print(f"  Total movies: {total_movies}")
        print(f"  Total comments: {total_comments}")
        print(f"  Total sentiment results: {total_sentiment}")

        # Language distribution
        for lang in ["en", "es", "ru", "unsupported"]:
            count = db.query(Comment).filter(Comment.language == lang).count()
            if count > 0:
                print(f"  Comments in {lang}: {count}")

        # Sentiment distribution
        for label in ["positive", "negative", "neutral"]:
            count = db.query(SentimentResult).filter(SentimentResult.label == label).count()
            if count > 0:
                print(f"  Sentiment {label}: {count}")

        # Sample comments per language
        print("\n  Sample comments by language:")
        for lang in ["en", "es", "ru"]:
            sample = db.query(Comment).join(SentimentResult).filter(
                Comment.language == lang
            ).first()
            if sample:
                emoji = {"positive": "😊", "negative": "😞", "neutral": "😐"}.get(
                    sample.sentiment.label, "❓")
                text_preview = sample.text[:60] + "..." if len(sample.text) > 60 else sample.text
                print(f"  {emoji} [{lang}] [{sample.sentiment.label}] ({sample.sentiment.score}) {text_preview}")

    finally:
        db.close()

    print("\n" + "=" * 60)
    print("  Trending Multilingual Pipeline Complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
