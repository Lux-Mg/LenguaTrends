from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class MediaEntity(Base):
    __tablename__ = "media_entities"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    title_es = Column(String(255), nullable=True)
    title_ru = Column(String(255), nullable=True)
    tmdb_id = Column(Integer, nullable=True, unique=True)
    type = Column(String(50))  # 'movie' or 'series'
    search_keywords = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    comments = relationship("Comment", back_populates="media_entity")


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source_id = Column(String(255), unique=True, nullable=False)
    text = Column(Text, nullable=False)
    author = Column(String(255))
    platform = Column(String(50))  # 'youtube'
    source_url = Column(Text)
    media_entity_id = Column(Integer, ForeignKey("media_entities.id"), nullable=True)
    language = Column(String(20))  # 'es', 'en', 'ru', 'unsupported'
    processed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    media_entity = relationship("MediaEntity", back_populates="comments")
    sentiment = relationship("SentimentResult", back_populates="comment", uselist=False)
    topic = relationship("TopicResult", back_populates="comment", uselist=False)


class SentimentResult(Base):
    __tablename__ = "sentiment_results"

    id = Column(Integer, primary_key=True, autoincrement=True)
    comment_id = Column(Integer, ForeignKey("comments.id"), nullable=False)
    label = Column(String(20))  # 'positive', 'negative', 'neutral'
    score = Column(Float)
    model_version = Column(String(100))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    comment = relationship("Comment", back_populates="sentiment")


class TopicResult(Base):
    __tablename__ = "topic_results"

    id = Column(Integer, primary_key=True, autoincrement=True)
    comment_id = Column(Integer, ForeignKey("comments.id"), nullable=False)
    topic_id = Column(Integer)
    topic_label = Column(String(255))
    probability = Column(Float)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    comment = relationship("Comment", back_populates="topic")


class CollectionLog(Base):
    __tablename__ = "collection_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source = Column(String(50))  # 'youtube', 'tmdb'
    query = Column(String(255))
    count_collected = Column(Integer, default=0)
    status = Column(String(20))  # 'success', 'error', 'partial'
    error_message = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
