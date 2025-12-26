import requests
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

BASE_URL = "https://generativelanguage.googleapis.com/v1beta"
MODEL = "gemini-2.5-flash"

HEADERS = {
    "Content-Type": "application/json",
    "x-goog-api-key": API_KEY
}

def _call_gemini(prompt: str, image_base64: str, mime_type: str):
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
    }

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {"text": prompt},
                    {
                        "inline_data": {
                            "mime_type": mime_type,
                            "data": image_base64
                        }
                    }
                ]
            }
        ]
    }

    res = requests.post(url, headers=headers, json=payload, timeout=60)

    if res.status_code == 403:
        raise Exception(
            "403 PERMISSION_DENIED → "
            "Project / API / Billing / Key mismatch"
        )

    if not res.ok:
        raise Exception(res.text)

    return res.json()["candidates"][0]["content"]["parts"][0]["text"]

# 🔹 Endpoint 1: TEXT + IMAGE
def analyze_text_and_image(rationale: str, image_base64: str, mime_type: str):
    prompt = f"""
Analyze the candlestick chart AND the trade rationale.

Rationale:
{rationale}

Return EXACT format:
RECOMMENDATION: BUY or SELL
SUPPORT/RESISTANCE:
- points
SUMMARY:
2–3 lines
ONE LINE REASON:
"""

    return _call_gemini(prompt, image_base64, mime_type)


# 🔹 Endpoint 2: IMAGE ONLY
def analyze_image_only(image_base64: str, mime_type: str):
    prompt = """
Analyze the candlestick chart only.

Return EXACT format:
RECOMMENDATION: BUY or SELL
SUPPORT/RESISTANCE:
- points
SUMMARY:
2–3 lines
ONE LINE REASON:
"""

    return _call_gemini(prompt, image_base64, mime_type)
