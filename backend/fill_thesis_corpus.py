#!/usr/bin/env python3
# Script unico para dejar el corpus de la tesis en buen estado.
# Pasos:
#   1. Añadir 5 peliculas nuevas de 2025 via TMDB (si no estan ya)
#   2. Recolectar YouTube (los 3 idiomas) para las nuevas
#   3. Rellenar cellas debiles (N < 80) en peliculas existentes (idioma por idioma)
#   4. Correr pipeline NLP sobre todo lo nuevo
#   5. Imprimir reporte comparativo antes/despues
#
# Seguro de re-ejecutar: dedup por source_id (comentarios) y tmdb_id (peliculas).

import sys
import time
import requests
from sqlalchemy import func
from app.config import TMDB_API_KEY, YOUTUBE_SEARCH_SUFFIXES
from app.database import SessionLocal
from app.models.comment import MediaEntity, Comment
from app.collectors.youtube import YouTubeCollector
from app.nlp.orchestrator import NLPOrchestrator


NEW_FILMS_TMDB_IDS = [
    696506,    # Mickey 17
    1233413,   # Sinners
    986056,    # Thunderbolts*
    552524,    # Lilo & Stitch
    575265,    # Mission: Impossible - The Final Reckoning
]

TARGET_N_PER_CELL = 80
MAX_VIDEOS = 6
MAX_COMMENTS_PER_VIDEO = 100
TMDB_BASE = "https://api.themoviedb.org/3"


def banner(text):
    print("\n" + "=" * 72)
    print(text)
    print("=" * 72)


def fetch_tmdb_movie(tmdb_id: int) -> dict:
    def _title(lang_code):
        try:
            r = requests.get(
                f"{TMDB_BASE}/movie/{tmdb_id}",
                params={"api_key": TMDB_API_KEY, "language": lang_code},
                timeout=20,
            )
            r.raise_for_status()
            return r.json().get("title", "")
        except Exception as e:
            print(f"  [warn] no se pudo obtener titulo {lang_code} para {tmdb_id}: {e}")
            return ""

    return {
        "tmdb_id": tmdb_id,
        "title": _title("en-US"),
        "title_es": _title("es-ES"),
        "title_ru": _title("ru-RU"),
        "type": "movie",
    }


def snapshot_counts(db) -> dict:
    rows = (
        db.query(MediaEntity.title, Comment.language, func.count(Comment.id))
        .outerjoin(Comment, Comment.media_entity_id == MediaEntity.id)
        .group_by(MediaEntity.title, Comment.language)
        .all()
    )
    counts = {}
    for title, lang, n in rows:
        counts.setdefault(title, {"es": 0, "en": 0, "ru": 0, "other": 0})
        if lang in ("es", "en", "ru"):
            counts[title][lang] = n
        elif lang:
            counts[title]["other"] += n
    return counts


def add_new_films(db) -> list:
    banner("Paso 1: añadir peliculas nuevas desde TMDB")
    added = []
    for tid in NEW_FILMS_TMDB_IDS:
        existing = db.query(MediaEntity).filter(MediaEntity.tmdb_id == tid).first()
        if existing:
            print(f"  [exist]  {existing.title} (tmdb={tid}, id BD={existing.id})")
            added.append(existing)
            continue
        info = fetch_tmdb_movie(tid)
        if not info["title"]:
            print(f"  [skip]   tmdb={tid} sin titulo, saltando")
            continue
        m = MediaEntity(
            tmdb_id=info["tmdb_id"],
            title=info["title"],
            title_es=info["title_es"] or info["title"],
            title_ru=info["title_ru"] or info["title"],
            type="movie",
        )
        db.add(m)
        db.commit()
        db.refresh(m)
        print(f"  [nueva]  {m.title} | ES: {m.title_es} | RU: {m.title_ru}")
        added.append(m)
    return added


def collect_for_new_films(db, new_films, collector):
    banner("Paso 2: recolectar YouTube para peliculas nuevas (3 idiomas)")
    for m in new_films:
        print(f"\n--- {m.title} (tmdb={m.tmdb_id}) ---")
        try:
            collector.collect_multilingual(
                db=db, media_entity=m,
                max_videos=MAX_VIDEOS,
                max_comments_per_video=MAX_COMMENTS_PER_VIDEO,
            )
        except Exception as e:
            print(f"  [error] {e}")
            time.sleep(2)


