"""
Create test users with different teams and roles for Phase 4
"""

import hashlib
from datetime import datetime
from app.database import SessionLocal, engine
from app.models import Base, User, Org, Project, _uid
from app.models_phase4 import UserEnhancement, ProjectMember, TeamType, UserRole, ProjectRole

# Create all tables
Base.metadata.create_all(bind=engine)

def create_test_users():
    """Create multiple test users with different roles and teams"""

    db = SessionLocal()

    try:
        # Get the demo organization
        org = db.query(Org).filter_by(name="Demo Org").first()
        if not org:
            print("❌ Demo organization not found. Run seed.py first.")
            return

        # Get the demo project
        project = db.query(Project).first()
        if not project:
            print("❌ No project found. Run seed.py first.")
            return

        print(f"📦 Found org: {org.name} and project: {project.name}")

        # Define users with different roles and teams
        users_data = [
            # Admin team
            {
                "email": "admin@kadence.com",
                "name": "Admin User",
                "password": "admin123",
                "role": "super_admin",
                "team": TeamType.PROJECT_MANAGEMENT,
                "department": "Management",
                "project_role": ProjectRole.OWNER,
                "can_manage_users": True,
                "can_create_projects": True
            },

            # Qual team
            {
                "email": "qual.lead@kadence.com",
                "name": "Qual Team Lead",
                "password": "qual123",
                "role": "team_lead",
                "team": TeamType.QUAL,
                "department": "Qualitative Research",
                "project_role": ProjectRole.MANAGER,
                "can_run_analysis": True,
                "can_edit_transcripts": True
            },
            {
                "email": "qual.researcher@kadence.com",
                "name": "Qual Researcher",
                "password": "qual123",
                "role": "researcher",
                "team": TeamType.QUAL,
                "department": "Qualitative Research",
                "project_role": ProjectRole.EDITOR,
                "can_run_analysis": True,
                "can_edit_transcripts": True
            },

            # Quant team
            {
                "email": "quant.lead@kadence.com",
                "name": "Quant Team Lead",
                "password": "quant123",
                "role": "team_lead",
                "team": TeamType.QUANT,
                "department": "Quantitative Research",
                "project_role": ProjectRole.MANAGER,
                "can_export": True,
                "can_run_analysis": True
            },
            {
                "email": "quant.analyst@kadence.com",
                "name": "Quant Analyst",
                "password": "quant123",
                "role": "analyst",
                "team": TeamType.QUANT,
                "department": "Quantitative Research",
                "project_role": ProjectRole.EDITOR,
                "can_export": True
            },

            # Data Processing team
            {
                "email": "data.processor@kadence.com",
                "name": "Data Processor",
                "password": "data123",
                "role": "researcher",
                "team": TeamType.DATA_PROCESSING,
                "department": "Data Processing",
                "project_role": ProjectRole.EDITOR,
                "can_edit_transcripts": True
            },

            # QC team
            {
                "email": "qc.lead@kadence.com",
                "name": "QC Team Lead",
                "password": "qc123",
                "role": "team_lead",
                "team": TeamType.QC,
                "department": "Quality Control",
                "project_role": ProjectRole.REVIEWER,
                "can_edit_transcripts": True
            },

            # Field team
            {
                "email": "field.coordinator@kadence.com",
                "name": "Field Coordinator",
                "password": "field123",
                "role": "researcher",
                "team": TeamType.FIELD,
                "department": "Field Operations",
                "project_role": ProjectRole.EDITOR,
                "can_edit_transcripts": True
            },

            # Client/External
            {
                "email": "client@honda.com",
                "name": "Honda Client",
                "password": "client123",
                "role": "client",
                "team": TeamType.CLIENT,
                "department": "External",
                "project_role": ProjectRole.VIEWER,
                "can_export": False,
                "can_edit_transcripts": False,
                "can_run_analysis": False
            }
        ]

        created_users = []

        for user_data in users_data:
            # Check if user already exists
            existing_user = db.query(User).filter_by(email=user_data["email"]).first()

            if existing_user:
                print(f"⚠️ User {user_data['email']} already exists")
                user = existing_user
            else:
                # Create user
                user = User(
                    id=_uid(),
                    email=user_data["email"],
                    name=user_data["name"],
                    org_id=org.id,
                    role=user_data["role"],
                    hashed_password=hashlib.sha256(user_data["password"].encode()).hexdigest(),
                    is_active=True
                )
                db.add(user)
                db.flush()
                print(f"✅ Created user: {user_data['email']}")

            # Check if enhancement exists
            enhancement = db.query(UserEnhancement).filter_by(user_id=user.id).first()

            if not enhancement:
                # Create user enhancement
                enhancement = UserEnhancement(
                    id=_uid(),
                    user_id=user.id,
                    team=user_data["team"],
                    department=user_data["department"],
                    can_create_projects=user_data.get("can_create_projects", False),
                    can_manage_users=user_data.get("can_manage_users", False),
                    can_export_data=user_data.get("can_export", True),
                    can_delete_content=user_data.get("can_delete", False)
                )
                db.add(enhancement)
                print(f"  📝 Added {user_data['team']} team assignment")

            # Check if project member exists
            project_member = db.query(ProjectMember).filter_by(
                project_id=project.id,
                user_id=user.id
            ).first()

            if not project_member:
                # Add to project
                project_member = ProjectMember(
                    id=_uid(),
                    project_id=project.id,
                    user_id=user.id,
                    role=user_data["project_role"],
                    can_edit_transcripts=user_data.get("can_edit_transcripts", False),
                    can_run_analysis=user_data.get("can_run_analysis", False),
                    can_manage_team=user_data.get("can_manage_users", False),
                    can_export=user_data.get("can_export", True),
                    can_delete=user_data.get("can_delete", False),
                    assigned_by=user.id if user_data["role"] == "super_admin" else None,
                    assigned_at=datetime.utcnow()
                )
                db.add(project_member)
                print(f"  🔗 Added to project with role: {user_data['project_role']}")

            created_users.append({
                "email": user_data["email"],
                "password": user_data["password"],
                "team": user_data["team"],
                "role": user_data["role"]
            })

        db.commit()

        print("\n" + "="*60)
        print("📋 TEAM USERS CREATED SUCCESSFULLY!")
        print("="*60)
        print("\nLogin credentials for different teams:\n")

        # Group by team
        teams = {}
        for user in created_users:
            team = user["team"]
            if team not in teams:
                teams[team] = []
            teams[team].append(user)

        for team, users in teams.items():
            print(f"\n🏢 {team.replace('_', ' ').title()} Team:")
            for user in users:
                print(f"  📧 {user['email']}")
                print(f"     Password: {user['password']}")
                print(f"     Role: {user['role']}")

        print("\n" + "="*60)
        print("🎯 TEST SCENARIOS:")
        print("="*60)
        print("""
1. Admin Dashboard:
   - Login as admin@kadence.com
   - Can see all users, manage teams, view all activity

2. Qual Team Workflow:
   - Login as qual.lead@kadence.com or qual.researcher@kadence.com
   - Can upload transcripts, run analysis, create themes

3. Quant Team Workflow:
   - Login as quant.lead@kadence.com or quant.analyst@kadence.com
   - Can code open-ends, run concept tests, export data

4. Data Processing:
   - Login as data.processor@kadence.com
   - Can clean and edit transcripts

5. Quality Control:
   - Login as qc.lead@kadence.com
   - Can review and approve content

6. Field Operations:
   - Login as field.coordinator@kadence.com
   - Can upload recordings and transcripts

7. Client Access:
   - Login as client@honda.com
   - Read-only access to view results
        """)

        print("\nBackend URL: http://localhost:8000")
        print("Frontend URL: http://localhost:5173")
        print("\n✨ Phase 4 team setup complete!")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    create_test_users()