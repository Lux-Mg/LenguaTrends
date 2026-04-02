import re


class TextPreprocessor:
    """Cleans and normalizes comment text for NLP processing."""

    def clean(self, text: str) -> str:
        """
        Removes URLs, emojis, excessive whitespace, and normalizes text.
        """
        # Remove URLs
        text = re.sub(r"https?://\S+", "", text)
        # Remove Reddit/YouTube specific patterns
        text = re.sub(r"/u/\S+", "", text)
        text = re.sub(r"/r/\S+", "", text)
        # Remove HTML tags
        text = re.sub(r"<[^>]+>", "", text)
        # Remove emojis and special unicode
        text = re.sub(
            r"[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF"
            r"\U0001F1E0-\U0001F1FF\U00002702-\U000027B0\U0001F900-\U0001F9FF"
            r"\U0001FA00-\U0001FA6F\U0001FA70-\U0001FAFF]+",
            "",
            text,
        )
        # Normalize whitespace
        text = re.sub(r"\s+", " ", text).strip()
        return text
