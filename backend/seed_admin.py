from utils.database import SessionLocal
from models.admin import Admin
from utils.security import hash_password

def seed_admin():
    db = SessionLocal()

    username = "admin"
    password = "admin123"

    existing = db.query(Admin).filter(Admin.username == username).first()
    if existing:
        print("Admin already exists")
        db.close()
        return

    admin = Admin(
        username=username,
        password_hash=hash_password(password)
    )

    db.add(admin)
    db.commit()
    db.close()

    print("Admin created successfully")

if __name__ == "__main__":
    seed_admin()
