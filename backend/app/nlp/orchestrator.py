from sqlalchemy.orm import Session
from app.nlp.language import LanguageDetector
from app.nlp.preprocessor import TextPreprocessor
from app.nlp.sentiment import SentimentAnalyzer
from app.nlp.topics import TopicModeler
from app.models.comment import Comment, SentimentResult, TopicResult
from app.config import MIN_COMMENT_LENGTH, SENTIMENT_MODEL, SUPPORTED_LANGUAGES


class NLPOrchestrator:

    def __init__(self):
        self.lang_detector = LanguageDetector()
        self.preprocessor = TextPreprocessor()
        self.sentiment = SentimentAnalyzer()
        self.topics = TopicModeler()

    def process_new_comments(self, db: Session) -> dict:
        comments = db.query(Comment).filter(Comment.processed.is_(False)).all()

        if not comments:
            return {"processed": 0}

        stats = {
            "total": len(comments),
            "by_language": {},
            "sentiment": {"positive": 0, "negative": 0, "neutral": 0},
        }

        processable = []
        for comment in comments:
            lang = self.lang_detector.detect(comment.text)
            comment.language = lang
            stats["by_language"][lang] = stats["by_language"].get(lang, 0) + 1

            if lang == "unsupported" or len(comment.text) < MIN_COMMENT_LENGTH:
                comment.processed = True
                continue

            processable.append(comment)

        if processable:
            # limpiar texto sin sobreescribir el original
            clean_texts = [self.preprocessor.clean(c.text) for c in processable]
            sentiments = self.sentiment.analyze_batch(clean_texts)

            for comment, sent in zip(processable, sentiments):
                db.add(SentimentResult(
                    comment_id=comment.id, label=sent["label"],
                    score=sent["score"], model_version=SENTIMENT_MODEL,
                ))
                stats["sentiment"][sent["label"]] += 1
                comment.processed = True

        # temas por idioma
        for lang in SUPPORTED_LANGUAGES:
            lang_comments = [c for c in processable if c.language == lang]
            if len(lang_comments) >= 50:
                texts = [self.preprocessor.clean(c.text) for c in lang_comments]
                topics = self.topics.fit_and_label(texts)
                for comment, topic in zip(lang_comments, topics):
                    db.add(TopicResult(
                        comment_id=comment.id, topic_id=topic["topic_id"],
                        topic_label=topic["topic_label"], probability=topic["probability"],
                    ))

        db.commit()
        return stats
