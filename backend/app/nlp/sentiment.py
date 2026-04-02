from transformers import pipeline
from app.config import SENTIMENT_MODEL, BATCH_SIZE


class SentimentAnalyzer:
    """Analyzes sentiment using XLM-RoBERTa multilingual model."""

    LABEL_MAP = {
        "positive": "positive",
        "negative": "negative",
        "neutral": "neutral",
        "Positive": "positive",
        "Negative": "negative",
        "Neutral": "neutral",
    }

    def __init__(self):
        print(f"Loading sentiment model: {SENTIMENT_MODEL}...")
        self.pipe = pipeline(
            "sentiment-analysis",
            model=SENTIMENT_MODEL,
            top_k=1,
            truncation=True,
            max_length=512,
        )
        print("Sentiment model loaded successfully.")

    def analyze(self, text: str) -> dict:
        """
        Analyzes sentiment of a single text.
        Returns: {'label': 'positive'|'negative'|'neutral', 'score': float}
        """
        result = self.pipe(text)
        # top_k returns [[{label, score}]], so we unwrap
        top = result[0] if isinstance(result[0], dict) else result[0][0]
        label_raw = top["label"]
        return {
            "label": self.LABEL_MAP.get(label_raw, label_raw.lower()),
            "score": round(top["score"], 4),
        }

    def analyze_batch(self, texts: list[str]) -> list[dict]:
        """
        Analyzes sentiment of a batch of texts.
        Returns list of {'label': str, 'score': float}
        """
        results = []
        for i in range(0, len(texts), BATCH_SIZE):
            batch = texts[i : i + BATCH_SIZE]
            batch_results = self.pipe(batch)
            for res in batch_results:
                top = res[0]
                label_raw = top["label"]
                results.append({
                    "label": self.LABEL_MAP.get(label_raw, label_raw.lower()),
                    "score": round(top["score"], 4),
                })
        return results
