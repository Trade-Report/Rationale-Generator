"""
Seed admin and client users. Uses DATABASE_URL from env (same DB the backend connects to).
Run: python seed_db.py
For production: DATABASE_URL=<prod-url> VIKASH_PASSWORD=India@2029 python seed_db.py
"""
import os
import main  # noqa: F401 - ensures models are loaded
from models.admin import Admin
from models.client import Client
from utils.database import SessionLocal
from utils.security import hash_password


def seed_admin(username: str, password: str):
    db = SessionLocal()
    existing = db.query(Admin).filter(Admin.username == username).first()
    if existing:
        existing.password_hash = hash_password(password)
        db.commit()
        print(f"Admin '{username}' already exists, password updated")
    else:
        admin = Admin(username=username, password_hash=hash_password(password))
        db.add(admin)
        db.commit()
        print(f"Admin '{username}' created successfully")
    db.close()


def seed_client(username: str, password: str):
    db = SessionLocal()
    existing = db.query(Client).filter(Client.username == username).first()
    if existing:
        existing.password_hash = hash_password(password)
        db.commit()
        print(f"Client '{username}' already exists, password updated")
    else:
        client = Client(username=username, password_hash=hash_password(password))
        db.add(client)
        db.commit()
        db.refresh(client)
        print(f"Client '{username}' created successfully (id={client.id})")
    db.close()


if __name__ == "__main__":
    vikash_pw = os.getenv("VIKASH_PASSWORD", "India@2029")
    covid_pw = os.getenv("COVID_PASSWORD", "Covid@123")
    seed_admin("vikash", vikash_pw)
    seed_client("Covid", covid_pw)
    print("Done.")
