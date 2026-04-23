from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, case
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
        db.query(MediaEntity.id, MediaEntity.title, MediaEntity.title_es,
                 MediaEntity.title_ru, SentimentResult.label, func.count(SentimentResult.id).label("count"))
        .join(Comment, Comment.media_entity_id == MediaEntity.id)
        .join(SentimentResult, SentimentResult.comment_id == Comment.id)
    )
    if lang:
        query = query.filter(Comment.language == lang)

    results = query.group_by(MediaEntity.id, MediaEntity.title, MediaEntity.title_es, MediaEntity.title_ru, SentimentResult.label).all()

    movies = {}
    for r in results:
        if r.id not in movies:
            movies[r.id] = {"id": r.id, "title": r.title, "title_es": r.title_es, "title_ru": r.title_ru, "positive": 0, "negative": 0, "neutral": 0, "total": 0}
        movies[r.id][r.label] = r.count
        movies[r.id]["total"] += r.count

    return sorted(movies.values(), key=lambda x: x["total"], reverse=True)[:limit]


@router.get("/language-divergence")
def get_language_divergence(
    min_count: int = Query(30, ge=1, description="mínimo de comentarios por idioma para incluir"),
    db: Session = Depends(get_db),
):
    # polaridad continua: +score si positivo, -score si negativo, 0 si neutro -> [-1, 1]
    polarity = case(
        (SentimentResult.label == "positive", SentimentResult.score),
        (SentimentResult.label == "negative", -SentimentResult.score),
        else_=0.0,
    )
    positive_count = func.sum(case((SentimentResult.label == "positive", 1), else_=0))
    negative_count = func.sum(case((SentimentResult.label == "negative", 1), else_=0))
    neutral_count = func.sum(case((SentimentResult.label == "neutral", 1), else_=0))

    rows = (
        db.query(
            MediaEntity.id,
            MediaEntity.title,
            MediaEntity.title_es,
            MediaEntity.title_ru,
            Comment.language,
            func.count(SentimentResult.id).label("total"),
            positive_count.label("positive"),
            negative_count.label("negative"),
            neutral_count.label("neutral"),
            func.avg(polarity).label("polarity_avg"),
        )
        .join(Comment, Comment.media_entity_id == MediaEntity.id)
        .join(SentimentResult, SentimentResult.comment_id == Comment.id)
        .filter(Comment.language.in_(SUPPORTED_LANGUAGES))
        .group_by(MediaEntity.id, MediaEntity.title, MediaEntity.title_es, MediaEntity.title_ru, Comment.language)
        .all()
    )

    movies = {}
    for r in rows:
        if r.id not in movies:
            movies[r.id] = {
                "id": r.id,
                "title": r.title,
                "title_es": r.title_es,
                "title_ru": r.title_ru,
                "by_language": {},
            }
        pct_pos = round(r.positive / r.total * 100, 1) if r.total else 0.0
        movies[r.id]["by_language"][r.language] = {
            "total": r.total,
            "positive": r.positive,
            "negative": r.negative,
            "neutral": r.neutral,
            "pct_positive": pct_pos,
            "polarity_avg": round(float(r.polarity_avg or 0), 4),
        }

    result = []
    for movie in movies.values():
        valid = {lang: d for lang, d in movie["by_language"].items() if d["total"] >= min_count}
        # necesitamos al menos 2 idiomas validos para hablar de divergencia
        if len(valid) < 2:
            continue

        pcts = {lang: d["pct_positive"] for lang, d in valid.items()}
        pols = {lang: d["polarity_avg"] for lang, d in valid.items()}
        winner = max(pcts, key=pcts.get)
        loser = min(pcts, key=pcts.get)

        movie["spread_pct"] = round(pcts[winner] - pcts[loser], 1)
        movie["winner"] = winner
        movie["loser"] = loser
        movie["spread_polarity"] = round(pols[max(pols, key=pols.get)] - pols[min(pols, key=pols.get)], 4)
        movie["languages_included"] = sorted(valid.keys())
        result.append(movie)

    result.sort(key=lambda m: m["spread_pct"], reverse=True)
    return result
