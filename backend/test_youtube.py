"""
Test script for YouTube Data Collector.
Searches for movie-related videos and collects comments.
"""
import sys
sys.path.insert(0, ".")

from app.collectors.youtube import YouTubeCollector

print("=" * 60)
print("  LenguaTrends — YouTube Collector Test")
print("=" * 60)

collector = YouTubeCollector()

# Test 1: Search for videos
query = "Dune Part Two"
print(f"\n--- Searching YouTube for: '{query}' ---")
videos = collector.search_videos(query, max_results=3)

for i, v in enumerate(videos, 1):
    print(f"  {i}. [{v['video_id']}] {v['title']}")

# Test 2: Get comments from first video
if videos:
    video = videos[0]
    print(f"\n--- Getting comments from: {video['title'][:50]}... ---")
    comments = collector.get_comments(video["video_id"], max_comments=10)

    print(f"  Found {len(comments)} comments:\n")
    for c in comments:
        text_preview = c["text"][:80].replace("\n", " ")
        print(f"  [{c['author'][:15]:15s}] {text_preview}...")

print("\n" + "=" * 60)
print("  YouTube Collector Test Complete!")
print("=" * 60)
