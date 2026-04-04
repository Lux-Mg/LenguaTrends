import re


class TextPreprocessor:

    def clean(self, text: str) -> str:
        text = re.sub(r"https?://\S+", "", text)
        text = re.sub(r"/u/\S+", "", text)
        text = re.sub(r"/r/\S+", "", text)
        text = re.sub(r"<[^>]+>", "", text)
        # emojis y unicode especial
        text = re.sub(
            r"[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF"
            r"\U0001F1E0-\U0001F1FF\U00002702-\U000027B0\U0001F900-\U0001F9FF"
            r"\U0001FA00-\U0001FA6F\U0001FA70-\U0001FAFF]+",
            "", text,
        )
        text = re.sub(r"\s+", " ", text).strip()
        return text
