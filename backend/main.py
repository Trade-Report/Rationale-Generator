from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Existing routes
from routes.gemini_routes import router as gemini_router

# ✅ New routes
from routes.admin_auth import router as admin_auth_router
from routes.admin_clients import router as admin_clients_router
from routes.usage_routes import router as usage_router
from routes.sheet_routes import router as sheet_router
from routes.client_auth import router as client_auth_router

# ✅ DB init
from sqlalchemy import text
from utils.database import Base, engine

# Create DB tables
Base.metadata.create_all(bind=engine)

# Migration: add downloaded_at to row_rationales if missing
def _migrate_downloaded_at():
    try:
        with engine.connect() as conn:
            if "sqlite" in str(engine.url):
                r = conn.execute(text("PRAGMA table_info(row_rationales)"))
                cols = [row[1] for row in r]
                if "downloaded_at" not in cols:
                    conn.execute(text("ALTER TABLE row_rationales ADD COLUMN downloaded_at DATETIME"))
                    conn.commit()
    except Exception:
        pass
_migrate_downloaded_at()

app = FastAPI(title="Rationale Generator API")

# ✅ CORS - allow localhost from any port + production origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://localhost:8081",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:8081",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://rationale-generator.onrender.com",
        "https://vikashbagaria.com",
        "https://www.vikashbagaria.com",
        "https://admin.vikashbagaria.com",
        "https://api.vikashbagaria.com",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?$",  # Any localhost port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*", "X-GEMINI-API-KEY"],
)

# ✅ Existing Gemini routes
app.include_router(gemini_router)

# ✅ Admin & Platform routes
app.include_router(admin_auth_router)
app.include_router(admin_clients_router)
app.include_router(usage_router)
app.include_router(sheet_router)
app.include_router(client_auth_router)

@app.get("/")
def health():
    return {"status": "Backend running"}
