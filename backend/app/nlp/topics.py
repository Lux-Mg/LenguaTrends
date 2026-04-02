from bertopic import BERTopic


class TopicModeler:
    """Topic modeling using BERTopic."""

    def __init__(self, min_topic_size: int = 10):
        self.model = BERTopic(
            language="multilingual",
            min_topic_size=min_topic_size,
            verbose=False,
        )
        self.is_fitted = False

    def fit_and_label(self, texts: list[str]) -> list[dict]:
        """
        Fits BERTopic on a corpus of texts and returns topic assignments.
        Returns list of {'topic_id': int, 'topic_label': str, 'probability': float}
        Requires at least 50 documents.
        """
        if len(texts) < 50:
            return [
                {"topic_id": -1, "topic_label": "insufficient_data", "probability": 0.0}
                for _ in texts
            ]

        topics, probs = self.model.fit_transform(texts)
        self.is_fitted = True

        topic_info = self.model.get_topic_info()
        topic_labels = {}
        for _, row in topic_info.iterrows():
            tid = row["Topic"]
            name = row["Name"] if "Name" in row else f"topic_{tid}"
            topic_labels[tid] = name

        results = []
        for i, (topic_id, prob) in enumerate(zip(topics, probs)):
            prob_value = float(prob) if not hasattr(prob, "__len__") else float(max(prob))
            results.append({
                "topic_id": int(topic_id),
                "topic_label": topic_labels.get(topic_id, f"topic_{topic_id}"),
                "probability": round(prob_value, 4),
            })
        return results
