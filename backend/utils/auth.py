from jose import jwt, JWTError
from datetime import datetime, timedelta
from fastapi import Header, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional

SECRET_KEY = "CHANGE_THIS_SECRET"
ALGORITHM = "HS256"

security = HTTPBearer(auto_error=False)

def create_token(data: dict):
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(hours=8)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def get_current_admin(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> dict:
    """Verify admin Bearer token. Raises 401 if invalid."""
    if not credentials or credentials.credentials is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def get_current_user_id(user_id: Optional[int] = Header(None, alias="X-User-Id")) -> int:
    """
    Get current user ID from header.
    For now, we accept user_id from header. In production, this should be from JWT token.
    """
    if user_id is None:
        raise HTTPException(status_code=401, detail="User ID is required")
    return user_id
