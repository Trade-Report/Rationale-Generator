from fastapi import FastAPI
from routes.gemini_routes import router as gemini_router

app = FastAPI()

app.include_router(gemini_router)

@app.get("/")
def health():
    return {"status": "Backend running"}
