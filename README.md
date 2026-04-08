# LenguaTrends

Программная система анализа трендов комментариев на различных языках.

## Описание

Веб-платформа для автоматизированного сбора и мультиязычного анализа комментариев о фильмах и сериалах с платформы YouTube. Система анализирует комментарии на трёх языках (испанский, английский, русский) с использованием методов искусственного интеллекта.

## Технологии

| Компонент | Технология |
|---|---|
| Серверная часть | Python 3.12, FastAPI, SQLAlchemy |
| NLP-обработка | XLM-RoBERTa, BERTopic, langdetect |
| База данных | PostgreSQL 16 |
| Клиентская часть | React 18, Recharts |
| Сбор данных | YouTube Data API v3, TMDB API |
| Интерфейс | 3 языка (русский, испанский, английский) |

## Требования

– Python 3.11 и выше
– Node.js 18 и выше
– PostgreSQL 16
– API-ключи: YouTube Data API v3, TMDB

## Установка

### 1. Клонирование репозитория

```bash
git clone https://github.com/Lux-Mg/LenguaTrends.git
cd LenguaTrends
```

### 2. Настройка базы данных

```bash
sudo -u postgres psql
CREATE USER lenguatrends WITH PASSWORD 'lenguatrends123';
CREATE DATABASE lenguatrends_db OWNER lenguatrends;
\q
```

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

Для сбора новых данных (трендовые фильмы + комментарии с YouTube):

```bash
cd backend
python -m app.services.orchestrator
```

Процесс включает:
1. Получение трендовых фильмов из TMDB API (с названиями на EN, ES, RU).
2. Поиск и сбор комментариев с YouTube на трёх языках.
3. NLP-обработка: определение языка, анализ тональности, тематическое моделирование.

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
│   │   ├── nlp/                 – NLP-конвейер
│   │   └── services/            – Оркестратор обработки
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.js               – Корневой компонент
│   │   ├── App.css              – Глобальные стили
│   │   ├── components/          – React-компоненты
│   │   ├── i18n/                – Интернационализация (RU, ES, EN)
│   │   └── services/api.js      – HTTP-клиент
│   └── package.json
└── README.md
```

## Эндпоинты API

| Метод | Маршрут | Описание |
|---|---|---|
| GET | /api/trends/ | Трендовые фильмы с количеством упоминаний |
| GET | /api/trends/stats | Общая статистика системы |
| GET | /api/sentiment/by-language | Тональность по языкам |
| GET | /api/sentiment/by-movie | Тональность по фильмам |
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
