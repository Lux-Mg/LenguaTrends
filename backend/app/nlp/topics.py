from bertopic import BERTopic


class TopicModeler:

    def __init__(self, min_topic_size: int = 10):
        self.model = BERTopic(language="multilingual", min_topic_size=min_topic_size, verbose=False)

    def fit_and_label(self, texts: list[str]) -> list[dict]:
        if len(texts) < 50:
            return [{"topic_id": -1, "topic_label": "insufficient_data", "probability": 0.0} for _ in texts]

        topics, probs = self.model.fit_transform(texts)

        topic_labels = {}
        for _, row in self.model.get_topic_info().iterrows():
            topic_labels[row["Topic"]] = row.get("Name", f"topic_{row['Topic']}")

        results = []
        for topic_id, prob in zip(topics, probs):
            prob_val = float(prob) if not hasattr(prob, "__len__") else float(max(prob))
            results.append({
                "topic_id": int(topic_id),
                "topic_label": topic_labels.get(topic_id, f"topic_{topic_id}"),
                "probability": round(prob_val, 4),
            })
        return results
