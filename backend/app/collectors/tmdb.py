import requests
from sqlalchemy.orm import Session
from app.config import TMDB_API_KEY
from app.models.comment import MediaEntity


class TMDBCollector:

    BASE_URL = "https://api.themoviedb.org/3"

    def __init__(self):
        self.api_key = TMDB_API_KEY

    def get_trending_movies(self, time_window="week", max_results=10):
        url = f"{self.BASE_URL}/trending/movie/{time_window}"
        resp = requests.get(url, params={"api_key": self.api_key, "language": "en-US"})
        resp.raise_for_status()

        movies = []
        for movie in resp.json().get("results", [])[:max_results]:
            tmdb_id = movie["id"]
            movies.append({
                "tmdb_id": tmdb_id,
                "title": movie["title"],
                "title_es": self._get_title(tmdb_id, "es-ES") or movie["title"],
                "title_ru": self._get_title(tmdb_id, "ru-RU") or movie["title"],
                "type": "movie",
            })
        return movies

    def _get_title(self, tmdb_id, language):
        try:
            resp = requests.get(f"{self.BASE_URL}/movie/{tmdb_id}",
                                params={"api_key": self.api_key, "language": language})
            resp.raise_for_status()
            return resp.json().get("title", "")
        except Exception:
            return ""

    def save_movies(self, db: Session, movies: list[dict]):
        stats = {"new": 0, "skipped": 0}
        for movie in movies:
            if db.query(MediaEntity).filter(MediaEntity.tmdb_id == movie["tmdb_id"]).first():
                stats["skipped"] += 1
                continue
            db.add(MediaEntity(
                title=movie["title"], title_es=movie["title_es"],
                title_ru=movie["title_ru"], tmdb_id=movie["tmdb_id"], type=movie["type"],
            ))
            stats["new"] += 1
        db.commit()
        return stats

    def get_and_save_trending(self, db: Session, max_results=10):
        print(f"\n[TMDB] Buscando top {max_results} peliculas trending...")
        movies = self.get_trending_movies(max_results=max_results)
        for m in movies:
            print(f"  - {m['title']} | ES: {m['title_es']} | RU: {m['title_ru']}")
        stats = self.save_movies(db, movies)
        print(f"[TMDB] Guardadas: {stats['new']} nuevas, {stats['skipped']} existentes")
        return {"movies": movies, "stats": stats}
