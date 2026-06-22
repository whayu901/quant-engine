#!/usr/bin/env python3
"""Fix user password with proper bcrypt hash"""

from app.database import SessionLocal
from app.models import User
from app.security import hash_pw

def fix_user():
    db = SessionLocal()

    # Get existing user
    user = db.query(User).filter_by(email="researcher@demo.com").first()

    if user:
        # Update password with proper hash
        user.hashed_password = hash_pw("research123")
        db.commit()
        print("✅ Fixed user password for researcher@demo.com")
    else:
        print("❌ User not found")

    db.close()

if __name__ == "__main__":
    fix_user()