def collect_weak_cells(db, collector, before_counts: dict, existing_titles: set):
    banner(f"Paso 3: rellenar cellas debiles (N < {TARGET_N_PER_CELL}) en peliculas existentes")
    for movie in db.query(MediaEntity).all():
        if movie.title not in existing_titles:
            continue
        by_lang = before_counts.get(movie.title, {"es": 0, "en": 0, "ru": 0})
        weak_langs = [l for l in ("es", "en", "ru") if by_lang.get(l, 0) < TARGET_N_PER_CELL]
        if not weak_langs:
            print(f"  [ok]     {movie.title} — todas las cellas ≥ {TARGET_N_PER_CELL}")
            continue

        print(f"\n--- {movie.title} (débiles: {weak_langs}) ---")
        titles = {
            "en": movie.title,
            "es": movie.title_es or movie.title,
            "ru": movie.title_ru or movie.title,
        }
        for lang in weak_langs:
            query = f"{titles[lang]} {YOUTUBE_SEARCH_SUFFIXES.get(lang, '')}".strip()
            print(f"  [{lang.upper()}] buscar: \"{query}\"")
            try:
                stats = collector.collect(
                    db=db, query=query, media_entity_id=movie.id,
                    language=lang,
                    max_videos=MAX_VIDEOS,
                    max_comments_per_video=MAX_COMMENTS_PER_VIDEO,
                )
                print(f"  [{lang.upper()}] nuevos: {stats['comments_new']}, "
                      f"duplicados: {stats['comments_skipped']}")
            except Exception as e:
                print(f"  [{lang.upper()}] error: {e}")
                time.sleep(2)


def process_nlp(db):
    banner("Paso 4: procesar NLP (language detect + sentiment + topics)")
    orch = NLPOrchestrator()
    stats = orch.process_new_comments(db)
    if not stats:
        print("  (nada que procesar)")
        return
    print(f"  Total procesados: {stats.get('total', 0)}")
    print(f"  Por idioma: {stats.get('by_language', {})}")
    print(f"  Sentiment: {stats.get('sentiment', {})}")


def report(before: dict, after: dict):
    banner("Reporte final: antes → después")
    all_titles = sorted(set(before.keys()) | set(after.keys()))
    w_title, w_col = 40, 18
    header = f"{'Pelicula':<{w_title}} {'ES':<{w_col}} {'EN':<{w_col}} {'RU':<{w_col}}"
    print(header)
    print("-" * len(header))
    tot_b = {"es": 0, "en": 0, "ru": 0}
    tot_a = {"es": 0, "en": 0, "ru": 0}
    for t in all_titles:
        b = before.get(t, {"es": 0, "en": 0, "ru": 0})
        a = after.get(t, {"es": 0, "en": 0, "ru": 0})
        for lang in ("es", "en", "ru"):
            tot_b[lang] += b.get(lang, 0)
            tot_a[lang] += a.get(lang, 0)
        arrow = lambda l: f"{b.get(l,0):>4} → {a.get(l,0):<4} (+{a.get(l,0)-b.get(l,0)})"
        print(f"{t[:w_title-1]:<{w_title}} {arrow('es'):<{w_col}} {arrow('en'):<{w_col}} {arrow('ru'):<{w_col}}")
    print("-" * len(header))
    arrow = lambda l: f"{tot_b[l]:>4} → {tot_a[l]:<4} (+{tot_a[l]-tot_b[l]})"
    print(f"{'TOTAL':<{w_title}} {arrow('es'):<{w_col}} {arrow('en'):<{w_col}} {arrow('ru'):<{w_col}}")


def main():
    db = SessionLocal()
    try:
        banner("LenguaTrends — llenado de corpus para tesis")
        print(f"Target por cella: N ≥ {TARGET_N_PER_CELL} | Max videos/lang: {MAX_VIDEOS} | "
              f"Max comments/video: {MAX_COMMENTS_PER_VIDEO}")

        before_counts = snapshot_counts(db)
        existing_titles = set(before_counts.keys())

        new_films = add_new_films(db)
        collector = YouTubeCollector()
        collect_for_new_films(db, new_films, collector)
        collect_weak_cells(db, collector, before_counts, existing_titles)
        process_nlp(db)

        after_counts = snapshot_counts(db)
        report(before_counts, after_counts)

        banner("Proceso completo")
    finally:
        db.close()


if __name__ == "__main__":
    main()
