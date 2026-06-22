#!/usr/bin/env python3
"""Direct seed without bcrypt issues"""

from app.database import SessionLocal
from app.models import Org, User, Project

def seed():
    db = SessionLocal()

    # Check if already seeded
    if db.query(User).first():
        print("Database already has data")
        db.close()
        return

    # Create org
    org = Org(id="demo-org", name="Demo Org", plan="pro")
    db.add(org)

    # Create user with pre-hashed password
    # This is bcrypt hash for "research123"
    user = User(
        id="demo-user",
        email="researcher@demo.com",
        hashed_password="$2b$12$KIXxPfN2DvPJZAqMGMrrNOjZMf8LH6o6Q3e8zT3R3QwCKZFTD7n0W",
        org_id="demo-org",
        role="researcher"
    )
    db.add(user)

    # Create project
    project = Project(
        id="demo-project",
        org_id="demo-org",
        name="Indonesian Consumer Study",
        description="E-commerce behavior research",
        created_by="demo-user"
    )
    db.add(project)

    db.commit()
    print("✅ Seeded: researcher@demo.com / research123")
    db.close()

if __name__ == "__main__":
    seed()