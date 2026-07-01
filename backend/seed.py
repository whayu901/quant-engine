#!/usr/bin/env python
"""
Seed script for development database
Creates demo organization, users, project, and sample data
"""

import sys
from datetime import datetime, timedelta
from pathlib import Path

# Add the backend directory to path
sys.path.append(str(Path(__file__).parent))

from app.database import SessionLocal, engine, Base
from app.models import (
    Org, User, Project, Transcript, TranscriptSegment,
    Analysis, Theme, Verbatim, Implication, MediaAsset
)
# Register all model modules so SQLAlchemy can resolve cross-module
# relationships (e.g. Org -> WhiteLabelConfig) before mapper configuration.
# Mirror the runtime set from app/main.py (phase6 stays disabled).
from app import models_phase1  # noqa: F401
from app import models_phase2  # noqa: F401
from app import models_phase3  # noqa: F401
from app import models_phase4  # noqa: F401
from app import models_phase5  # noqa: F401
from app import models_enterprise  # noqa: F401
from app import models_fieldwork  # noqa: F401
from app.security import hash_pw
import random


def seed_database():
    """Create demo data for development"""
    db = SessionLocal()

    try:
        # Check if data already exists
        if db.query(Org).first():
            print("Database already seeded. Skipping...")
            return

        print("Creating demo data...")

        # Create demo organization
        demo_org = Org(
            id="demo-org-001",
            name="Demo Research Firm",
            plan="pro",
            created_at=datetime.utcnow() - timedelta(days=30)
        )
        db.add(demo_org)
        db.flush()  # persist org before dependent rows (FK)

        # Create demo users
        admin_user = User(
            id="demo-admin-001",
            email="admin@demo.com",
            name="Admin User",
            hashed_password=hash_pw("admin123"),
            org_id=demo_org.id,
            role="admin",
            created_at=datetime.utcnow() - timedelta(days=30)
        )

        researcher_user = User(
            id="demo-researcher-001",
            email="researcher@demo.com",
            name="Research Analyst",
            hashed_password=hash_pw("research123"),
            org_id=demo_org.id,
            role="researcher",
            created_at=datetime.utcnow() - timedelta(days=25)
        )

        viewer_user = User(
            id="demo-viewer-001",
            email="viewer@demo.com",
            name="Stakeholder",
            hashed_password=hash_pw("viewer123"),
            org_id=demo_org.id,
            role="viewer",
            created_at=datetime.utcnow() - timedelta(days=20)
        )

        db.add_all([admin_user, researcher_user, viewer_user])
        db.flush()  # persist users before dependent rows (FK)

        # Create demo project
        demo_project = Project(
            id="demo-project-001",
            org_id=demo_org.id,
            name="Indonesian Consumer Behavior Study",
            description="Qualitative research on shopping habits in Jakarta and Surabaya",
            created_by=researcher_user.id,
            created_at=datetime.utcnow() - timedelta(days=14)
        )
        db.add(demo_project)
        db.flush()  # persist project before dependent rows (FK)

        # Create demo media asset
        demo_media = MediaAsset(
            id="demo-media-001",
            org_id=demo_org.id,
            project_id=demo_project.id,
            filename="interview_jakarta_01.mp3",
            kind="audio",
            duration_sec=1800,  # 30 minutes
            storage_key="media/demo-org-001/demo-project-001/interview_jakarta_01.mp3",
            created_at=datetime.utcnow() - timedelta(days=10)
        )
        db.add(demo_media)

        # Create demo transcript with code-mixed content
        demo_transcript = Transcript(
            id="demo-transcript-001",
            org_id=demo_org.id,
            project_id=demo_project.id,
            title="Jakarta Focus Group - Session 1",
            language="id-en",  # Indonesian + English code-mixed
            source_media_id=demo_media.id,
            transcription_status="completed",
            created_at=datetime.utcnow() - timedelta(days=10)
        )
        db.add(demo_transcript)
        db.flush()  # persist transcript before segments/analysis (FK)

        # Create transcript segments with realistic Indonesian consumer research content
        segments_data = [
            ("Moderator", 0, 15, "Selamat pagi semuanya, terima kasih sudah hadir. Today kita akan discuss tentang shopping habits kalian, especially untuk online shopping."),
            ("Participant 1", 15, 45, "Saya personally lebih suka online shopping sih. Praktis banget, apalagi sekarang ada banyak promo. Tapi untuk groceries, I still prefer ke pasar tradisional karena bisa milih sendiri quality-nya."),
            ("Participant 2", 45, 80, "Kalau saya mix ya, untuk electronics sama fashion definitely online aja. Tapi untuk daily needs kayak sayur, buah, better beli offline. Trust issue juga sih sama freshness-nya kalau beli online."),
            ("Participant 3", 80, 120, "Actually saya full online shopping sekarang. Bahkan groceries juga. Time saving banget dan surprisingly kualitasnya ok. Plus point-nya bisa compare prices easily antar platform."),
            ("Moderator", 120, 140, "Interesting. Kalau untuk payment method, apa yang biasa kalian pakai? Dan kenapa choose method itu?"),
            ("Participant 1", 140, 180, "E-wallet sih mostly, convenient banget. GoPay atau OVO usually. Sometimes pakai virtual account kalau amount-nya besar. COD udah jarang banget, cuma kalau seller-nya new dan belum trusted."),
            ("Participant 2", 180, 220, "Saya prefer credit card untuk big purchases karena ada protection. Tapi untuk small items pakai e-wallet aja. Paylater juga kadang, especially pas lagi nunggu gajian haha."),
            ("Participant 3", 220, 260, "Bank transfer masih sering saya pakai, feels more secure somehow. Tapi memang ga se-instant e-wallet ya. Untuk subscription services pakai credit card biar auto-debit."),
            ("Moderator", 260, 280, "How about delivery preferences? Same day delivery vs regular delivery, mana yang lebih important?"),
            ("Participant 1", 280, 320, "Depends on urgency sih. Kalau urgent ya same day, tapi mostly regular aja cukup. Yang penting free ongkir! Itu game changer banget. Kadang jadi beli barang yang ga perlu cuma karena mau reach minimum purchase untuk free shipping."),
        ]

        for idx, (speaker, start, end, text) in enumerate(segments_data):
            segment = TranscriptSegment(
                id=f"demo-segment-{idx+1:03d}",
                transcript_id=demo_transcript.id,
                speaker=speaker,
                start_sec=start,
                end_sec=end,
                text=text,
                idx=idx
            )
            db.add(segment)

        # Create demo analysis
        demo_analysis = Analysis(
            id="demo-analysis-001",
            org_id=demo_org.id,
            transcript_id=demo_transcript.id,
            status="completed",
            created_at=datetime.utcnow() - timedelta(days=7)
        )
        db.add(demo_analysis)
        db.flush()  # persist analysis before themes/implications (FK)

        # Create themes
        themes_data = [
            ("Channel Preference", "Consumers show mixed channel preferences based on product category", [
                "Online shopping preferred for electronics and fashion due to convenience and variety",
                "Traditional markets still trusted for fresh produce and groceries",
                "Full online adoption emerging among time-conscious consumers"
            ]),
            ("Payment Methods", "E-wallets dominate but traditional methods persist for security", [
                "E-wallets (GoPay, OVO) are primary choice for convenience",
                "Credit cards preferred for large purchases and subscriptions",
                "Bank transfers still used by security-conscious consumers"
            ]),
            ("Delivery Economics", "Free shipping drives purchase behavior significantly", [
                "Free shipping is a major decision factor",
                "Consumers make unnecessary purchases to reach free shipping thresholds",
                "Same-day delivery valued only for urgent needs"
            ])
        ]

        for idx, (name, desc, verbatims) in enumerate(themes_data):
            theme = Theme(
                id=f"demo-theme-{idx+1:03d}",
                analysis_id=demo_analysis.id,
                name=name,
                description=desc,
                order_idx=idx
            )
            db.add(theme)
            db.flush()  # persist theme before verbatims (FK)

            # Add verbatims for each theme
            for v_idx, v_text in enumerate(verbatims):
                verbatim = Verbatim(
                    id=f"demo-verbatim-{idx+1:03d}-{v_idx+1:03d}",
                    theme_id=theme.id,
                    quote=v_text
                )
                db.add(verbatim)

        # Create implications
        implications_data = [
            "E-commerce platforms should optimize category-specific experiences rather than one-size-fits-all approaches",
            "Investment in fresh produce quality assurance and communication could unlock significant online grocery growth",
            "E-wallet integration and partnerships are essential for market penetration in Indonesia",
            "Free shipping strategies directly impact basket size and purchase frequency",
            "Trust-building mechanisms remain critical for new sellers and fresh categories"
        ]

        for idx, text in enumerate(implications_data):
            implication = Implication(
                id=f"demo-implication-{idx+1:03d}",
                analysis_id=demo_analysis.id,
                text=text,
                order_idx=idx
            )
            db.add(implication)

        db.commit()
        print("✓ Database seeded successfully!")
        print("\nDemo credentials:")
        print("  Admin:      admin@demo.com / admin123")
        print("  Researcher: researcher@demo.com / research123")
        print("  Viewer:     viewer@demo.com / viewer123")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("Running seed script...")
    seed_database()