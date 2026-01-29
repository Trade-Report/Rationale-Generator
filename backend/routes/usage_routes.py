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
    return {"status": "usage recorded"}
