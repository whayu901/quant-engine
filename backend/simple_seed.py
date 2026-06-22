#!/usr/bin/env python3
"""Simple seed script for quick demo data"""

from app.database import SessionLocal
from app.models import Org, User, Project
from app.security import hash_pw
from datetime import datetime

def seed():
    db = SessionLocal()

    # Check if already seeded
    if db.query(User).first():
        print("Database already has data")
        return

    # Create org
    org = Org(id="demo-org", name="Demo Org", plan="pro")
    db.add(org)

    # Create user
    user = User(
        id="demo-user",
        email="researcher@demo.com",
        name="Researcher",
        hashed_password=hash_pw("research123"),
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
        created_by_id="demo-user"
    )
    db.add(project)

    db.commit()
    print("✅ Seeded: researcher@demo.com / research123")
    db.close()

if __name__ == "__main__":
    seed()