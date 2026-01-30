from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from models.client import Client
from models.usage import Usage
from schemas.client import ClientCreate
from utils.security import hash_password
from utils.database import get_db

router = APIRouter(prefix="/admin/clients", tags=["Clients"])



@router.post("/create")
def create_client(payload: ClientCreate, db: Session = Depends(get_db)):
    client = Client(
        username=payload.username,
        password_hash=hash_password(payload.password)
    )
    db.add(client)
    db.commit()
    db.refresh(client)
    return {"id": client.id, "username": client.username}



@router.get("/")
def get_all_clients(db: Session = Depends(get_db)):
    results = (
        db.query(
            Client.id,
            Client.username,
            func.count(Usage.id).label("total_requests"),
            func.coalesce(func.sum(Usage.tokens_used), 0).label("total_tokens")
        )
        .outerjoin(Usage, Usage.client_id == Client.id)
        .group_by(Client.id)
        .all()
    )

    return [
        {
            "id": r.id,
            "username": r.username,
            "total_requests": r.total_requests,
            "total_tokens": r.total_tokens
        }
        for r in results
    ]



@router.get("/{client_id}")
def get_client_by_id(client_id: int, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.id == client_id).first()

    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    usage = (
        db.query(Usage.action, Usage.tokens_used, Usage.created_at)
        .filter(Usage.client_id == client_id)
        .all()
    )

    return {
        "id": client.id,
        "username": client.username,
        "usage": usage
    }
