from langdetect import detect, LangDetectException
from app.config import SUPPORTED_LANGUAGES


class LanguageDetector:

    def detect(self, text: str) -> str:
        try:
            lang = detect(text)
            return lang if lang in SUPPORTED_LANGUAGES else "unsupported"
        except LangDetectException:
            return "unsupported"
