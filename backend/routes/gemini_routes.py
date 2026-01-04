from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from services.gemini_service import (
    analyze_text_and_image,
    analyze_image_only
)
from utils.image import read_image_as_base64
from utils.sheet_parser import parse_sheet_to_key_value
from fastapi import UploadFile, File
import json

router = APIRouter(prefix="/gemini", tags=["Gemini"])

ALLOWED_TYPES = {"image/png", "image/jpeg", "image/webp"}


def validate_image(image: UploadFile):
    if image.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only PNG, JPEG, WEBP images are allowed"
        )

from enum import Enum

class PlanType(str, Enum):
    EQUITY = "Equity"
    COMMODITY = "Commodity"
    OPTIONS = "Options"
    DERIVATIVES = "Derivatives"

@router.post("/analyze-with-rationale")
async def analyze_with_rationale(
    trade_data: str = Form(...),            
    image: UploadFile = File(...),           
    plan_type: Optional[PlanType] = Form(None)   
):
    validate_image(image)

    # Log request body details
    print("=" * 50)
    print(" Request received for /analyze-with-rationale")
    print(f" Trade Data (raw): {trade_data}")
    print(f" Image filename: {image.filename}")
    print(f" Image content type: {image.content_type}")
    print(f" Plan Type: {plan_type}")

    # Validation is now handled automatically by FastAPI/Pydantic via Enum

    try:
        trade_dict = json.loads(trade_data)
        if not isinstance(trade_dict, dict):
            raise ValueError
        print(f" Parsed Trade Data (dict): {json.dumps(trade_dict, indent=2)}")
        print(f" Trade Data keys: {list(trade_dict.keys())}")
        print(f" Trade Data values: {list(trade_dict.values())}")
    except Exception as e:
        print(f" Error parsing trade_data: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail="trade_data must be valid key-value JSON"
        )

    # Convert key-value → rationale text
    rationale_text = "\n".join(
        f"{k}: {v}" for k, v in trade_dict.items()
    )

    image_base64 = read_image_as_base64(image)

    print(f" Rationale text (converted from trade_data): {rationale_text[:200]}...")  # Log first 200 chars
    print(f" Image base64 length: {len(image_base64)} characters")

    result = await analyze_text_and_image(
        rationale=rationale_text,
        image_base64=image_base64,
        mime_type=image.content_type,
        plan_type=plan_type,   
        user_prompt=prompt
    )

    print(f" Analysis completed successfully")
    print("=" * 50)

    return {
        "status": "success",
        "plan_type": plan_type or "generic",
        "trade_data": trade_dict,
        "output": result
    }


# 2)  IMAGE ONLY
@router.post("/analyze-image-only")
async def analyze_image(
    image: UploadFile = File(...)
):
    validate_image(image)

    # Log request details
    print("=" * 50)
    print("📥 Request received for /analyze-image-only")
    print(f"📷 Image filename: {image.filename}")
    print(f"📷 Image content type: {image.content_type}")

    image_base64 = read_image_as_base64(image)
    print(f"🖼️ Image base64 length: {len(image_base64)} characters")

    try:
        result = await analyze_image_only(
            image_base64=image_base64,
            mime_type=image.content_type
        )
        print(f"✅ Analysis completed successfully")
        print("=" * 50)
    except Exception as e:
        print(f"❌ Error in analyze_image_only: {str(e)}")
        print("=" * 50)
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "status": "success",
        "output": result
    }