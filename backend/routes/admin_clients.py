from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.client import Client
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

@router.get("/{client_id}")
def get_client_by_id(client_id: int, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.id == client_id).first()
    usage = db.execute(
        f"SELECT action, tokens_used, created_at FROM usage WHERE client_id={client_id}"
    ).fetchall()

    return {
        "client": client.username,
        "usage": usage
    }
