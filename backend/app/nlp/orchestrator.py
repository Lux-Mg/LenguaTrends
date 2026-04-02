from sqlalchemy.orm import Session
from app.nlp.language import LanguageDetector
from app.nlp.preprocessor import TextPreprocessor
from app.nlp.sentiment import SentimentAnalyzer
from app.nlp.topics import TopicModeler
from app.models.comment import Comment, SentimentResult, TopicResult
from app.config import MIN_COMMENT_LENGTH, SENTIMENT_MODEL


class NLPOrchestrator:
    """Coordinates the full NLP pipeline: language → clean → sentiment → topics."""

    def __init__(self):
        self.language_detector = LanguageDetector()
        self.preprocessor = TextPreprocessor()
        self.sentiment_analyzer = SentimentAnalyzer()
        self.topic_modeler = TopicModeler()

    def process_new_comments(self, db: Session) -> dict:
        """
        Processes all unprocessed comments in the database.
        Returns summary statistics.
        """
        comments = db.query(Comment).filter(Comment.processed == False).all()

        if not comments:
            return {"processed": 0, "message": "No new comments to process"}

        stats = {
            "total": len(comments),
            "by_language": {"es": 0, "en": 0, "ru": 0, "unsupported": 0},
            "sentiment": {"positive": 0, "negative": 0, "neutral": 0},
            "topics_generated": False,
        }

        # Step 1 & 2: Detect language and clean text
        processable = []
        for comment in comments:
            lang = self.language_detector.detect(comment.text)
            comment.language = lang
            stats["by_language"][lang] = stats["by_language"].get(lang, 0) + 1

            if lang == "unsupported" or len(comment.text) < MIN_COMMENT_LENGTH:
                comment.processed = True
                continue

            comment.text = self.preprocessor.clean(comment.text)
            processable.append(comment)

        # Step 3: Sentiment analysis in batch
        if processable:
            texts = [c.text for c in processable]
            sentiments = self.sentiment_analyzer.analyze_batch(texts)

            for comment, sent in zip(processable, sentiments):
                sentiment_result = SentimentResult(
                    comment_id=comment.id,
                    label=sent["label"],
                    score=sent["score"],
                    model_version=SENTIMENT_MODEL,
                )
                db.add(sentiment_result)
                stats["sentiment"][sent["label"]] += 1
                comment.processed = True

        # Step 4: Topic modeling by language
        for lang in ["es", "en", "ru"]:
            lang_comments = [c for c in processable if c.language == lang]
            if len(lang_comments) >= 50:
                texts = [c.text for c in lang_comments]
                topics = self.topic_modeler.fit_and_label(texts)

                for comment, topic in zip(lang_comments, topics):
                    topic_result = TopicResult(
                        comment_id=comment.id,
                        topic_id=topic["topic_id"],
                        topic_label=topic["topic_label"],
                        probability=topic["probability"],
                    )
                    db.add(topic_result)
                stats["topics_generated"] = True

        db.commit()
        return stats
