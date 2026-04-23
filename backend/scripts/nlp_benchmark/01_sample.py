#!/usr/bin/env python3
# Genera una muestra estratificada para benchmark de sentiment.
# 150 comentarios por idioma (ES/EN/RU), balanceados por label predicho actual.
# Output: sample.json
#
# Correr desde backend/:  python3 scripts/nlp_benchmark/01_sample.py

import json
import os
import random
import sys
from sqlalchemy import func

sys.path.insert(0, os.getcwd())  # import app/*

from app.database import SessionLocal
from app.models.comment import Comment, SentimentResult

N_PER_LANG = 150
SEED = 42
LANGS = ["es", "en", "ru"]
LABELS = ["positive", "negative", "neutral"]
PER_BUCKET = N_PER_LANG // len(LABELS)  # 50 por idioma x label

OUT_PATH = "scripts/nlp_benchmark/sample.json"


def main():
    random.seed(SEED)
    db = SessionLocal()
    sample = []

    for lang in LANGS:
        print(f"\nIdioma: {lang}")
        for label in LABELS:
            rows = (
                db.query(Comment.id, Comment.text, Comment.language, SentimentResult.label, SentimentResult.score)
                .join(SentimentResult, SentimentResult.comment_id == Comment.id)
                .filter(Comment.language == lang, SentimentResult.label == label)
                .all()
            )
            # filtrar comentarios muy cortos o sin substancia
            rows = [r for r in rows if 20 <= len(r.text) <= 2000]
            if len(rows) < PER_BUCKET:
                print(f"  [warn] {label}: solo {len(rows)} disponibles, tomando todos")
                picked = rows
            else:
                picked = random.sample(rows, PER_BUCKET)
            print(f"  {label}: elegidos {len(picked)} de {len(rows)} disponibles")
            sample.extend(picked)

    random.shuffle(sample)

    out = [
        {
            "id": r.id,
            "text": r.text,
            "language": r.language,
            "current_label": r.label,
            "current_score": float(r.score) if r.score is not None else None,
        }
        for r in sample
    ]

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    by_lang = {l: sum(1 for r in out if r["language"] == l) for l in LANGS}
    print(f"\nTotal: {len(out)} comentarios guardados en {OUT_PATH}")
    print(f"Por idioma: {by_lang}")

    db.close()


if __name__ == "__main__":
    main()
