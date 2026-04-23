#!/usr/bin/env python3
# Calcula metricas comparativas y genera la tabla final para la VKR.
# Usa labels.json (ground truth) + predictions.json.
#
# Correr desde backend/:  python3 scripts/nlp_benchmark/04_analyze.py
# Requiere: pip install scikit-learn

import json
import os
import sys
from collections import Counter, defaultdict

PRED_PATH = "scripts/nlp_benchmark/predictions.json"
LABELS_PATH = "scripts/nlp_benchmark/labels.json"
OUT_PATH = "scripts/nlp_benchmark/report.md"

try:
    from sklearn.metrics import accuracy_score, f1_score, cohen_kappa_score, classification_report
except ImportError:
    print("Falta scikit-learn:  pip install scikit-learn")
    sys.exit(1)

LABELS_ORDER = ["positive", "neutral", "negative"]
LANGS = ["es", "en", "ru"]


def section(f, title):
    print(f"\n{'=' * 72}\n{title}\n{'=' * 72}")
    f.write(f"\n## {title}\n\n")


def main():
    if not os.path.exists(PRED_PATH):
        print(f"No existe {PRED_PATH}. Correr antes 03_run_models.py")
        sys.exit(1)
    if not os.path.exists(LABELS_PATH):
        print(f"No existe {LABELS_PATH}. Correr antes 02_label.py (etiquetar muestra)")
        sys.exit(1)

    with open(PRED_PATH, encoding="utf-8") as f:
        data = json.load(f)
    with open(LABELS_PATH, encoding="utf-8") as f:
        gt = json.load(f)

    predictions = data["predictions"]
    latencies = data["latencies"]
    models = [k for k in data["models"].keys() if "error" not in latencies.get(k, {})]
    all_ids = list(predictions.keys())

    # Evaluar solo comentarios con etiqueta manual
    ids_gt = [cid for cid in all_ids if cid in gt]

    f = open(OUT_PATH, "w", encoding="utf-8")
    f.write("# Benchmark NLP — Sentiment (LenguaTrends)\n\n")
    f.write(f"- Muestra total: {len(all_ids)} comentarios\n")
    f.write(f"- Etiquetas manuales (ground truth): {len(gt)}\n")
    f.write(f"- Evaluados con GT: {len(ids_gt)}\n\n")
    print(f"Muestra: {len(all_ids)} | GT: {len(gt)} | Evaluados: {len(ids_gt)}")

    # ---- Tabla principal: accuracy + f1 + latencia ----
    section(f, "Tabla principal: accuracy, F1-macro, latencia")
    header = f"| {'Modelo':<25} | Accuracy | F1-macro | Latencia (ms/c) |"
    sep = "|" + "-" * 27 + "|" + "-" * 10 + "|" + "-" * 10 + "|" + "-" * 18 + "|"
    print(header)
    print(sep)
    f.write(header + "\n")
    f.write(sep + "\n")

    summary = {}
    for m in models:
        y_true = [gt[cid] for cid in ids_gt]
        y_pred = [predictions[cid][m]["label"] for cid in ids_gt]
        acc = accuracy_score(y_true, y_pred)
        f1 = f1_score(y_true, y_pred, labels=LABELS_ORDER, average="macro", zero_division=0)
        lat = latencies[m]["per_comment_ms"]
        summary[m] = {"acc": acc, "f1": f1, "lat": lat}
        line = f"| {m:<25} | {acc:.3f}    | {f1:.3f}    | {lat:.1f}            |"
        print(line)
        f.write(line + "\n")

    # ---- Por idioma ----
    section(f, "Accuracy por idioma")
    header = f"| {'Modelo':<25} | {'ES':<7} | {'EN':<7} | {'RU':<7} |"
    sep = "|" + "-" * 27 + "|" + "-" * 9 + "|" + "-" * 9 + "|" + "-" * 9 + "|"
    print(header)
    print(sep)
    f.write(header + "\n")
    f.write(sep + "\n")
    for m in models:
        cells = [m]
        for lang in LANGS:
            ids_lang = [cid for cid in ids_gt if predictions[cid]["language"] == lang]
            if not ids_lang:
                cells.append("-")
                continue
            y_true = [gt[cid] for cid in ids_lang]
            y_pred = [predictions[cid][m]["label"] for cid in ids_lang]
            acc = accuracy_score(y_true, y_pred)
            cells.append(f"{acc:.3f} (n={len(ids_lang)})")
        line = f"| {cells[0]:<25} | {cells[1]:<15} | {cells[2]:<15} | {cells[3]:<15} |"
        print(line)
        f.write(line + "\n")

    # ---- Cohen kappa inter-modelo (usa TODOS los ids, no solo GT) ----
    section(f, "Cohen kappa inter-modelo (acuerdo entre predicciones)")
    for i, m1 in enumerate(models):
        for m2 in models[i + 1:]:
            y1 = [predictions[cid][m1]["label"] for cid in all_ids]
            y2 = [predictions[cid][m2]["label"] for cid in all_ids]
            k = cohen_kappa_score(y1, y2)
            line = f"- {m1} vs {m2}: κ = {k:.3f}"
            print(line)
            f.write(line + "\n")

    # ---- Distribución de labels predichos ----
    section(f, "Distribución de labels predichos (sobre muestra completa)")
    header = f"| {'Modelo':<25} | positive | negative | neutral  |"
    sep = "|" + "-" * 27 + "|" + "-" * 10 + "|" + "-" * 10 + "|" + "-" * 10 + "|"
    print(header)
    print(sep)
    f.write(header + "\n")
    f.write(sep + "\n")
    for m in models:
        dist = Counter(predictions[cid][m]["label"] for cid in all_ids)
        total = sum(dist.values())
        line = f"| {m:<25} | {dist.get('positive',0):>4} ({dist.get('positive',0)/total*100:>4.1f}%) | {dist.get('negative',0):>4} ({dist.get('negative',0)/total*100:>4.1f}%) | {dist.get('neutral',0):>4} ({dist.get('neutral',0)/total*100:>4.1f}%) |"
        print(line)
        f.write(line + "\n")

    # ---- Conclusion ----
    section(f, "Ganador")
    best_f1 = max(summary, key=lambda m: summary[m]["f1"])
    fastest = min(summary, key=lambda m: summary[m]["lat"])
    conclusion = (
        f"- Mejor F1-macro: **{best_f1}** ({summary[best_f1]['f1']:.3f}) "
        f"con acc {summary[best_f1]['acc']:.3f} y latencia {summary[best_f1]['lat']}ms/c\n"
        f"- Más rápido: **{fastest}** ({summary[fastest]['lat']}ms/c)\n"
    )
    print(conclusion)
    f.write(conclusion)

    f.close()
    print(f"\nReporte escrito en {OUT_PATH}")


if __name__ == "__main__":
    main()
