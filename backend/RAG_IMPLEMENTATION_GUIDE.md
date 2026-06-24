# RAG Implementation Guide - Quick Reference for Developers

## Current Files & Locations

### Core RAG Files

#### 1. app/rag.py (441 lines)
**Location**: `/Users/wahyusetiawan/Documents/office/kadence/qual-engine/backend/app/rag.py`

**Key Classes**:
- `RAGService`: Main RAG orchestration
  - `create_chat_session()` - Line 40
  - `chat()` - Line 90 (THIS IS THE MAIN METHOD)
  - `_generate_llm_response()` - Line 183
  - `_generate_mock_response()` - Line 245
  - `get_chat_history()` - Line 359
  - `get_suggested_questions()` - Line 384

**Critical Issue**: Line 122-127
```python
search_results = await self.vector_service.semantic_search(
    query=message,
    project_id=session.project_id,  ← HARDCODED TO SINGLE PROJECT
    top_k=top_k,
    threshold=0.5
)
```

**To Fix Cross-Project Search**:
1. Modify to accept `project_ids` list
2. Remove hardcoded `session.project_id`
3. Filter results by org_id only

---

#### 2. app/models_phase3.py (287 lines)
**Location**: `/Users/wahyusetiawan/Documents/office/kadence/qual-engine/backend/app/models_phase3.py`

**Key Models**:
- `VectorStore` - Line 19 (Stores embeddings)
- `ChatSession` - Line 61 (Conversation sessions)
- `ChatMessage` - Line 98 (Individual messages)
- `SavedPrompt` - Line 134 (Reusable prompts)
- `ChatTemplate` - Line 249 (Pre-configured templates)
- `SemanticSearchLog` - Line 169 (Search analytics)
- `KnowledgeBase` - Line 212 (UNUSED - needs integration)

**Status**: All models present, properly indexed, well-designed

---

#### 3. app/embeddings.py (460 lines)
**Location**: `/Users/wahyusetiawan/Documents/office/kadence/qual-engine/backend/app/embeddings.py`

**Key Classes**:

**EmbeddingService** - Line 19
- `generate_embedding()` - Line 39 (single text)
- `generate_embeddings()` - Line 57 (batch)
- `cosine_similarity()` - Line 118
- `search_similar()` - Line 132
- `_mock_embedding()` - Line 75 (deterministic mock)

**ChunkingService** - Line 156
- `chunk_text()` - Line 165
- `_chunk_by_sentences()` - Line 178 (recommended)
- `_chunk_by_characters()` - Line 201
- `chunk_transcript()` - Line 216

**VectorStoreService** - Line 274
- `index_transcript()` - Line 284 (chunks + embeds)
- `index_evidence()` - Line 328
- `semantic_search()` - Line 359 (**THIS NEEDS CROSS-PROJECT FIX**)
- `find_related_content()` - Line 416

**Critical Issue**: Line 386 in semantic_search()
```python
candidates = candidates_query.all()  # ← LOADS ALL INTO MEMORY
```
This will crash with 100k+ vectors. Needs pagination.

**Performance Fix Needed**:
1. Replace `.all()` with pagination
2. Use database cursor or LIMIT/OFFSET
3. Load only top_k candidates

---

#### 4. app/routers/chat.py (539 lines)
**Location**: `/Users/wahyusetiawan/Documents/office/kadence/qual-engine/backend/app/routers/chat.py`

**Endpoints** (14 total):

**Chat Sessions**:
- `POST /api/v1/chat/sessions` - Line 71
- `GET /api/v1/chat/sessions` - Line 102
- `GET /api/v1/chat/sessions/{session_id}` - Line 142
- `POST /api/v1/chat/sessions/{session_id}/messages` - Line 176 (**THIS IS THE CHAT ENDPOINT**)
- `DELETE /api/v1/chat/sessions/{session_id}` - Line 204

**Semantic Search**:
- `POST /api/v1/chat/search/{project_id}` - Line 227 (**FIX HERE FOR CROSS-PROJECT**)

**Vector Store**:
- `POST /api/v1/chat/index` - Line 278 (**NEEDS AUTO-INDEXING HOOK**)
- `GET /api/v1/chat/index/{project_id}/status` - Line 320

