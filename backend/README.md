# Rationale Analyzer Backend (FastAPI)

This backend provides two endpoints that analyze a posted rationale and/or image and return a concise summary and recommendations using Google Gemini (if available) and Google Vision where possible.

## Endpoints

- POST /analyze
  - Accepts multipart/form-data fields:
    - `getRationale` (string, required)
    - `image` (file, optional)
  - Returns JSON: `{ summary, recommendations, details }`

- POST /analyze/image
  - Accepts multipart/form-data with `image` (file)
  - Returns JSON: `{ summary, recommendations, details }`

## Setup

1. Create a virtual environment and install dependencies:

   pip install -r requirements.txt

2. Configure Google APIs for real, production usage:
   - For Generative AI (Gemini): install `google-generativeai` (already in requirements) and set the env var `GOOGLE_API_KEY`.
   - For Vision API: install `google-cloud-vision` (already in requirements) and authenticate by setting `GOOGLE_APPLICATION_CREDENTIALS` to your service account JSON path, or by configuring gcloud application credentials.

3. Run the app:

   uvicorn backend.main:app --reload

4. Test with real analysis (example):

   curl -X POST "http://localhost:8000/analyze" \
     -F "getRationale=The trade rationale here..." \
     -F "sheet=@/path/to/data.xlsx" \
     -F "image=@/path/to/image.jpg"

This flow will parse the sheet, analyze the image with Vision, and call Gemini with an integrated prompt so you get real summaries and recommendations (no mock responses).
## Notes

- If Google APIs are not configured, the service will return helpful mock responses so you can continue development.
- Prompts and models can be tuned in `backend/gemini_client.py`.
