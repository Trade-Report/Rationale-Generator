from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.admin import AdminLogin
from models.admin import Admin
from utils.security import verify_password
from utils.auth import create_token
from utils.database import get_db

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.post("/login")
def admin_login(payload: AdminLogin, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.username == payload.username).first()

    if not admin or not verify_password(payload.password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token({"role": "admin", "admin_id": admin.id})
    return {"access_token": token}
