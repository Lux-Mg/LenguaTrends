from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.comment import Comment, MediaEntity, SentimentResult

router = APIRouter(prefix="/api/comments", tags=["comments"])


@router.get("/")
def get_comments(
    lang: str = Query(None), sentiment: str = Query(None),
    movie_id: int = Query(None), limit: int = Query(20),
    offset: int = Query(0), db: Session = Depends(get_db),
):
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
            "sentiment": {"label": s.label, "score": s.score} if s else None,
        } for c, s, m in results],
    }
