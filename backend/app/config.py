import os

# Database
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://user:password@localhost:5432/lenguatrends_db"
)

# YouTube API
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")

# TMDB API
TMDB_API_KEY = os.getenv("TMDB_API_KEY", "")

# NLP Settings
SUPPORTED_LANGUAGES = ["es", "en", "ru"]
SENTIMENT_MODEL = "cardiffnlp/twitter-xlm-roberta-base-sentiment-multilingual"
MIN_COMMENT_LENGTH = 10
BATCH_SIZE = 32

# Collector Settings
COLLECTION_INTERVAL_MINUTES = 60
MAX_COMMENTS_PER_CYCLE = 500

# YouTube search suffixes per language
YOUTUBE_SEARCH_SUFFIXES = {
    "en": "movie review",
    "es": "película reseña",
    "ru": "фильм обзор",
}
