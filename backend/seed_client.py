"""
Seed a default Client for rationale_gen local development.
Run: python3 seed_client.py
"""
# Ensure all models are loaded (import main triggers model registration)
import main  # noqa: F401
from models.client import Client
from utils.database import SessionLocal
from utils.security import hash_password

def seed_client():
    db = SessionLocal()
    username = "vikas"
    password = "vikas"

    existing = db.query(Client).filter(Client.username == username).first()
    if existing:
        print(f"Client '{username}' already exists (id={existing.id})")
        db.close()
        return

    client = Client(
        username=username,
        password_hash=hash_password(password)
    )
    db.add(client)
    db.commit()
    db.refresh(client)
    print(f"Client '{username}' created successfully (id={client.id})")
    db.close()

if __name__ == "__main__":
    seed_client()
