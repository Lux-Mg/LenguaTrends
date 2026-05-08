# Архитектура программной системы LenguaTrends

Программная система анализа трендов комментариев на различных языках.

## Общая схема

```
┌──────────────────┐    ┌──────────────────────┐    ┌─────────────────┐
│   Внешние API    │    │   Серверная часть    │    │  Клиентская     │
│                  │    │                      │    │  часть          │
│  TMDB API        │───▶│  FastAPI (Python)    │───▶│  React 18       │
│  YouTube Data    │    │  + SQLAlchemy        │    │  + Recharts     │
│  API v3          │    │  + NLP-конвейер      │    │  + i18n         │
└──────────────────┘    └──────────┬───────────┘    └─────────────────┘
                                   │                      ▲
                                   ▼                      │
                            ┌─────────────┐         REST API (JSON)
                            │ PostgreSQL  │
                            │             │
                            └─────────────┘
```

## Слои системы

### 1. Слой сбора данных (`backend/app/collectors/`)

Отвечает за получение исходных данных из внешних источников.

- **`tmdb.py`** – интеграция с TMDB API. Получает трендовые кинопроизведения с локализованными названиями на трёх языках (en-US, es-ES, ru-RU). Класс `TMDBCollector`.
- **`youtube.py`** – интеграция с YouTube Data API v3. Выполняет мультиязычный поиск видеообзоров и сбор комментариев. Класс `YouTubeCollector` с двумя ключевыми методами: `collect()` (один запрос) и `collect_multilingual()` (полный цикл по трём языкам для одного фильма).

Обеспечена дедупликация: каждый комментарий имеет уникальный `source_id` вида `yt_<youtube_comment_id>`, повторный запуск сбора не создаёт дубликатов.

### 2. Слой обработки естественного языка (`backend/app/nlp/`)

NLP-конвейер реализован модульно для возможности замены отдельных компонентов.

- **`language.py`** – определение языка комментария. Использует библиотеку `langdetect` (вероятностный классификатор на основе n-грамм). Класс `LanguageDetector`.
- **`preprocessor.py`** – предобработка текста: удаление URL, упоминаний, HTML-тегов, эмодзи. Класс `TextPreprocessor`.
- **`sentiment.py`** – анализ тональности. Использует модель `cardiffnlp/twitter-xlm-roberta-base-sentiment-multilingual` (XLM-RoBERTa, 278 млн параметров). Класс `SentimentAnalyzer`. Выходные данные: метка (positive/negative/neutral) + уровень уверенности модели.
- **`topics.py`** – тематическое моделирование. Использует библиотеку `BERTopic` с многоязычными эмбеддингами `paraphrase-multilingual-MiniLM-L12-v2`. Класс `TopicModeler`.
- **`orchestrator.py`** – оркестратор полного цикла обработки. Класс `NLPOrchestrator` объединяет все четыре модуля и обрабатывает порциями партии новых комментариев из БД.

### 3. Слой данных (`backend/app/models/`, `backend/app/database.py`)

Реляционная модель данных в PostgreSQL.

Основные таблицы:
- **`media_entities`** – кинопроизведения с локализованными названиями (`title`, `title_es`, `title_ru`, `tmdb_id`).
- **`comments`** – комментарии (`text`, `language`, `media_entity_id`, `processed`, `source_id`, `platform`).
- **`sentiment_results`** – результаты анализа тональности (`comment_id`, `label`, `score`, `model_version`).
- **`topic_results`** – результаты тематического моделирования (`comment_id`, `topic_id`, `topic_label`, `probability`).
- **`collection_logs`** – журнал операций сбора данных.

Связь между сущностями реализована через ORM SQLAlchemy.

### 4. Слой REST API (`backend/app/routers/`)

Эндпоинты сгруппированы по тематикам в отдельные роутеры.

| Роутер | Префикс | Назначение |
|---|---|---|
| `trends.py` | `/api/trends` | Рейтинг кинопроизведений по числу упоминаний |
| `sentiment.py` | `/api/sentiment` | Анализ тональности (по языкам, по фильмам, межъязыковая дивергенция) |
| `wordcloud.py` | `/api/wordcloud` | Частотный анализ лексики |
| `topics.py` | `/api/topics` | Тематические кластеры |
| `comments.py` | `/api/comments` | Сырые комментарии с фильтрацией и пагинацией |

Все эндпоинты валидируют входные параметры (`Query` с ограничениями `ge`/`le` и проверками поддерживаемых значений). Документация автоматически генерируется в Swagger UI: `http://localhost:8000/docs`.

### 5. Клиентская часть (`frontend/src/`)

Single Page Application на React 18.

- **`App.js`** – корневой компонент с навигацией по семи вкладкам.
- **`components/`** – React-компоненты для каждой вкладки и общих элементов.
- **`i18n/`** – поддержка трёх языков интерфейса (RU, ES, EN), словарь из ~85 ключей перевода.
- **`services/api.js`** – HTTP-клиент на основе `axios` для работы с REST API.

Графики и визуализации построены на библиотеке `Recharts`.

## Поток обработки данных

```
TMDB API ──▶ MediaEntity (создание записи фильма с локализованными названиями)
                  │
                  ▼
YouTube API ──▶ Comment (raw text + language placeholder + processed=False)
                  │
                  ▼
NLPOrchestrator.process_new_comments() ──▶
    │
    ├──▶ LanguageDetector ──▶ Comment.language
    ├──▶ TextPreprocessor ──▶ очищенный текст для модели
    ├──▶ SentimentAnalyzer ──▶ SentimentResult (label, score)
    └──▶ TopicModeler ──▶ TopicResult (для языков с ≥50 комментариями)
                  │
                  ▼
            Comment.processed = True
                  │
                  ▼
            REST API ──▶ React-клиент (визуализация)
```

## Технологический стек

| Компонент | Технология |
|---|---|
| Серверная часть | Python 3.12, FastAPI, SQLAlchemy 2.0 |
| База данных | PostgreSQL 16 |
| ML-модели | HuggingFace Transformers, BERTopic, langdetect |
| Клиентская часть | React 18, Recharts, axios |
| Шрифт | DM Sans (Google Fonts) |
| Окружение | WSL2, Visual Studio Code |
| Контроль версий | Git, GitHub |
