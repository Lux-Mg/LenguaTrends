from googleapiclient.discovery import build
from sqlalchemy.orm import Session
from datetime import datetime
from app.config import YOUTUBE_API_KEY, YOUTUBE_SEARCH_SUFFIXES
from app.models.comment import Comment, CollectionLog, MediaEntity


class YouTubeCollector:

    def __init__(self):
        self.youtube = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)

    def search_videos(self, query, max_results=5, language="en"):
        resp = self.youtube.search().list(
            q=query, part="snippet", type="video",
            maxResults=max_results, relevanceLanguage=language, order="relevance",
        ).execute()

        return [{"video_id": i["id"]["videoId"], "title": i["snippet"]["title"]}
                for i in resp.get("items", [])]

    def get_comments(self, video_id, max_comments=100):
        comments = []
        try:
            resp = self.youtube.commentThreads().list(
                part="snippet", videoId=video_id,
                maxResults=min(max_comments, 100), textFormat="plainText", order="relevance",
            ).execute()

            for item in resp.get("items", []):
                s = item["snippet"]["topLevelComment"]["snippet"]
                comments.append({
                    "source_id": f"yt_{item['id']}",
                    "text": s["textDisplay"],
                    "author": s.get("authorDisplayName", "unknown"),
                    "platform": "youtube",
                    "source_url": f"https://www.youtube.com/watch?v={video_id}",
                    "created_at": datetime.fromisoformat(s["publishedAt"].replace("Z", "+00:00")),
                })
        except Exception as e:
            print(f"  Error en video {video_id}: {e}")
        return comments

    def collect(self, db: Session, query, media_entity_id=None, language="en",
                max_videos=3, max_comments_per_video=50):
        stats = {"query": query, "videos_found": 0, "comments_new": 0,
                 "comments_skipped": 0, "status": "success", "error": None}
        try:
            videos = self.search_videos(query, max_results=max_videos, language=language)
            stats["videos_found"] = len(videos)

            for video in videos:
                for c in self.get_comments(video["video_id"], max_comments_per_video):
                    if db.query(Comment).filter(Comment.source_id == c["source_id"]).first():
                        stats["comments_skipped"] += 1
                        continue
                    db.add(Comment(**c, media_entity_id=media_entity_id))
                    stats["comments_new"] += 1
            db.commit()
        except Exception as e:
            stats["status"] = "error"
            stats["error"] = str(e)

        db.add(CollectionLog(
            source="youtube", query=query, count_collected=stats["comments_new"],
            status=stats["status"], error_message=stats["error"],
        ))
        db.commit()
        return stats

    def collect_multilingual(self, db: Session, media_entity: MediaEntity,
                              max_videos=2, max_comments_per_video=50):
        titles = {
            "en": media_entity.title,
            "es": media_entity.title_es or media_entity.title,
            "ru": media_entity.title_ru or media_entity.title,
        }
        total = {"movie": media_entity.title, "by_language": {}, "total_new": 0, "total_skipped": 0}

        for lang, title in titles.items():
            query = f"{title} {YOUTUBE_SEARCH_SUFFIXES.get(lang, 'movie review')}"
            print(f"  [{lang.upper()}] Buscando: \"{query}\"")

            stats = self.collect(db=db, query=query, media_entity_id=media_entity.id,
                                language=lang, max_videos=max_videos,
                                max_comments_per_video=max_comments_per_video)

            total["by_language"][lang] = {"query": query, "videos": stats["videos_found"],
                                          "new": stats["comments_new"], "skipped": stats["comments_skipped"]}
            total["total_new"] += stats["comments_new"]
            total["total_skipped"] += stats["comments_skipped"]
            print(f"  [{lang.upper()}] Videos: {stats['videos_found']}, Nuevos: {stats['comments_new']}")

        return total
