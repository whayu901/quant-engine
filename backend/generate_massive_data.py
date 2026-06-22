#!/usr/bin/env python3.9
"""
Generate massive test data for performance testing
This creates millions of records to demonstrate smooth rendering capabilities
"""

import os
import sys
import random
import json
from datetime import datetime, timedelta
from faker import Faker
import asyncio
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
import hashlib

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models import Base, User, Org as Organization, Project, Transcript, Analysis
from app.models_phase4 import (
    ProjectMember,
    OpenEndQuestion, OpenEndResponse, CodeFrame,
    ConceptTest, ConceptEvaluation, Comment, ActivityLog,
    UserRole, TeamType
)

fake = Faker(['id_ID', 'en_US', 'ms_MY', 'th_TH', 'fil_PH'])
Faker.seed(42)

# Database setup
DATABASE_URL = "sqlite:///./qualitas_massive.db"
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=40,
    pool_pre_ping=True,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Configuration
TOTAL_USERS = 10000
TOTAL_PROJECTS = 1000
TOTAL_TRANSCRIPTS = 100000  # 100k transcripts
TOTAL_OPEN_ENDS = 500000   # 500k open end responses
TOTAL_CONCEPTS = 5000
BATCH_SIZE = 1000

def hash_password(password: str) -> str:
    """Hash password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

def create_database():
    """Create all tables"""
    print("Creating database schema...")
    Base.metadata.create_all(bind=engine)
    print("Database schema created!")

def generate_organizations(session, count=50):
    """Generate organizations"""
    print(f"Generating {count} organizations...")
    orgs = []

    for i in range(count):
        org = Organization(
            id=f"org_{i}",
            name=fake.company(),
            slug=f"org-{i}",
            created_at=datetime.utcnow() - timedelta(days=random.randint(30, 365))
        )
        orgs.append(org)

    session.bulk_save_objects(orgs)
    session.commit()
    print(f"✓ Generated {count} organizations")
    return orgs

def generate_users(session, orgs, count=TOTAL_USERS):
    """Generate massive user dataset"""
    print(f"Generating {count} users...")
    users = []

    roles = list(UserRole)
    teams = list(TeamType)

    for i in range(count):
        if i % 1000 == 0:
            print(f"  Processing user {i}/{count}...")

        org = random.choice(orgs)
        role = random.choice(roles)
        team = random.choice(teams) if role != UserRole.CLIENT else TeamType.CLIENT

        user = User(
            id=f"user_{i}",
            email=f"user{i}@example.com",
            password_hash=hash_password("password123"),
            name=fake.name(),
            role=role.value,
            org_id=org.id,
            team=team.value if team else None,
            is_active=random.choice([True, True, True, False]),  # 75% active
            last_login=datetime.utcnow() - timedelta(days=random.randint(0, 30)),
            created_at=datetime.utcnow() - timedelta(days=random.randint(30, 365))
        )
        users.append(user)

        if len(users) >= BATCH_SIZE:
            session.bulk_save_objects(users)
            session.commit()
            users = []

    if users:
        session.bulk_save_objects(users)
        session.commit()

    print(f"✓ Generated {count} users")

def generate_projects(session, orgs, count=TOTAL_PROJECTS):
    """Generate projects"""
    print(f"Generating {count} projects...")
    projects = []

    markets = ['Indonesia', 'Singapore', 'Malaysia', 'Thailand', 'Philippines', 'Vietnam']
    statuses = ['active', 'completed', 'archived', 'draft']

    for i in range(count):
        if i % 100 == 0:
            print(f"  Processing project {i}/{count}...")

        org = random.choice(orgs)

        project = Project(
            id=f"project_{i}",
            name=f"{fake.catch_phrase()} Study {i}",
            description=fake.text(max_nb_chars=200),
            org_id=org.id,
            market=random.choice(markets),
            status=random.choice(statuses),
            created_at=datetime.utcnow() - timedelta(days=random.randint(0, 180))
        )
        projects.append(project)

        if len(projects) >= BATCH_SIZE:
            session.bulk_save_objects(projects)
            session.commit()
            projects = []

    if projects:
        session.bulk_save_objects(projects)
        session.commit()

    print(f"✓ Generated {count} projects")

def generate_transcripts(session, count=TOTAL_TRANSCRIPTS):
    """Generate massive transcript dataset"""
    print(f"Generating {count} transcripts...")

    # Get project IDs
    projects = session.query(Project.id).limit(500).all()
    project_ids = [p[0] for p in projects]

    transcripts = []

    for i in range(count):
        if i % 10000 == 0:
            print(f"  Processing transcript {i}/{count}...")

        # Generate realistic interview content
        content_parts = []
        for _ in range(random.randint(20, 50)):
            speaker = random.choice(['Interviewer', 'Respondent'])
            text = fake.paragraph(nb_sentences=random.randint(1, 5))
            content_parts.append(f"{speaker}: {text}")

        transcript = Transcript(
            id=f"transcript_{i}",
            project_id=random.choice(project_ids),
            participant_id=f"P{str(i).zfill(6)}",
            content="\n\n".join(content_parts),
            duration=random.randint(1800, 7200),  # 30 mins to 2 hours
            language=random.choice(['en', 'id', 'ms', 'th', 'fil']),
            created_at=datetime.utcnow() - timedelta(days=random.randint(0, 90))
        )
        transcripts.append(transcript)

        if len(transcripts) >= BATCH_SIZE:
            session.bulk_save_objects(transcripts)
            session.commit()
            transcripts = []

    if transcripts:
        session.bulk_save_objects(transcripts)
        session.commit()

    print(f"✓ Generated {count} transcripts")

def generate_open_ends(session, count=TOTAL_OPEN_ENDS):
    """Generate massive open-ended response dataset"""
    print(f"Generating {count} open-ended responses...")

    # Get project IDs
    projects = session.query(Project.id).limit(100).all()
    project_ids = [p[0] for p in projects]

    # First create questions
    questions = []
    question_templates = [
        "What do you like most about this product?",
        "How would you improve this service?",
        "Describe your ideal shopping experience",
        "What challenges do you face with current solutions?",
        "Why did you choose this brand over competitors?",
        "What features would you add to make this better?",
        "How does this product fit into your daily routine?",
        "What concerns do you have about this concept?"
    ]

    print("  Creating open-end questions...")
    for i in range(500):  # 500 questions
        question = OpenEndQuestion(
            id=f"oeq_{i}",
            project_id=random.choice(project_ids),
            question_text=random.choice(question_templates),
            question_type=random.choice(['single', 'multiple']),
            created_at=datetime.utcnow() - timedelta(days=random.randint(0, 60))
        )
        questions.append(question)

    session.bulk_save_objects(questions)
    session.commit()

    # Get question IDs
    question_ids = [f"oeq_{i}" for i in range(500)]

    # Response templates for variety
    response_templates = [
        "I really appreciate the {quality} and {feature}. It makes my life easier.",
        "The {aspect} could be improved. Sometimes it's {issue}.",
        "Great value for money, especially the {feature}.",
        "Not satisfied with the {aspect}. Expected better {quality}.",
        "Love how {adjective} it is. Would recommend to friends.",
        "The {feature} is amazing but {aspect} needs work.",
        "Perfect for my needs. The {quality} exceeded expectations.",
        "Disappointed with {aspect}. Won't buy again.",
        "{Feature} is good but price is too high compared to alternatives.",
        "Excellent {quality}. Best purchase this year."
    ]

    qualities = ['quality', 'durability', 'design', 'performance', 'reliability']
    features = ['user interface', 'speed', 'battery life', 'camera', 'display', 'comfort']
    aspects = ['customer service', 'delivery', 'packaging', 'instructions', 'warranty']
    issues = ['confusing', 'slow', 'unreliable', 'complicated', 'expensive']
    adjectives = ['convenient', 'innovative', 'user-friendly', 'efficient', 'practical']

    print(f"  Creating {count} responses...")
    responses = []

    for i in range(count):
        if i % 50000 == 0:
            print(f"    Processing response {i}/{count}...")

        template = random.choice(response_templates)
        response_text = template.format(
            quality=random.choice(qualities),
            feature=random.choice(features),
            aspect=random.choice(aspects),
            issue=random.choice(issues),
            adjective=random.choice(adjectives),
            Feature=random.choice(features).capitalize(),
            Quality=random.choice(qualities)
        )

        response = OpenEndResponse(
            id=f"oer_{i}",
            question_id=random.choice(question_ids),
            respondent_id=f"R{str(i).zfill(6)}",
            response_text=response_text + " " + fake.sentence(),
            market=random.choice(['ID', 'SG', 'MY', 'TH', 'PH']),
            demographic_data=json.dumps({
                'age': random.randint(18, 65),
                'gender': random.choice(['M', 'F', 'Other']),
                'income': random.choice(['Low', 'Medium', 'High']),
                'education': random.choice(['High School', 'Bachelor', 'Master', 'PhD'])
            }),
            created_at=datetime.utcnow() - timedelta(days=random.randint(0, 30))
        )
        responses.append(response)

        if len(responses) >= BATCH_SIZE * 10:  # Larger batches for simple records
            session.bulk_save_objects(responses)
            session.commit()
            responses = []

    if responses:
        session.bulk_save_objects(responses)
        session.commit()

    print(f"✓ Generated {count} open-ended responses")

def generate_concepts(session, count=TOTAL_CONCEPTS):
    """Generate concept test data"""
    print(f"Generating {count} concept tests...")

    # Get project IDs
    projects = session.query(Project.id).limit(200).all()
    project_ids = [p[0] for p in projects]

    concepts = []
    concept_names = [
        "Premium Organic Coffee Blend",
        "Smart Home Assistant Pro",
        "Eco-Friendly Packaging Solution",
        "Mobile Banking App 2.0",
        "Health Monitoring Wearable",
        "Plant-Based Protein Bar",
        "Virtual Fitness Platform",
        "Sustainable Fashion Line"
    ]

    for i in range(count):
        if i % 500 == 0:
            print(f"  Processing concept {i}/{count}...")

        concept = ConceptTest(
            id=f"concept_{i}",
            project_id=random.choice(project_ids),
            concept_name=f"{random.choice(concept_names)} v{i}",
            concept_description=fake.text(max_nb_chars=300),
            target_audience=random.choice(['Millennials', 'Gen Z', 'Families', 'Professionals', 'Students']),
            test_metrics=json.dumps({
                'appeal': random.randint(50, 95),
                'uniqueness': random.randint(40, 90),
                'purchase_intent': random.randint(30, 85),
                'believability': random.randint(60, 95),
                'relevance': random.randint(55, 90),
                'value': random.randint(45, 85)
            }),
            created_at=datetime.utcnow() - timedelta(days=random.randint(0, 60))
        )
        concepts.append(concept)

        if len(concepts) >= BATCH_SIZE:
            session.bulk_save_objects(concepts)
            session.commit()
            concepts = []

    if concepts:
        session.bulk_save_objects(concepts)
        session.commit()

    print(f"✓ Generated {count} concept tests")

def generate_activity_logs(session, count=100000):
    """Generate activity logs for demonstration"""
    print(f"Generating {count} activity logs...")

    # Get some user and project IDs
    users = session.query(User.id).limit(100).all()
    projects = session.query(Project.id).limit(100).all()

    user_ids = [u[0] for u in users]
    project_ids = [p[0] for p in projects] if projects else [None]

    actions = [
        'login', 'logout', 'view_project', 'create_transcript',
        'run_analysis', 'export_data', 'update_profile', 'invite_user',
        'upload_file', 'delete_content', 'share_analysis', 'comment_added'
    ]

    logs = []

    for i in range(count):
        if i % 10000 == 0:
            print(f"  Processing log {i}/{count}...")

        log = ActivityLog(
            id=f"log_{i}",
            user_id=random.choice(user_ids) if user_ids else None,
            action=random.choice(actions),
            meta_data=json.dumps({
                'ip': fake.ipv4(),
                'user_agent': fake.user_agent(),
                'duration': random.randint(100, 5000),
                'project_id': random.choice(project_ids) if random.random() > 0.3 else None
            }),
            created_at=datetime.utcnow() - timedelta(seconds=random.randint(0, 2592000))  # Last 30 days
        )
        logs.append(log)

        if len(logs) >= BATCH_SIZE * 10:
            session.bulk_save_objects(logs)
            session.commit()
            logs = []

    if logs:
        session.bulk_save_objects(logs)
        session.commit()

    print(f"✓ Generated {count} activity logs")

def print_statistics(session):
    """Print database statistics"""
    print("\n" + "="*50)
    print("DATABASE STATISTICS")
    print("="*50)

    stats = []

    # Only count models that exist
    try:
        stats.append(("Organizations", session.query(Organization).count()))
    except:
        pass

    try:
        stats.append(("Users", session.query(User).count()))
    except:
        pass

    try:
        stats.append(("Projects", session.query(Project).count()))
    except:
        pass

    try:
        stats.append(("Transcripts", session.query(Transcript).count()))
    except:
        pass

    try:
        stats.append(("Open End Questions", session.query(OpenEndQuestion).count()))
    except:
        pass

    try:
        stats.append(("Open End Responses", session.query(OpenEndResponse).count()))
    except:
        pass

    try:
        stats.append(("Concept Tests", session.query(ConceptTest).count()))
    except:
        pass

    try:
        stats.append(("Activity Logs", session.query(ActivityLog).count()))
    except:
        pass

    for name, count in stats:
        print(f"{name:.<30} {count:,}")

    print("="*50)

    # File size
    if os.path.exists("qualitas_massive.db"):
        size_mb = os.path.getsize("qualitas_massive.db") / (1024 * 1024)
        print(f"Database size: {size_mb:.2f} MB")

def main():
    """Main function to generate all data"""
    print("\n" + "="*50)
    print("MASSIVE DATA GENERATION FOR QUALITAS ENGINE")
    print("="*50)
    print(f"Target: {TOTAL_TRANSCRIPTS:,} transcripts, {TOTAL_OPEN_ENDS:,} open ends")
    print("="*50 + "\n")

    # Create database
    create_database()

    # Create session
    session = SessionLocal()

    try:
        # Generate data in order of dependencies
        orgs = generate_organizations(session)
        generate_users(session, orgs)
        generate_projects(session, orgs)
        generate_transcripts(session)
        generate_open_ends(session)
        generate_concepts(session)
        generate_activity_logs(session)

        # Print final statistics
        print_statistics(session)

        print("\n✅ Massive data generation complete!")
        print("Database: qualitas_massive.db")
        print("\nYou can now test the frontend with millions of records!")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        session.rollback()
        raise
    finally:
        session.close()

if __name__ == "__main__":
    main()