# LenguaTrends

LenguaTrends is an academic multilingual NLP platform for collecting and analysing YouTube comments about films. It was developed as my 2026 Software Engineering undergraduate thesis at Siberian Federal University and combines a FastAPI/PostgreSQL backend, an XLM-RoBERTa sentiment pipeline, BERTopic topic modelling, and a React dashboard.

## Portfolio overview

### Highlights

- Frozen research corpus: **19,155 comments** about **16 films**, collected in English, Spanish, and Russian (snapshot dated 23 April 2026).
- End-to-end data flow from YouTube/TMDB collection through language detection, sentiment analysis, topic modelling, relational storage, REST endpoints, and dashboard visualisation.
- Three pretrained multilingual sentiment models compared on a manually labelled, stratified sample; the repository includes the 399 manual labels and the scripts used to sample, run, and analyse the models.
- External evaluation artifacts cover 198 examples per language. The tracked results show that the selected Cardiff XLM-RoBERTa model performed better on Spanish and English than on the Russian external dataset, making the language-specific limitation explicit.
- The dashboard and API support language/movie filters, sentiment summaries, topic views, cross-language comparisons, word frequencies, and time-series analysis.

### Architecture and stack

```text
YouTube Data API + TMDB API
            │
            ▼
 collectors and deduplication
            │
            ▼
 language detection → XLM-RoBERTa sentiment → BERTopic topics
            │
            ▼
 PostgreSQL + SQLAlchemy → FastAPI REST API → React dashboard
```

| Layer | Implementation |
|---|---|
| Collection | YouTube Data API v3, TMDB API, Python scripts |
| NLP | `langdetect`, Cardiff multilingual XLM-RoBERTa, BERTopic |
| Backend/data | Python 3.12, FastAPI, SQLAlchemy, PostgreSQL 16 |
| Frontend | React 19, Recharts, three-language interface |

### Results and evaluation

The sentiment benchmark uses accuracy, macro-F1, per-language breakdowns, and per-comment latency. The project changelog records an internal macro-F1 of 0.613 for the selected Cardiff model on the manually labelled sample, compared with 0.369 and 0.505 for the two alternatives. The manual labels are tracked, but the generated internal prediction file and report are not, so that exact internal table cannot be reproduced from this repository alone.

The external result artifact is tracked in [`backend/scripts/nlp_benchmark/external_results.json`](backend/scripts/nlp_benchmark/external_results.json). For the selected model it records accuracy of 0.6414 (ES), 0.6869 (EN), and 0.3838 (RU), with 198 balanced examples per language. These datasets differ from the YouTube corpus, so the figures are validation evidence rather than product-level accuracy claims.

The frozen database itself is not included in Git. A fresh installation starts with an empty schema; collecting a new corpus requires your own YouTube and TMDB API keys. This keeps credentials and the research dataset out of the repository, but means the original dashboard figures are not recreated by cloning alone.

## Документация проекта

Программная система анализа трендов комментариев на различных языках.

## Описание

Веб-платформа для автоматизированного сбора и мультиязычного анализа комментариев о кинопроизведениях с платформы YouTube. Система анализирует комментарии на трёх языках (испанский, английский, русский) с использованием методов искусственного интеллекта.

## Основные функции

- **Главная** – сводная статистика по корпусу, топ обсуждаемых фильмов, распределение комментариев по языкам.
- **Тренды** – рейтинг фильмов по количеству упоминаний с фильтрацией по языку и периоду.
- **Тональность** – распределение тональности комментариев по языкам и по фильмам.
- **Межъязыковые различия** – сопоставительный анализ восприятия одних и тех же фильмов зрителями разных языковых аудиторий (относительный фаворит каждого языка, самые спорные фильмы, межъязыковой консенсус).
- **Облако слов** – частотный анализ лексики с фильтрацией по языку и фильму, цветовая индикация по тональности.
- **Динамика** – временной ряд упоминаний по неделям в разрезе языков.
- **Комментарии** – просмотр сырых данных с пагинацией и многокритериальной фильтрацией.

## Технологии

| Компонент | Технология |
|---|---|
| Серверная часть | Python 3.12, FastAPI, SQLAlchemy |
| NLP-обработка | XLM-RoBERTa, BERTopic, langdetect |
| База данных | PostgreSQL 16 |
| Клиентская часть | React 19, Recharts |
| Сбор данных | YouTube Data API v3, TMDB API |
| Интерфейс | 3 языка (русский, испанский, английский) |

## Требования

- Python 3.11 или выше (проект разрабатывался на Python 3.12)
- Node.js 18 или выше
- PostgreSQL 16
- API-ключи YouTube Data API v3 и TMDB — только для сбора новых данных

