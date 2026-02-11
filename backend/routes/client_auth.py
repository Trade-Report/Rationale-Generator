from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from models.client import Client
from schemas.client import ClientCreate  # Using ClientCreate as Login schema for now if it has username/password
from utils.security import verify_password
from utils.database import get_db

router = APIRouter(tags=["Client Auth"])

@router.post("/api/login")
def client_login(payload: ClientCreate, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.username == payload.username).first()

    if not client:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    if not verify_password(payload.password, client.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    # Return structure matching what frontend expects:
    # {
    #   "success": true,
    #   "user": {
    #     "id": ...,
    #     "username": ...,
    #     "usage": { ... }
    #   }
    # }

    # Calculate usage (mock or real)
    # real usage is in another table, let's fetch it if needed or just send basic info
    # The frontend expects 'usage' object. 
    # Let's import Usage model if we want to send real usage, or just send 0s for now 
    # and let /api/user/:id/usage fetch real data.
    
    # Actually frontend calls /api/login and expects usage in response.
    # Let's look at frontend App.jsx again.
    # It sets usage from data.user.usage.
    
    from models.usage import Usage
    from sqlalchemy import func

    # Aggregated stats
    usage_stats = {
        "totalUploads": 0,
        "excelUploads": 0,
        "imageUploads": 0,
        "lastActivity": None
    }

    # Get total uploads
    usage_stats["totalUploads"] = db.query(Usage).filter(Usage.client_id == client.id).count()

    # Get excel uploads
    usage_stats["excelUploads"] = db.query(Usage).filter(
        Usage.client_id == client.id, 
        Usage.action == "excel_upload"
    ).count()

    # Get image uploads
    usage_stats["imageUploads"] = db.query(Usage).filter(
        Usage.client_id == client.id, 
        Usage.action == "image_upload"
    ).count()

    # Get last activity
    last_usage = db.query(Usage).filter(Usage.client_id == client.id).order_by(Usage.created_at.desc()).first()
    if last_usage:
        usage_stats["lastActivity"] = last_usage.created_at.isoformat()

    return {
        "success": True,
        "user": {
            "id": client.id,
            "username": client.username,
            "usage": usage_stats
        }
    }
