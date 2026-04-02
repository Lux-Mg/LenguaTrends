from googleapiclient.discovery import build
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.config import YOUTUBE_API_KEY
from app.models.comment import Comment, CollectionLog, MediaEntity


class YouTubeCollector:
    """Collects comments from YouTube videos about movies and series."""

    def __init__(self):
        self.youtube = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)

    def search_videos(self, query: str, max_results: int = 5) -> list[dict]:
        """
        Searches YouTube for videos matching the query.
        Returns list of {'video_id': str, 'title': str}
        """
        request = self.youtube.search().list(
            q=query + " movie trailer review",
            part="snippet",
            type="video",
            maxResults=max_results,
            relevanceLanguage="en",
            order="relevance",
        )
        response = request.execute()

        videos = []
        for item in response.get("items", []):
            videos.append({
                "video_id": item["id"]["videoId"],
                "title": item["snippet"]["title"],
            })
        return videos

    def get_comments(self, video_id: str, max_comments: int = 100) -> list[dict]:
        """
        Gets comments from a YouTube video.
        Returns list of comment dicts.
        """
        comments = []
        try:
            request = self.youtube.commentThreads().list(
                part="snippet",
                videoId=video_id,
                maxResults=min(max_comments, 100),
                textFormat="plainText",
                order="relevance",
            )
            response = request.execute()

            for item in response.get("items", []):
                snippet = item["snippet"]["topLevelComment"]["snippet"]
                comments.append({
                    "source_id": f"yt_{item['id']}",
                    "text": snippet["textDisplay"],
                    "author": snippet.get("authorDisplayName", "unknown"),
                    "platform": "youtube",
                    "source_url": f"https://www.youtube.com/watch?v={video_id}",
                    "created_at": datetime.fromisoformat(
                        snippet["publishedAt"].replace("Z", "+00:00")
                    ),
                })
        except Exception as e:
            print(f"Error getting comments for video {video_id}: {e}")

        return comments

    def collect(self, db: Session, query: str, media_entity_id: int = None,
                max_videos: int = 3, max_comments_per_video: int = 50) -> dict:
        """
        Full collection cycle: search videos → get comments → save to DB.
        Returns collection stats.
        """
        stats = {"query": query, "videos_found": 0, "comments_new": 0,
                 "comments_skipped": 0, "status": "success", "error": None}

        try:
            videos = self.search_videos(query, max_results=max_videos)
            stats["videos_found"] = len(videos)

            for video in videos:
                comments = self.get_comments(
                    video["video_id"],
                    max_comments=max_comments_per_video
                )
                for c in comments:
                    # Check for duplicates
                    exists = db.query(Comment).filter(
                        Comment.source_id == c["source_id"]
                    ).first()
                    if exists:
                        stats["comments_skipped"] += 1
                        continue

                    comment = Comment(
                        source_id=c["source_id"],
                        text=c["text"],
                        author=c["author"],
                        platform=c["platform"],
                        source_url=c["source_url"],
                        media_entity_id=media_entity_id,
                        created_at=c["created_at"],
                    )
                    db.add(comment)
                    stats["comments_new"] += 1

            db.commit()

        except Exception as e:
            stats["status"] = "error"
            stats["error"] = str(e)

        # Log the collection
        log = CollectionLog(
            source="youtube",
            query=query,
            count_collected=stats["comments_new"],
            status=stats["status"],
            error_message=stats["error"],
        )
        db.add(log)
        db.commit()

        return stats