**Prompts & Templates**:
- `POST /api/v1/chat/prompts` - Line 358
- `GET /api/v1/chat/prompts` - Line 389
- `POST /api/v1/chat/templates` - Line 430
- `GET /api/v1/chat/templates` - Line 463

**Related Content**:
- `GET /api/v1/chat/related/{source_type}/{source_id}` - Line 496

**Critical Issues**:
1. Line 245-250: All search endpoints require `project_id`
2. Line 278-317: Index endpoint is manual only
3. No org-level search endpoint

---

#### 5. tests/test_phase3.py (698 lines)
**Location**: `/Users/wahyusetiawan/Documents/office/kadence/qual-engine/backend/tests/test_phase3.py`

**Test Classes** (23 tests total):

- `TestEmbeddingService` - Line 40 (4 tests)
  - test_mock_embedding_generation
  - test_batch_embeddings
  - test_cosine_similarity
  - test_search_similar

- `TestChunkingService` - Line 119 (3 tests)
  - test_chunk_by_sentences
  - test_chunk_by_characters
  - test_chunk_transcript

- `TestVectorStoreService` - Line 172 (3 tests)
  - test_index_transcript
  - test_index_evidence
  - test_semantic_search

- `TestRAGService` - Line 302 (5 tests)
  - test_create_chat_session
  - test_chat_with_mock_response
  - test_chat_with_rag
  - test_get_chat_history
  - test_suggested_questions

- `TestChatTemplates` - Line 478 (2 tests)
- `TestSavedPrompts` - Line 557 (2 tests)
- `TestSemanticSearchLog` - Line 620 (1 test)
- `TestKnowledgeBase` - Line 661 (1 test)

**Critical Gap**: NO tests with real Claude API
- All RAGService tests use mock responses
- Need to add integration test with actual Anthropic API

---

## Implementation Priority Map

### CRITICAL (Must do before launch)

#### 1. Cross-Project Search (6-8 hours)
**Files to Modify**:
- `app/embeddings.py` - Line 359 in `semantic_search()`
- `app/routers/chat.py` - Add new endpoint around Line 227

**Changes**:
```python
# Before
async def semantic_search(
    self,
    query: str,
    project_id: Optional[str] = None,  # ← Currently required
    ...
)

# After
async def semantic_search(
    self,
    query: str,
    project_ids: Optional[List[str]] = None,  # ← Accept list
    org_id: Optional[str] = None,  # ← For org-wide search
    ...
)
```

**New Endpoint**:
```python
@router.post("/search/org")  # New org-wide endpoint
async def semantic_search_org(
    request: SemanticSearchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Search all user's projects, not just one
```

---

#### 2. Auto-Indexing (8-10 hours)
**Files to Modify**:
- `app/routers/ingestion.py` - Hook transcript upload
- `app/routers/analysis.py` - Hook evidence creation
- `app/rag.py` - Or new `app/indexing.py` file

**Changes**:
```python
# In ingestion.py, after transcript is saved:
from app.embeddings import VectorStoreService
vector_service = VectorStoreService(db)
await vector_service.index_transcript(transcript_id)

# In analysis.py, after evidence is created:
await vector_service.index_evidence(evidence_id)
```

**Alternative (Better)**: Use Celery background job
```python
# Create new file: app/tasks_indexing.py
@celery.task
def index_transcript_async(transcript_id: str):
    # Background indexing to not block user
```

---

#### 3. Real Claude API Testing (4-6 hours)
**Files to Create**:
- `tests/test_phase3_integration.py` (new file)

**Add Test**:
```python
@pytest.mark.asyncio
@pytest.mark.skipif(not os.getenv('ANTHROPIC_API_KEY'), reason="API key not set")
async def test_chat_with_real_claude_api(db_session):
    # Actually test with Claude API
    # Verify response format, token counting, error handling
```

---

### HIGH (Should do before production)

#### 4. Performance Fix (6-8 hours)
**File**: `app/embeddings.py` - Line 386

**Change**:
```python
# Before (WRONG - loads all into memory)
candidates = candidates_query.all()

# After (RIGHT - paginate)
page = request.get('page', 1)
per_page = request.get('per_page', 100)
candidates = candidates_query.limit(per_page).offset((page - 1) * per_page).all()
```

---

