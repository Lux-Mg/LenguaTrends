from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import create_tables
from app.routers import trends, sentiment, wordcloud, topics, comments

app = FastAPI(title="LenguaTrends API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

app.include_router(trends.router)
app.include_router(sentiment.router)
app.include_router(wordcloud.router)
app.include_router(topics.router)
app.include_router(comments.router)


@app.on_event("startup")
def on_startup():
    create_tables()


@app.get("/")
def root():
    return {"status": "ok", "version": "1.0.0"}
