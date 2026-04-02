import os

# Database
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://user:password@localhost:5432/lenguatrends_db"
)

# Reddit API
REDDIT_CLIENT_ID = os.getenv("REDDIT_CLIENT_ID", "")
REDDIT_CLIENT_SECRET = os.getenv("REDDIT_CLIENT_SECRET", "")
REDDIT_USER_AGENT = os.getenv("REDDIT_USER_AGENT", "LenguaTrends/1.0")

# YouTube API
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")

# NLP Settings
SUPPORTED_LANGUAGES = ["es", "en", "ru"]
SENTIMENT_MODEL = "cardiffnlp/twitter-xlm-roberta-base-sentiment-multilingual"
MIN_COMMENT_LENGTH = 10
BATCH_SIZE = 32

# Collector Settings
COLLECTION_INTERVAL_MINUTES = 60
MAX_COMMENTS_PER_CYCLE = 500
