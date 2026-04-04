from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.comment import Comment, TopicResult

router = APIRouter(prefix="/api/topics", tags=["topics"])


@router.get("/")
def get_topics(lang: str = Query(None), movie_id: int = Query(None), db: Session = Depends(get_db)):
    query = (
        db.query(TopicResult.topic_id, TopicResult.topic_label,
                 func.count(TopicResult.id).label("count"),
                 func.avg(TopicResult.probability).label("avg_probability"))
        .join(Comment, Comment.id == TopicResult.comment_id)
        .filter(TopicResult.topic_id >= 0)
    )
    if lang:
        query = query.filter(Comment.language == lang)
    if movie_id:
        query = query.filter(Comment.media_entity_id == movie_id)

    results = query.group_by(TopicResult.topic_id, TopicResult.topic_label).order_by(func.count(TopicResult.id).desc()).all()

    return [{"topic_id": r.topic_id, "topic_label": r.topic_label,
             "count": r.count, "avg_probability": round(float(r.avg_probability), 4)}
            for r in results]
