from transformers import pipeline
from app.config import SENTIMENT_MODEL, BATCH_SIZE


class SentimentAnalyzer:

    LABEL_MAP = {
        "positive": "positive", "negative": "negative", "neutral": "neutral",
        "Positive": "positive", "Negative": "negative", "Neutral": "neutral",
    }

    def __init__(self):
        print(f"Cargando modelo: {SENTIMENT_MODEL}...")
        self.pipe = pipeline(
            "sentiment-analysis", model=SENTIMENT_MODEL,
            top_k=1, truncation=True, max_length=512,
        )
        print("Modelo cargado.")

    def analyze(self, text: str) -> dict:
        result = self.pipe(text)
        top = result[0] if isinstance(result[0], dict) else result[0][0]
        return {
            "label": self.LABEL_MAP.get(top["label"], top["label"].lower()),
            "score": round(top["score"], 4),
        }

    def analyze_batch(self, texts: list[str]) -> list[dict]:
        results = []
        for i in range(0, len(texts), BATCH_SIZE):
            batch = texts[i:i + BATCH_SIZE]
            for res in self.pipe(batch):
                top = res[0]
                results.append({
                    "label": self.LABEL_MAP.get(top["label"], top["label"].lower()),
                    "score": round(top["score"], 4),
                })
        return results
