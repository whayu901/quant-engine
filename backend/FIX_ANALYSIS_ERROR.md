# Fix for Analysis Authentication Error

## Problem
You're getting this error when trying to run analysis:
```
Error code: 401 - {'type': 'error', 'error': {'type': 'authentication_error', 'message': 'invalid x-api-key'}}
```

## Root Cause
The analysis feature uses Anthropic's Claude API to analyze transcripts, but the API key is not configured. The system is trying to call Claude without a valid API key.

## Solution

### Option 1: Add Anthropic API Key (Recommended for Production)

1. Get an API key from Anthropic (https://console.anthropic.com/)

2. Add it to your `.env` file:
```bash
ANTHROPIC_API_KEY="your-actual-api-key-here"
```

3. Restart the server:
```bash
# Kill current server
pkill -f "uvicorn app.main:app"

# Start server again
python3.9 -m uvicorn app.main:app --port 8000
```

### Option 2: Use Mock Analysis (For Development/Testing)

If you don't have an Anthropic API key yet, I can create a mock analysis service:

Create `app/llm_mock.py`:
```python
def code_themes(transcript: str):
    """Mock theme extraction without API"""
    mock_themes = {
        "respondentCount": 5,
        "themes": [
            {
                "id": 1,
                "name": "Price Sensitivity",
                "description": "Participants show high concern about pricing",
                "prevalence": "Tinggi",
                "sentiment": "Negatif"
            },
            {
                "id": 2,
                "name": "User Experience",
                "description": "Interface and usability are important factors",
                "prevalence": "Sedang",
                "sentiment": "Positif"
            },
            {
                "id": 3,
                "name": "Brand Trust",
                "description": "Trust in brand affects purchase decisions",
                "prevalence": "Tinggi",
                "sentiment": "Campuran"
            }
        ]
    }
    return mock_themes, (100, 200)  # mock token usage

def extract_verbatims(transcript: str, themes: list):
    """Mock verbatim extraction without API"""
    mock_verbatims = {
        "verbatims": [
            {
                "themeId": 1,
                "quote": "Harganya terlalu mahal untuk fitur yang ditawarkan",
                "speaker": "Participant 1"
            },
            {
                "themeId": 2,
                "quote": "Aplikasinya mudah digunakan dan intuitif",
                "speaker": "Participant 2"
            },
            {
                "themeId": 3,
                "quote": "Saya percaya brand ini karena sudah lama di pasar",
                "speaker": "Participant 3"
            }
        ]
    }
    return mock_verbatims, (150, 250)

def generate_topline(themes: list, verbatims: list):
    """Mock topline generation without API"""
    mock_topline = {
        "topline": "Key Insights:\n1. Price is a major barrier\n2. UX is a competitive advantage\n3. Brand trust drives loyalty"
    }
    return mock_topline, (200, 300)
```

Then update `app/llm.py` to use mock when no API key:
```python
# At the top of llm.py
if not settings.anthropic_api_key:
    from . import llm_mock
    code_themes = llm_mock.code_themes
    extract_verbatims = llm_mock.extract_verbatims
    generate_topline = llm_mock.generate_topline
```

### Option 3: Disable Analysis Feature Temporarily

If you don't need the analysis feature right now, you can disable it by returning a message in the endpoint:

```python
# In app/routers/analyses.py, line 12
@router.post("/transcripts/{transcript_id}/analyses", response_model=schemas.AnalysisOut)
def start_analysis(transcript_id: str,
                   user: models.User = Depends(require_role("admin", "researcher")),
                   db: Session = Depends(get_db)):

    # Check if API key is configured
    if not settings.anthropic_api_key:
        raise HTTPException(
            status_code=503,
            detail="Analysis service not available. Please configure ANTHROPIC_API_KEY."
        )

    # ... rest of the function
```

## Current Configuration

Your current config in `app/config.py`:
- `anthropic_api_key: str = ""` (empty - this is the problem)
- `model_name: str = "claude-sonnet-4-6"`

## How the Analysis Works

1. User uploads/creates a transcript
2. User clicks "Analyze"
3. System calls Claude API to:
   - Extract themes from transcript
   - Find supporting quotes (verbatims)
   - Generate executive summary (topline)
4. Results are saved to database

## Testing After Fix

Once you've added the API key:

```bash
# Test with curl
curl -X POST "http://localhost:8000/transcripts/{transcript_id}/analyses" \
  -H "Authorization: Bearer {your_jwt_token}" \
  -H "Content-Type: application/json"
```

## Additional Notes

- The analysis uses Indonesian prompts (see line 43-49 in llm.py)
- It's optimized for qualitative research (FGD/IDI transcripts)
- Token usage is tracked for billing purposes
- Each analysis costs tokens based on transcript length

## Recommended Action

For immediate testing, use **Option 2 (Mock Analysis)** to continue development without needing an API key.

For production, use **Option 1** with a real Anthropic API key.