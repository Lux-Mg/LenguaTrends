from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from app.database import get_db
from app.models.comment import Comment, MediaEntity, SentimentResult
from app.config import SUPPORTED_LANGUAGES

router = APIRouter(prefix="/api/trends", tags=["trends"])

SENTIMENT_LABELS = ["positive", "negative", "neutral"]


@router.get("/")
def get_trends(
    lang: str = Query(None), period: int = Query(None),
    limit: int = Query(10), db: Session = Depends(get_db),
):
    query = (
        db.query(MediaEntity.id, MediaEntity.title, MediaEntity.title_es,
                 MediaEntity.title_ru, MediaEntity.type,
                 func.count(Comment.id).label("comment_count"))
        .join(Comment, Comment.media_entity_id == MediaEntity.id)
        .filter(Comment.processed.is_(True))
    )

    if lang:
        query = query.filter(Comment.language == lang)
    if period:
        since = datetime.now(timezone.utc) - timedelta(days=period)
        query = query.filter(Comment.created_at >= since)

    results = query.group_by(MediaEntity.id).order_by(func.count(Comment.id).desc()).limit(limit).all()

    return [{"id": r.id, "title": r.title, "title_es": r.title_es,
             "title_ru": r.title_ru, "type": r.type, "comment_count": r.comment_count}
            for r in results]


@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    total_comments = db.query(Comment).filter(Comment.processed.is_(True)).count()
    total_movies = db.query(MediaEntity).count()

    lang_stats = {l: db.query(Comment).filter(Comment.language == l).count() for l in SUPPORTED_LANGUAGES}

    sentiment_stats = {l: db.query(SentimentResult).filter(SentimentResult.label == l).count() for l in SENTIMENT_LABELS}

    total_sent = sum(sentiment_stats.values())
    pos_pct = round(sentiment_stats["positive"] / total_sent * 100, 1) if total_sent > 0 else 0

    return {
        "total_comments": total_comments, "total_movies": total_movies,
        "total_languages": len([v for v in lang_stats.values() if v > 0]),
        "positive_percentage": pos_pct,
        "by_language": lang_stats, "by_sentiment": sentiment_stats,
    }
