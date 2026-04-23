#!/usr/bin/env python3
# Evalua los 3 modelos sobre datasets multilingues externos con ground truth publico.
# ES/EN: mteb/tweet_sentiment_multilingual (mirror parquet del cardiffnlp original)
#        labels: 0=negative, 1=neutral, 2=positive
# RU:    MonoHime/ru_sentiment_dataset (reseñas rusas, ~3000 muestras)
#        labels VERIFICADOS MANUALMENTE: 0=positive, 1=neutral, 2=negative
#
# Output: external_results.json
# Correr desde backend/:  python3 scripts/nlp_benchmark/05_external_dataset.py

import json
import os
import sys
import time
from collections import defaultdict

try:
    from datasets import load_dataset
except ImportError:
    print("Falta datasets:  pip install datasets")
    sys.exit(1)

try:
    from sklearn.metrics import accuracy_score, f1_score
except ImportError:
    print("Falta scikit-learn:  pip install scikit-learn")
    sys.exit(1)

from transformers import pipeline

OUT_PATH = "scripts/nlp_benchmark/external_results.json"
SAMPLES_PER_LANG = 200

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


def load_mteb_sentiment(lang_key, lang_iso):
    # mteb/tweet_sentiment_multilingual — mirror parquet, labels string '0'/'1'/'2'
    # Mapeo oficial cardiffnlp: 0=negative, 1=neutral, 2=positive
    MAP = {"0": "negative", "1": "neutral", "2": "positive"}
    print(f"  Cargando mteb/tweet_sentiment_multilingual [{lang_key}]...")
    ds = load_dataset("mteb/tweet_sentiment_multilingual", lang_key, split="test")
    # Balancear por clase
    by_label = defaultdict(list)
    for row in ds:
        by_label[row["label"]].append(row["text"])
    per_class = SAMPLES_PER_LANG // 3
    texts, labels = [], []
    for k, items in by_label.items():
        picked = items[:per_class]
        texts.extend(picked)
        labels.extend([MAP[k]] * len(picked))
    print(f"    {len(texts)} samples balanceados (por clase: {per_class})")
    return texts, labels


def load_russian_sentiment():
    # MonoHime/ru_sentiment_dataset - labels verificados manualmente:
    # 0=positive (reseñas "lo mejor del hotel..."), 1=neutral, 2=negative (quejas)
    MAP = {0: "positive", 1: "neutral", 2: "negative"}
    print(f"  Cargando MonoHime/ru_sentiment_dataset...")
    ds = load_dataset("MonoHime/ru_sentiment_dataset", split="train")
    by_label = defaultdict(list)
    for i, row in enumerate(ds):
        if i > 3000:
            break
        by_label[row["sentiment"]].append(row["text"])
    per_class = SAMPLES_PER_LANG // 3
    texts, labels = [], []
    for k, items in by_label.items():
        picked = items[:per_class]
        texts.extend(picked)
        labels.extend([MAP[k]] * len(picked))
    print(f"    {len(texts)} samples balanceados (mapeo: {MAP})")
    return texts, labels


def main():
    print("Cargando datasets externos...")
    datasets_all = {}

    for lang_key, lang_iso in [("spanish", "es"), ("english", "en")]:
        try:
            texts, labels = load_mteb_sentiment(lang_key, lang_iso)
            datasets_all[lang_iso] = {"texts": texts, "labels": labels, "source": f"mteb/tweet_sentiment_multilingual [{lang_key}]"}
        except Exception as e:
            print(f"  [error {lang_iso}] {e}")

    try:
        texts, labels = load_russian_sentiment()
        datasets_all["ru"] = {"texts": texts, "labels": labels, "source": "MonoHime/ru_sentiment_dataset"}
    except Exception as e:
        print(f"  [error ru] {e}")

    if not datasets_all:
        print("\nERROR: no se cargaron datasets. Abortando.")
        sys.exit(1)

    results = {}

    for key, model_name in MODELS.items():
        print(f"\n{'='*72}\n{key}: {model_name}\n{'='*72}")
        try:
            pipe = pipeline(
                "sentiment-analysis", model=model_name,
                top_k=1, truncation=True, max_length=512,
            )
        except Exception as e:
            print(f"  [error cargando modelo] {e}")
            results[key] = {"error": str(e)}
            continue

        results[key] = {}
        for lang, dataset in datasets_all.items():
            texts = dataset["texts"]
            gt = dataset["labels"]

            start = time.time()
            try:
                predictions = pipe(texts, batch_size=8)
            except Exception as e:
                print(f"  [{lang}] error prediccion: {e}")
                results[key][lang] = {"error": str(e)}
                continue
            elapsed = time.time() - start

            pred_labels = []
            for res in predictions:
                top = res[0] if isinstance(res[0], dict) else res[0][0]
                pred_labels.append(normalize(top["label"]))

            acc = accuracy_score(gt, pred_labels)
            f1 = f1_score(gt, pred_labels, labels=["positive", "neutral", "negative"], average="macro", zero_division=0)
            results[key][lang] = {
                "n": len(texts),
                "accuracy": round(acc, 4),
                "f1_macro": round(f1, 4),
                "latency_ms_per_comment": round(elapsed / len(texts) * 1000, 1),
                "source": dataset["source"],
            }
            print(f"  [{lang.upper()}] n={len(texts)}  acc={acc:.3f}  f1={f1:.3f}  lat={results[key][lang]['latency_ms_per_comment']}ms")

    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f"\nGuardado en {OUT_PATH}")

    # Resumen
    print(f"\n{'=' * 72}\nResumen (accuracy)\n{'=' * 72}")
    print(f"{'Modelo':<25} | ES      | EN      | RU")
    print("-" * 65)
    for m in MODELS:
        if m not in results:
            continue
        row = [m]
        for lang in ["es", "en", "ru"]:
            if lang in results[m] and "accuracy" in results[m][lang]:
                row.append(f"{results[m][lang]['accuracy']:.3f}")
            else:
                row.append("---")
        print(f"{row[0]:<25} | {row[1]:<7} | {row[2]:<7} | {row[3]}")


if __name__ == "__main__":
    main()
