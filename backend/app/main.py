from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import create_tables

app = FastAPI(
    title="LenguaTrends API",
    description="API для анализа трендов комментариев на различных языках",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    create_tables()


@app.get("/")
def root():
    return {"message": "LenguaTrends API is running", "version": "0.1.0"}


@app.get("/health")
def health():
    return {"status": "ok"}
