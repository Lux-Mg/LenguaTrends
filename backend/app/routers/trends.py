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


@router.get("/dynamics")
def get_dynamics(
    granularity: str = Query("month", description="day | week | month | year"),
    period: str = Query("all", description="all | 3m | 6m | 1y"),
    db: Session = Depends(get_db),
):
    if granularity not in {"day", "week", "month", "year"}:
        return {"error": f"unsupported granularity '{granularity}'", "data": []}
    if period not in {"all", "3m", "6m", "1y"}:
        return {"error": f"unsupported period '{period}'", "data": []}

    # truncamiento de fecha segun granularidad
    if granularity == "year":
        bucket_expr = func.to_char(Comment.created_at, "YYYY")
    elif granularity == "month":
        bucket_expr = func.to_char(Comment.created_at, "YYYY-MM")
    elif granularity == "week":
        bucket_expr = func.to_char(Comment.created_at, "IYYY-IW")  # ISO year-week
    else:  # day
        bucket_expr = func.to_char(Comment.created_at, "YYYY-MM-DD")

    query = (
        db.query(bucket_expr.label("bucket"), Comment.language, func.count(Comment.id).label("count"))
        .filter(Comment.language.in_(SUPPORTED_LANGUAGES))
        .filter(Comment.created_at.isnot(None))
    )

    if period != "all":
        days_map = {"3m": 90, "6m": 180, "1y": 365}
        since = datetime.now(timezone.utc) - timedelta(days=days_map[period])
        query = query.filter(Comment.created_at >= since)

    rows = query.group_by("bucket", Comment.language).order_by("bucket").all()

    # Reorganizar a estructura { bucket: { en, es, ru } }
    out = {}
    for r in rows:
        if r.bucket not in out:
            out[r.bucket] = {"key": r.bucket, "en": 0, "es": 0, "ru": 0}
        if r.language in ("en", "es", "ru"):
            out[r.bucket][r.language] = r.count

    return {"granularity": granularity, "period": period, "data": list(out.values())}


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
