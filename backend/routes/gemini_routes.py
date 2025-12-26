from fastapi import APIRouter, UploadFile, File, Form
from services.gemini_service import (
    analyze_text_and_image,
    analyze_image_only
)
from utils.image import read_image_as_base64

router = APIRouter(prefix="/gemini", tags=["Gemini"])


# ✅ 1️⃣ TEXT + IMAGE
@router.post("/analyze-with-rationale")
async def analyze_with_rationale(
    getRationale: str = Form(...),
    image: UploadFile = File(...)
):
    image_base64 = read_image_as_base64(image)

    result = analyze_text_and_image(
        rationale=getRationale,
        image_base64=image_base64,
        mime_type=image.content_type
    )

    return {
        "status": "success",
        "output": result
    }


# ✅ 2️⃣ IMAGE ONLY
@router.post("/analyze-image-only")
async def analyze_image(
    image: UploadFile = File(...)
):
    image_base64 = read_image_as_base64(image)

    result = analyze_image_only(
        image_base64=image_base64,
        mime_type=image.content_type
    )

    return {
        "status": "success",
        "output": result
    }
