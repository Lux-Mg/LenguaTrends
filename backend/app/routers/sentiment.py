from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.comment import Comment, MediaEntity, SentimentResult
from app.config import SUPPORTED_LANGUAGES

router = APIRouter(prefix="/api/sentiment", tags=["sentiment"])


@router.get("/by-language")
def get_sentiment_by_language(movie_id: int = Query(None), db: Session = Depends(get_db)):
    query = (
        db.query(Comment.language, SentimentResult.label, func.count(SentimentResult.id).label("count"))
        .join(SentimentResult, SentimentResult.comment_id == Comment.id)
        .filter(Comment.language.in_(SUPPORTED_LANGUAGES))
    )
    if movie_id:
        query = query.filter(Comment.media_entity_id == movie_id)

    results = query.group_by(Comment.language, SentimentResult.label).all()

    data = {lang: {"positive": 0, "negative": 0, "neutral": 0} for lang in SUPPORTED_LANGUAGES}
    for r in results:
        if r.language in data:
            data[r.language][r.label] = r.count
    return data


@router.get("/by-movie")
def get_sentiment_by_movie(lang: str = Query(None), limit: int = Query(5), db: Session = Depends(get_db)):
    query = (
        db.query(MediaEntity.id, MediaEntity.title, SentimentResult.label, func.count(SentimentResult.id).label("count"))
        .join(Comment, Comment.media_entity_id == MediaEntity.id)
        .join(SentimentResult, SentimentResult.comment_id == Comment.id)
    )
    if lang:
        query = query.filter(Comment.language == lang)

    results = query.group_by(MediaEntity.id, MediaEntity.title, SentimentResult.label).all()

    movies = {}
    for r in results:
        if r.id not in movies:
            movies[r.id] = {"id": r.id, "title": r.title, "positive": 0, "negative": 0, "neutral": 0, "total": 0}
        movies[r.id][r.label] = r.count
        movies[r.id]["total"] += r.count

    return sorted(movies.values(), key=lambda x: x["total"], reverse=True)[:limit]
