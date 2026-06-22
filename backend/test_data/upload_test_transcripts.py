#!/usr/bin/env python3
"""
Script to upload test transcripts to the Qual Engine API
"""

import requests
import json
from pathlib import Path

# API Configuration
BASE_URL = "http://localhost:8000"
LOGIN_ENDPOINT = f"{BASE_URL}/auth/login"
PROJECTS_ENDPOINT = f"{BASE_URL}/projects"
TRANSCRIPTS_ENDPOINT = f"{BASE_URL}/transcripts"

# Login credentials (from seed data)
USERNAME = "researcher@demo.com"
PASSWORD = "research123"

def login():
    """Login and get access token"""
    response = requests.post(
        LOGIN_ENDPOINT,
        data={
            "username": USERNAME,
            "password": PASSWORD
        }
    )

    if response.status_code == 200:
        token = response.json()["access_token"]
        print("✅ Login successful!")
        return token
    else:
        print(f"❌ Login failed: {response.status_code} - {response.text}")
        return None

def get_projects(token):
    """Get list of projects"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(PROJECTS_ENDPOINT, headers=headers)

    if response.status_code == 200:
        projects = response.json()
        print(f"✅ Found {len(projects)} projects")
        return projects
    else:
        print(f"❌ Failed to get projects: {response.status_code}")
        return []

def create_transcript(token, project_id, title, content, language="id-en"):
    """Create a new transcript"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    data = {
        "title": title,
        "content": content,
        "language": language
    }

    # Use the correct endpoint with project_id in path
    endpoint = f"{BASE_URL}/projects/{project_id}/transcripts"
    response = requests.post(
        endpoint,
        headers=headers,
        json=data
    )

    if response.status_code in [200, 201]:
        transcript = response.json()
        print(f"✅ Created transcript: {title} (ID: {transcript['id']})")
        return transcript
    else:
        print(f"❌ Failed to create transcript: {response.status_code} - {response.text}")
        return None

def main():
    """Main function to upload test transcripts"""

    print("🚀 Starting transcript upload...")

    # Login
    token = login()
    if not token:
        return

    # Get projects
    projects = get_projects(token)
    if not projects:
        print("No projects found. Please run seed script first.")
        return

    # Use the first project
    project = projects[0]
    project_id = project["id"]
    print(f"📁 Using project: {project['name']} (ID: {project_id})")

    # Read transcript files
    test_data_dir = Path(__file__).parent
    transcript_files = [
        {
            "file": "mock_transcript_ecommerce.txt",
            "title": "FGD E-Commerce Shopping Behavior - Jakarta",
            "language": "id-en"
        },
        {
            "file": "mock_transcript_food_delivery.txt",
            "title": "IDI Food Delivery App Usage - Singapore",
            "language": "en"
        }
    ]

    # Upload each transcript
    for transcript_info in transcript_files:
        file_path = test_data_dir / transcript_info["file"]

        if file_path.exists():
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            create_transcript(
                token,
                project_id,
                transcript_info["title"],
                content,
                transcript_info["language"]
            )
        else:
            print(f"⚠️ File not found: {file_path}")

    print("\n✨ Upload complete! You can now:")
    print("1. Go to http://localhost:5173")
    print("2. Login with researcher@demo.com / research123")
    print("3. View transcripts and run analysis")
    print("4. Analysis will use mock service (no API key needed)")

if __name__ == "__main__":
    main()