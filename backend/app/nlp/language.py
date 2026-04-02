from langdetect import detect, LangDetectException
from app.config import SUPPORTED_LANGUAGES


class LanguageDetector:
    """Detects the language of a comment using langdetect."""

    def detect(self, text: str) -> str:
        """
        Returns language code ('es', 'en', 'ru') or 'unsupported'.
        """
        try:
            lang = detect(text)
            if lang in SUPPORTED_LANGUAGES:
                return lang
            return "unsupported"
        except LangDetectException:
            return "unsupported"
