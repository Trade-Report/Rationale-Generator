from utils.database import SessionLocal
from models.admin import Admin
# from utils.security import hash_password # no longer needed

def seed_custom_vikash():
    db = SessionLocal()

    username = "vikash"
    password = "vikash@9900"

    existing = db.query(Admin).filter(Admin.username == username).first()
    if existing:
        print(f"Admin {username} already exists, updating password...")
        # Store as plaintext as requested
        existing.password_hash = password 
        db.commit()
        print(f"Admin {username} password updated to plaintext successfully")
    else:
        # Store as plaintext as requested
        admin = Admin(
            username=username,
            password_hash=password
        )
        db.add(admin)
        db.commit()
        print(f"Admin {username} created with plaintext password successfully")

    db.close()

if __name__ == "__main__":
    seed_custom_vikash()
