#!/usr/bin/env python3
# Corre los 3 modelos sobre la muestra y guarda predicciones + latencias.
# Output: predictions.json
#
# Correr desde backend/:  python3 scripts/nlp_benchmark/03_run_models.py

import json
import os
import sys
import time

# Setup path para importar transformers desde el entorno del backend
sys.path.insert(0, os.getcwd())

from transformers import pipeline

SAMPLE_PATH = "scripts/nlp_benchmark/sample.json"
OUT_PATH = "scripts/nlp_benchmark/predictions.json"

MODELS = {
    "m1_cardiff_xlmr": "cardiffnlp/twitter-xlm-roberta-base-sentiment-multilingual",
    "m2_distilbert_student": "lxyuan/distilbert-base-multilingual-cased-sentiments-student",
    "m3_tabularisai": "tabularisai/multilingual-sentiment-analysis",
}

LABEL_MAP = {
    "positive": "positive", "Positive": "positive", "POS": "positive", "POSITIVE": "positive",
    "negative": "negative", "Negative": "negative", "NEG": "negative", "NEGATIVE": "negative",
    "neutral": "neutral", "Neutral": "neutral", "NEU": "neutral", "NEUTRAL": "neutral",
    "very positive": "positive", "Very Positive": "positive",
    "very negative": "negative", "Very Negative": "negative",
}


def normalize(label):
    return LABEL_MAP.get(label, label.lower())


def main():
    if not os.path.exists(SAMPLE_PATH):
        print(f"No existe {SAMPLE_PATH}. Correr antes 01_sample.py")
        sys.exit(1)

    with open(SAMPLE_PATH, encoding="utf-8") as f:
        sample = json.load(f)

    predictions = {
        str(r["id"]): {
            "text": r["text"],
            "language": r["language"],
            "current_label": r["current_label"],
        }
        for r in sample
    }
    latencies = {}

    for key, model_name in MODELS.items():
        print(f"\n{'='*72}\n{key}: {model_name}\n{'='*72}")

        try:
            pipe = pipeline(
                "sentiment-analysis",
                model=model_name,
                top_k=1,
                truncation=True,
                max_length=512,
            )
        except Exception as e:
            print(f"  [error cargando] {e}")
            latencies[key] = {"error": str(e)}
            continue

        texts = [r["text"] for r in sample]
        start = time.time()
        try:
            results = pipe(texts, batch_size=8)
        except Exception as e:
            print(f"  [error prediccion] {e}")
            latencies[key] = {"error": str(e)}
            continue
        elapsed = time.time() - start

        latencies[key] = {
            "model": model_name,
            "total_s": round(elapsed, 2),
            "per_comment_ms": round(elapsed / len(sample) * 1000, 1),
        }

        for r, res in zip(sample, results):
            top = res[0] if isinstance(res[0], dict) else res[0][0]
            label = normalize(top["label"])
            predictions[str(r["id"])][key] = {
                "label": label,
                "raw_label": top["label"],
                "score": round(top["score"], 4),
            }

        print(f"  tiempo total: {latencies[key]['total_s']}s")
        print(f"  por comentario: {latencies[key]['per_comment_ms']}ms")

    output = {"predictions": predictions, "latencies": latencies, "models": MODELS}
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\nGuardado en {OUT_PATH}")
    print(f"Modelos procesados: {sum(1 for k in MODELS if 'error' not in latencies.get(k, {}))}/{len(MODELS)}")


if __name__ == "__main__":
    main()
