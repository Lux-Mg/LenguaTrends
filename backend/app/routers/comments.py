from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.comment import Comment, MediaEntity, SentimentResult

router = APIRouter(prefix="/api/comments", tags=["comments"])


SUPPORTED_LANGS = {"es", "en", "ru"}
SUPPORTED_SENTIMENTS = {"positive", "negative", "neutral"}


@router.get("/")
def get_comments(
    lang: str = Query(None), sentiment: str = Query(None),
    movie_id: int = Query(None),
    limit: int = Query(20, ge=1, le=200, description="máx 200 por respuesta"),
    offset: int = Query(0, ge=0), db: Session = Depends(get_db),
):
    # validar parametros enumerados antes de tocar la BD
    if lang and lang not in SUPPORTED_LANGS:
        return {"total": 0, "offset": offset, "limit": limit, "comments": [],
                "error": f"unsupported lang '{lang}', use one of {sorted(SUPPORTED_LANGS)}"}
    if sentiment and sentiment not in SUPPORTED_SENTIMENTS:
        return {"total": 0, "offset": offset, "limit": limit, "comments": [],
                "error": f"unsupported sentiment '{sentiment}', use one of {sorted(SUPPORTED_SENTIMENTS)}"}

    query = (
        db.query(Comment, SentimentResult, MediaEntity)
        .outerjoin(SentimentResult, SentimentResult.comment_id == Comment.id)
        .outerjoin(MediaEntity, MediaEntity.id == Comment.media_entity_id)
        .filter(Comment.processed.is_(True))
    )

    if lang:
        query = query.filter(Comment.language == lang)
    if sentiment:
        query = query.filter(SentimentResult.label == sentiment)
    if movie_id:
        query = query.filter(Comment.media_entity_id == movie_id)

    total = query.count()
    results = query.order_by(Comment.created_at.desc()).offset(offset).limit(limit).all()

    return {
        "total": total, "offset": offset, "limit": limit,
        "comments": [{
            "id": c.id, "text": c.text, "author": c.author,
            "platform": c.platform, "language": c.language,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "movie": m.title if m else None,
            "movie_es": m.title_es if m else None,
            "movie_ru": m.title_ru if m else None,
            "sentiment": {"label": s.label, "score": s.score} if s else None,
        } for c, s, m in results],
    }
