from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Existing routes
from routes.gemini_routes import router as gemini_router

# ✅ New routes
from routes.admin_auth import router as admin_auth_router
from routes.admin_clients import router as admin_clients_router
from routes.usage_routes import router as usage_router
from routes.sheet_routes import router as sheet_router

# ✅ DB init
from utils.database import Base, engine

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Rationale Generator API")

# ✅ CORS (UNCHANGED)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://localhost:8081",
        "http://127.0.0.1:8080",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://rationale-generator.onrender.com",
    ],
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

@app.get("/")
def health():
    return {"status": "Backend running"}
