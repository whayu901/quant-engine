#!/usr/bin/env python3
"""Create test users for the Qualitas Engine application"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database import engine, get_db
from app.models import User, Org
from app.security import hash_pw
import uuid

# Test user data
TEST_USERS = [
    {
        "email": "admin@qualitas.com",
        "full_name": "Super Admin",
        "role": "super_admin",
        "password": "password123"
    },
    {
        "email": "orgadmin@qualitas.com",
        "full_name": "Organization Admin",
        "role": "org_admin",
        "password": "password123"
    },
    {
        "email": "teamlead@qualitas.com",
        "full_name": "Team Lead",
        "role": "team_lead",
        "password": "password123"
    },
    {
        "email": "researcher@qualitas.com",
        "full_name": "Qualitative Researcher",
        "role": "researcher",
        "password": "password123"
    },
    {
        "email": "analyst@qualitas.com",
        "full_name": "Quantitative Analyst",
        "role": "analyst",
        "password": "password123"
    },
    {
        "email": "client@qualitas.com",
        "full_name": "Client User",
        "role": "client",
        "password": "password123"
    },
    {
        "email": "qc@qualitas.com",
        "full_name": "Quality Control",
        "role": "viewer",
        "password": "password123"
    },
    {
        "email": "dataproc@qualitas.com",
        "full_name": "Data Processing",
        "role": "analyst",
        "password": "password123"
    },
    {
        "email": "pm@qualitas.com",
        "full_name": "Project Manager",
        "role": "researcher",
        "password": "password123"
    }
]


def create_test_users():
    """Create test users and organization"""
    db = next(get_db())

    try:
        # Check if org already exists
        org = db.query(Org).filter(Org.name == "Qualitas Demo").first()

        if not org:
            # Create demo organization
            org = Org(
                id=str(uuid.uuid4()),
                name="Qualitas Demo",
                plan="pro"
            )
            db.add(org)
            db.commit()
            print(f"✅ Created organization: {org.name}")
        else:
            print(f"ℹ️  Organization already exists: {org.name}")

        # Create users
        for user_data in TEST_USERS:
            # Check if user exists
            existing_user = db.query(User).filter(User.email == user_data["email"]).first()

            if not existing_user:
                user = User(
                    id=str(uuid.uuid4()),
                    email=user_data["email"],
                    name=user_data["full_name"],
                    role=user_data["role"],
                    hashed_password=hash_pw(user_data["password"]),
                    org_id=org.id
                )
                db.add(user)
                print(f"✅ Created user: {user_data['email']} (role: {user_data['role']})")
            else:
                print(f"ℹ️  User already exists: {user_data['email']}")

        db.commit()
        print("\n✨ Test users created successfully!")
        print("\n📝 Login credentials:")
        print("   Password for all users: password123")
        print("\n👤 Available users:")
        for user_data in TEST_USERS:
            print(f"   - {user_data['email']} ({user_data['full_name']})")

    except Exception as e:
        print(f"❌ Error creating test users: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    create_test_users()