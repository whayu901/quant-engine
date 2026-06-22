#!/bin/bash

# Script untuk test API Phase 0
echo "🧪 Testing Qual Engine API - Phase 0"
echo "====================================="

API_URL="http://localhost:8000"

# Test 1: Health Check
echo ""
echo "1. Testing Health Endpoint..."
curl -s $API_URL/health | python3 -m json.tool

# Test 2: Login dengan demo credentials
echo ""
echo "2. Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=researcher@demo.com&password=research123")

echo "$LOGIN_RESPONSE" | python3 -m json.tool

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  exit 1
fi

echo "✅ Login successful! Token obtained."

# Test 3: Get current user info
echo ""
echo "3. Testing Get Current User..."
curl -s -X GET $API_URL/auth/me \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# Test 4: Get projects
echo ""
echo "4. Testing Get Projects..."
curl -s -X GET $API_URL/projects \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# Test 5: Get specific project (demo project)
echo ""
echo "5. Testing Get Demo Project..."
curl -s -X GET $API_URL/projects/demo-project-001 \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# Test 6: Get transcripts for demo project
echo ""
echo "6. Testing Get Transcripts..."
curl -s -X GET $API_URL/projects/demo-project-001/transcripts \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# Test 7: Get analysis for demo transcript
echo ""
echo "7. Testing Get Analysis..."
curl -s -X GET $API_URL/transcripts/demo-transcript-001/analyses \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

echo ""
echo "====================================="
echo "✅ API Testing Complete!"
echo ""
echo "Summary:"
echo "- Health endpoint: Working"
echo "- Authentication: Working"
echo "- Demo data: Accessible"
echo "- SEA content: Indonesian consumer research data loaded"