### MEDIUM (Can defer to next sprint)

#### 5. KnowledgeBase Integration (4-6 hours)
**File**: `app/routers/chat.py`

**Add Endpoints**:
- `POST /api/v1/chat/knowledge-bases/{project_id}`
- `GET /api/v1/chat/knowledge-bases/{project_id}`
- `PATCH /api/v1/chat/knowledge-bases/{id}`

**Use in RAGService**:
```python
# Line 44 in rag.py
kb = db.query(KnowledgeBase).filter_by(project_id=project_id).first()
chunk_size = kb.chunk_size if kb else 500
```

---

#### 6. Advanced Filtering (8-12 hours)
**File**: `app/routers/chat.py` - Line 227

**Update Request Schema**:
```python
class SemanticSearchRequest(BaseModel):
    query: str
    source_types: Optional[List[str]] = None
    top_k: int = 5
    threshold: float = 0.0
    # NEW FIELDS:
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    market: Optional[str] = None
    segment: Optional[str] = None
```

**Update Query Logic**:
```python
# In semantic_search()
if date_from:
    query_filter.append(VectorStore.created_at >= date_from)
if market:
    query_filter.append(VectorStore.market == market)
```

---

## Configuration

### Environment Variables Needed
```bash
# For real embeddings (production)
OPENAI_API_KEY=sk-...

# For real LLM (production)
ANTHROPIC_API_KEY=sk-ant-...

# For development (optional, uses mocks)
# Just don't set the keys
```

### Database Setup
All Phase 3 models are in `app/models_phase3.py`
They're auto-created when database initializes (via `Base.metadata.create_all()`)

---

## Testing Locally

### Run All Phase 3 Tests
```bash
cd /Users/wahyusetiawan/Documents/office/kadence/qual-engine/backend
python -m pytest tests/test_phase3.py -v
```

### Run Specific Test
```bash
python -m pytest tests/test_phase3.py::TestRAGService::test_chat_with_mock_response -v
```

### Test With Real Claude API
```bash
# Set API key
export ANTHROPIC_API_KEY=sk-ant-...

# Run integration tests
python -m pytest tests/test_phase3_integration.py -v -s
```

---

## Quick Decision Tree

**Need cross-project search?**
├─ YES → Modify semantic_search() + add /search/org endpoint (6-8 hrs)
└─ NO → Will be competitive disadvantage

**Auto-indexing implemented?**
├─ NO → Add hooks to ingestion/analysis routers (8-10 hrs)
└─ YES → Good UX, proceed

**Claude API tested in production?**
├─ NO → Add integration test (4-6 hrs)
└─ YES → Good, shipping ready

**Performance tested with 10k+ vectors?**
├─ NO → Fix in-memory loading (6-8 hrs)
└─ YES → Ready to scale

---

## Emergency Hotline (If Issues Found)

**Issue**: Chat returns no context
├─ Check: Are transcripts indexed? (run /api/v1/chat/index)
└─ Fix: Call index endpoint for each transcript

**Issue**: Search results are empty
├─ Check: Are vectors in database?
├─ Query: `SELECT COUNT(*) FROM vector_stores;`
└─ Fix: Use /api/v1/chat/index endpoint

**Issue**: Claude API says rate limit
├─ Backoff: Exponential retry in _generate_llm_response()
└─ Check: Token counting is accurate

---

## File Locations Summary

```
/Users/wahyusetiawan/Documents/office/kadence/qual-engine/backend/
├── app/
│   ├── rag.py                    ← RAG Service (441 lines)
│   ├── embeddings.py             ← Embedding/Vector Service (460 lines)
│   ├── models_phase3.py          ← Database Models (287 lines)
│   └── routers/
│       └── chat.py               ← API Endpoints (539 lines)
├── tests/
│   └── test_phase3.py            ← Tests (698 lines)
├── RAG_ASSESSMENT.md             ← Full Assessment
├── RAG_SUMMARY.txt               ← Quick Summary
└── RAG_IMPLEMENTATION_GUIDE.md   ← This file
```

---

**Last Updated**: June 24, 2026
**Status**: READY FOR DEVELOPMENT
**Estimated Sprint Duration**: 4 business days (32 hours)
**Recommended Approach**: Fix critical gaps before shipping

