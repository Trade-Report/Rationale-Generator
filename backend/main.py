from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.gemini_routes import router as gemini_router

app = FastAPI(title="Rationale Generator API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
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

app.include_router(gemini_router)

@app.get("/")
def health():
    return {"status": "Backend running"}
