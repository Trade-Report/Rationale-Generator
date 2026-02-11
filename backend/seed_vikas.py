from utils.database import SessionLocal
from models.admin import Admin
from utils.security import hash_password

def seed_vikas():
    db = SessionLocal()

    username = "vikas"
    password = "vikas@123"

    existing = db.query(Admin).filter(Admin.username == username).first()
    if existing:
        print(f"Admin {username} already exists")
        # Update password if exists? Maybe safer to just leave it or update hash.
        # Let's update hash to be sure.
        existing.password_hash = hash_password(password)
        db.commit()
        print(f"Admin {username} password updated")
    else:
        admin = Admin(
            username=username,
            password_hash=hash_password(password)
        )
        db.add(admin)
        db.commit()
        print(f"Admin {username} created successfully")

    db.close()

if __name__ == "__main__":
    seed_vikas()
