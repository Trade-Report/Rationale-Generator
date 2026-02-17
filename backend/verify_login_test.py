from utils.database import SessionLocal
from models.admin import Admin
from utils.security import verify_password

def test_login():
    db = SessionLocal()
    username = "vikash"
    password = "vikash@9900" 
    
    print(f"Testing login for {username} with password '{password}'...")
    
    admin = db.query(Admin).filter(Admin.username == username).first()
    
    if not admin:
        print("❌ Admin user not found!")
        return

    print(f"Found admin user with ID: {admin.id}")
    print(f"Stored password hash (should be plaintext): {admin.password_hash}")
    
    is_valid = verify_password(password, admin.password_hash)
    
    if is_valid:
        print("✅ Password verification SUCCESSFUL!")
    else:
        print("❌ Password verification FAILED.")

    db.close()

if __name__ == "__main__":
    test_login()
