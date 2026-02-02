from jose import jwt
from datetime import datetime, timedelta
from fastapi import Header, HTTPException
from typing import Optional

SECRET_KEY = "CHANGE_THIS_SECRET"
ALGORITHM = "HS256"

def create_token(data: dict):
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(hours=8)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user_id(user_id: Optional[int] = Header(None, alias="X-User-Id")) -> int:
    """
    Get current user ID from header.
    For now, we accept user_id from header. In production, this should be from JWT token.
    """
    if user_id is None:
        raise HTTPException(status_code=401, detail="User ID is required")
    return user_id
