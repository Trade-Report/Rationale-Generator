from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Header, Depends
from sqlalchemy.orm import Session
from services.gemini_service import (
    analyze_text_and_image,
    analyze_image_only,
    get_prompt_by_plan
)
from utils.image import read_image_as_base64
from utils.sheet_parser import parse_sheet_to_key_value
from utils.database import get_db
from models.usage import Usage
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

def _record_usage(db: Session, client_id: int, action: str, tokens_used: int):
    """Record usage to DB for admin visibility. Silently skips on error."""
    try:
        db.add(Usage(client_id=client_id, action=action, tokens_used=tokens_used))
        db.commit()
    except Exception:
        db.rollback()


@router.post("/analyze-with-rationale")
async def analyze_with_rationale(
    trade_data: str = Form(...),
    image: UploadFile = File(...),
    plan_type: Optional[PlanType] = Form(None),
    prompt: Optional[str] = Form(None),
    x_gemini_api_key: str = Header(..., alias="X-GEMINI-API-KEY"),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db),
):
    validate_image(image)

    try:
        trade_dict = json.loads(trade_data)
        if not isinstance(trade_dict, dict):
            raise ValueError
    except Exception:
        raise HTTPException(status_code=400, detail="trade_data must be valid key-value JSON")

    rationale_text = "\n".join(f"{k}: {v}" for k, v in trade_dict.items())
    image_base64 = read_image_as_base64(image)
    result = await analyze_text_and_image(
        rationale=rationale_text,
        image_base64=image_base64,
        mime_type=image.content_type,
        plan_type=plan_type,
        user_prompt=prompt,
        api_key=x_gemini_api_key
    )

    # Record usage for admin table when client_id is provided
    if x_user_id:
        try:
            cid = int(x_user_id)
            total = (result.get("usage") or {}).get("total_tokens", 0) or 0
            _record_usage(db, cid, "analyze_with_rationale", total)
        except (ValueError, TypeError):
            pass

    return {
        "status": "success",
        "plan_type": plan_type or "generic",
        "trade_data": trade_dict,
        "output": result
    }


# 2)  IMAGE ONLY
@router.post("/analyze-image-only")
async def analyze_image(
    image: UploadFile = File(...),
    x_gemini_api_key: str = Header(..., alias="X-GEMINI-API-KEY"),
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
            mime_type=image.content_type,
            api_key=x_gemini_api_key
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