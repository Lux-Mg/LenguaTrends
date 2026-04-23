#!/usr/bin/env python3
# Herramienta interactiva para etiquetar manualmente la muestra.
# Presenta cada comentario, pide label (1/2/3/s/q).
# Comentarios en ruso se traducen automaticamente a español (cacheado).
# Guarda progreso en labels.json - se puede reanudar.
#
# Correr desde backend/:  python3 scripts/nlp_benchmark/02_label.py

import json
import os
import sys

SAMPLE_PATH = "scripts/nlp_benchmark/sample.json"
LABELS_PATH = "scripts/nlp_benchmark/labels.json"
TRANS_CACHE = "scripts/nlp_benchmark/translations_ru_es.json"

MAP = {"1": "positive", "2": "neutral", "3": "negative"}
LANG_NAME = {"es": "Español", "en": "Inglés", "ru": "Ruso"}

# Traductor (lazy init)
_translator = None
_cache = None


def get_translator():
    global _translator
    if _translator is None:
        try:
            from deep_translator import GoogleTranslator
            _translator = GoogleTranslator(source="ru", target="es")
        except ImportError:
            print("[warn] deep_translator no instalado. Traducciones deshabilitadas.")
            _translator = False
    return _translator


def load_cache():
    global _cache
    if _cache is None:
        if os.path.exists(TRANS_CACHE):
            with open(TRANS_CACHE, encoding="utf-8") as f:
                _cache = json.load(f)
        else:
            _cache = {}
    return _cache


def save_cache():
    if _cache is not None:
        with open(TRANS_CACHE, "w", encoding="utf-8") as f:
            json.dump(_cache, f, ensure_ascii=False, indent=2)


def translate_ru(text, comment_id):
    cache = load_cache()
    key = str(comment_id)
    if key in cache:
        return cache[key]
    tr = get_translator()
    if not tr:
        return None
    try:
        result = tr.translate(text[:4500])  # limite del endpoint
        cache[key] = result
        save_cache()
        return result
    except Exception as e:
        return f"[traducción falló: {e}]"


def main():
    if not os.path.exists(SAMPLE_PATH):
        print(f"No existe {SAMPLE_PATH}. Correr antes 01_sample.py")
        sys.exit(1)

    with open(SAMPLE_PATH, encoding="utf-8") as f:
        sample = json.load(f)

    labels = {}
    if os.path.exists(LABELS_PATH):
        with open(LABELS_PATH, encoding="utf-8") as f:
            labels = json.load(f)
        print(f"Reanudando... {len(labels)}/{len(sample)} etiquetas ya guardadas")

    total = len(sample)
    done_this_session = 0

    for i, r in enumerate(sample):
        key = str(r["id"])
        if key in labels:
            continue

        pending = total - len(labels)
        print(f"\n{'=' * 70}")
        print(f"[{i+1}/{total}]  id={r['id']}  {LANG_NAME.get(r['language'], r['language'])}")
        print(f"Actual (modelo): {r['current_label']} (score={r['current_score']})")
        print(f"{'=' * 70}")
        print(r["text"][:800])
        if len(r["text"]) > 800:
            print(f"... [+{len(r['text']) - 800} caracteres]")

        # Traduccion inline para ruso
        if r["language"] == "ru":
            print()
            print("[ES → traducción automática]")
            translated = translate_ru(r["text"][:1500], r["id"])
            if translated:
                print(translated[:800])
                if translated and len(translated) > 800:
                    print(f"... [+{len(translated) - 800} caracteres]")
            else:
                print("(traducción no disponible)")

        print()
        print("  (1) positivo  (2) neutro  (3) negativo  (s) saltar  (q) salir")
        print(f"  Progreso sesión: {done_this_session} | Pendientes: {pending}")

        while True:
            c = input("> ").strip().lower()
            if c in ("1", "2", "3", "s", "q"):
                break
            print("Opción inválida. Usa 1/2/3/s/q")

        if c == "q":
            print(f"\nSaliendo. Etiquetado en esta sesión: {done_this_session}")
            break
        if c == "s":
            continue

        labels[key] = MAP[c]
        done_this_session += 1
        with open(LABELS_PATH, "w", encoding="utf-8") as f:
            json.dump(labels, f, ensure_ascii=False, indent=2)

    print(f"\nTotal etiquetas en archivo: {len(labels)}/{total}")
    by_lang = {}
    for r in sample:
        if str(r["id"]) in labels:
            by_lang[r["language"]] = by_lang.get(r["language"], 0) + 1
    print(f"Por idioma etiquetados: {by_lang}")


if __name__ == "__main__":
    main()
