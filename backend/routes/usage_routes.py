from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.usage import Usage
from schemas.usage import UsageCreate
from utils.database import get_db

router = APIRouter(prefix="/usage", tags=["Usage"])

@router.post("/create")
def create_usage(payload: UsageCreate, db: Session = Depends(get_db)):
    for item in payload.usage:
        db.add(
            Usage(
                client_id=payload.client_id,
                action=item.action,
                tokens_used=item.tokens_used
            )
        )
    db.commit()
    db.commit()
    return {"status": "usage recorded"}

@router.get("/")
def get_all_usage(db: Session = Depends(get_db)):
    from models.client import Client
    results = (
        db.query(
            Usage.id,
            Usage.action,
            Usage.tokens_used,
            Usage.created_at,
            Client.username
        )
        .join(Client, Usage.client_id == Client.id)
        .order_by(Usage.created_at.desc())
        .all()
    )

    return [
        {
            "id": r.id,
            "action": r.action,
            "tokens_used": r.tokens_used,
            "created_at": r.created_at,
            "username": r.username
        }
        for r in results
    ]

@router.get("/user/{user_id}/usage")
def get_user_usage(user_id: int, db: Session = Depends(get_db)):
    from sqlalchemy import func
    
    # Calculate usage stats for a specific user
    total_tokens = db.query(func.sum(Usage.tokens_used)).filter(Usage.client_id == user_id).scalar() or 0
    total_requests = db.query(Usage).filter(Usage.client_id == user_id).count()
    
    return {
        "userId": user_id,
        "usage": total_tokens,
        "requests": total_requests
    }