## Установка

### 1. Клонирование репозитория

```bash
git clone https://github.com/Lux-Mg/LenguaTrends.git
cd LenguaTrends
```

### 2. Настройка базы данных

```bash
sudo -u postgres psql
CREATE USER lenguatrends WITH PASSWORD 'your_password';
CREATE DATABASE lenguatrends_db OWNER lenguatrends;
\q
```

Замените `your_password` на выбранный пароль и передайте строку подключения через переменную окружения. Не сохраняйте реальные пароли в репозитории:

```bash
export DATABASE_URL='postgresql://lenguatrends:your_password@localhost:5432/lenguatrends_db'
```

Для сбора новых данных также нужны переменные `YOUTUBE_API_KEY` и `TMDB_API_KEY`.

### 3. Установка зависимостей серверной части

```bash
cd backend
pip install -r requirements.txt
```

### 4. Установка зависимостей клиентской части

```bash
cd frontend
npm install
```

## Запуск

Для работы системы необходимо запустить два процесса одновременно.

### Терминал 1 – Серверная часть (API)

```bash
cd LenguaTrends/backend
uvicorn app.main:app --reload --port 8000
```

Серверная часть доступна по адресу: http://localhost:8000

Документация API: http://localhost:8000/docs

### Терминал 2 – Клиентская часть (React)

```bash
cd LenguaTrends/frontend
npm start
```

Клиентская часть доступна по адресу: http://localhost:3000

## Сбор данных

Сбор данных выполняется с помощью скриптов в директории `backend/`:

- `test_trending_pipeline.py` – получение трендовых фильмов из TMDB и полный цикл обработки комментариев.
- `fill_thesis_corpus.py` – расширение существующего корпуса новыми фильмами и пополнение слабых языковых сегментов существующих записей.

Пример запуска:

```bash
cd backend
python fill_thesis_corpus.py
```

Процесс включает:
1. Получение фильмов из TMDB API (с названиями на EN, ES, RU).
2. Поиск и сбор комментариев с YouTube на трёх языках.
3. NLP-обработка: определение языка, анализ тональности, тематическое моделирование.

Исходный замороженный корпус не опубликован в репозитории. Без собственной заполненной базы интерфейс и API запускаются, но статистические разделы не содержат исходных данных ВКР.

## Структура проекта

```
LenguaTrends/
├── backend/
│   ├── app/
│   │   ├── main.py              – Приложение FastAPI
│   │   ├── config.py            – Конфигурация и API-ключи
│   │   ├── database.py          – Подключение к PostgreSQL
│   │   ├── models/              – ORM-модели (SQLAlchemy)
│   │   ├── routers/             – Эндпоинты API
│   │   ├── collectors/          – Коллекторы (YouTube, TMDB)
│   │   └── nlp/                 – NLP-конвейер (язык, тональность, темы, оркестратор)
│   ├── fill_thesis_corpus.py    – Скрипт расширения корпуса для ВКР
│   ├── requirements.txt          – Зависимости Python
│   ├── scripts/
│   │   └── nlp_benchmark/       – Сравнительное тестирование NLP-моделей
├── frontend/
│   ├── src/
│   │   ├── App.js               – Корневой компонент
│   │   ├── App.css              – Глобальные стили
│   │   ├── components/          – React-компоненты
│   │   ├── i18n/                – Интернационализация (RU, ES, EN)
│   │   └── services/api.js      – HTTP-клиент
│   └── package.json
├── CHANGELOG.md                 – Журнал изменений (преддипломная практика)
└── README.md
```

## Эндпоинты API

| Метод | Маршрут | Описание |
|---|---|---|
| GET | /api/trends/ | Трендовые фильмы с количеством упоминаний |
| GET | /api/trends/stats | Общая статистика системы |
| GET | /api/sentiment/by-language | Тональность по языкам |
| GET | /api/sentiment/by-movie | Тональность по фильмам |
| GET | /api/sentiment/language-divergence | Межъязыковые различия в оценках фильмов |
| GET | /api/wordcloud/ | Частотные данные для облака слов |
| GET | /api/topics/ | Результаты тематического моделирования |
| GET | /api/comments/ | Комментарии с пагинацией и фильтрами |

## Используемые модели ИИ

| Модель | Задача | Описание |
|---|---|---|
| langdetect | Определение языка | Вероятностный классификатор на основе n-грамм |
| XLM-RoBERTa | Анализ тональности | Мультиязычная трансформерная модель (278 млн параметров) |
| BERTopic | Тематическое моделирование | BERT-эмбеддинги + UMAP + HDBSCAN |

## Автор

Мендоса Гоикочеа Луис Хеисон – Сибирский федеральный университет (СФУ), 2026
