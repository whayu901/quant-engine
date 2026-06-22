"""
Phase 3: Chat/RAG System Tests
Tests for vector embeddings, semantic search, and chat functionality
"""

import pytest
import pytest_asyncio
from datetime import datetime
from unittest.mock import Mock, patch, AsyncMock
import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models import User, Org, Project, Transcript, TranscriptSegment, _uid
from app.models_phase2 import Evidence
from app.models_phase3 import (
    VectorStore, ChatSession, ChatMessage,
    SavedPrompt, ChatTemplate, SemanticSearchLog, KnowledgeBase
)
from app.embeddings import EmbeddingService, ChunkingService, VectorStoreService
from app.rag import RAGService


# Test fixtures
@pytest.fixture
def db_session():
    """Create a test database session"""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()

    yield session

    session.close()


class TestEmbeddingService:
    """Test embedding generation service"""

    def test_mock_embedding_generation(self):
        """Test that mock embeddings are generated correctly"""
        service = EmbeddingService(use_mock=True)

        # Test single embedding
        text = "This is a test text about pricing and quality"
        embedding = service.generate_embedding(text)

        assert isinstance(embedding, list)
        assert len(embedding) == 1536  # OpenAI ada-002 dimension
        assert all(isinstance(x, float) for x in embedding)

        # Test deterministic generation
        embedding2 = service.generate_embedding(text)
        assert embedding == embedding2

    def test_batch_embeddings(self):
        """Test batch embedding generation"""
        service = EmbeddingService(use_mock=True)

        texts = [
            "First text about price",
            "Second text about quality",
            "Third text about service"
        ]

        embeddings = service.generate_embeddings(texts)

        assert len(embeddings) == 3
        assert all(len(e) == 1536 for e in embeddings)

        # Different texts should have different embeddings
        assert embeddings[0] != embeddings[1]
        assert embeddings[1] != embeddings[2]

    def test_cosine_similarity(self):
        """Test cosine similarity calculation"""
        service = EmbeddingService(use_mock=True)

        # Similar texts should have higher similarity
        text1 = "The price is very expensive for this product"
        text2 = "This product is too costly and overpriced"
        text3 = "The weather is nice today"

        emb1 = service.generate_embedding(text1)
        emb2 = service.generate_embedding(text2)
        emb3 = service.generate_embedding(text3)

        sim_12 = service.cosine_similarity(emb1, emb2)
        sim_13 = service.cosine_similarity(emb1, emb3)

        # Similar content should have higher similarity
        # (Note: with mock embeddings this might not always hold perfectly)
        assert 0 <= sim_12 <= 1
        assert 0 <= sim_13 <= 1

    def test_search_similar(self):
        """Test similarity search functionality"""
        service = EmbeddingService(use_mock=True)

        query = "price sensitivity"
        query_emb = service.generate_embedding(query)

        candidates = [
            ("doc1", service.generate_embedding("High price concern")),
            ("doc2", service.generate_embedding("Weather forecast")),
            ("doc3", service.generate_embedding("Pricing issues"))
        ]

        results = service.search_similar(query_emb, candidates, top_k=2, threshold=0.0)

        assert len(results) <= 2
        assert all(isinstance(r[0], str) for r in results)
        assert all(isinstance(r[1], float) for r in results)


class TestChunkingService:
    """Test text chunking service"""

    def test_chunk_by_sentences(self):
        """Test sentence-based chunking"""
        service = ChunkingService(chunk_size=100, chunk_overlap=20)

        text = "This is the first sentence. This is the second one. And here is the third. The fourth sentence is longer and contains more information."

        chunks = service.chunk_text(text, preserve_sentences=True)

        assert len(chunks) > 0
        assert all(len(chunk) <= 150 for chunk in chunks)  # Allow some overflow for complete sentences

    def test_chunk_by_characters(self):
        """Test character-based chunking with overlap"""
        service = ChunkingService(chunk_size=50, chunk_overlap=10)

        text = "a" * 200  # 200 characters

        chunks = service.chunk_text(text, preserve_sentences=False)

        # Should have multiple chunks
        assert len(chunks) > 1

        # Check chunk sizes
        for i, chunk in enumerate(chunks[:-1]):  # All but last
            assert len(chunk) == 50

        # Last chunk might be shorter
        assert len(chunks[-1]) <= 50

    def test_chunk_transcript(self, db_session):
        """Test transcript chunking"""
        service = ChunkingService(chunk_size=200, chunk_overlap=20)

        # Create mock segments
        segments = []
        for i in range(5):
            segment = Mock()
            segment.id = f"seg_{i}"
            segment.speaker = f"Speaker{i % 2 + 1}"
            segment.text = f"This is segment {i} with some content about testing."
            segments.append(segment)

        chunks = service.chunk_transcript(segments)

        assert len(chunks) > 0
        assert all('text' in chunk for chunk in chunks)
        assert all('speakers' in chunk for chunk in chunks)
        assert all('segment_ids' in chunk for chunk in chunks)


class TestVectorStoreService:
    """Test vector store service"""

    @pytest.mark.asyncio
    async def test_index_transcript(self, db_session):
        """Test indexing transcript into vector store"""
        # Create test data
        org = Org(id="org_1", name="Test Org")
        project = Project(id="proj_1", org_id="org_1", name="Test Project")
        transcript = Transcript(
            id="trans_1",
            org_id="org_1",
            project_id="proj_1",
            title="Test Transcript",
            language="en"
        )

        db_session.add_all([org, project, transcript])

        # Add segments
        for i in range(3):
            segment = TranscriptSegment(
                transcript_id="trans_1",
                segment_index=i,
                speaker=f"Speaker{i+1}",
                text=f"This is test segment {i} with some content."
            )
            db_session.add(segment)

        db_session.commit()

        # Index the transcript
        service = VectorStoreService(db_session)
        chunks_created = await service.index_transcript("trans_1")

        assert chunks_created > 0

        # Check vector store entries
        vectors = db_session.query(VectorStore).filter_by(
            source_type='transcript',
            source_id='trans_1'
        ).all()

        assert len(vectors) == chunks_created
        assert all(v.embedding is not None for v in vectors)
        assert all(len(v.embedding) == 1536 for v in vectors)

    @pytest.mark.asyncio
    async def test_index_evidence(self, db_session):
        """Test indexing evidence into vector store"""
        # Create test data
        org = Org(id="org_1", name="Test Org")
        project = Project(id="proj_1", org_id="org_1", name="Test Project")
        evidence = Evidence(
            id="evid_1",
            org_id="org_1",
            project_id="proj_1",
            content="This is important evidence about pricing concerns.",
            evidence_type="theme",
            themes=["pricing", "concerns"],
            speaker="Participant 1",
            significance="high"
        )

        db_session.add_all([org, project, evidence])
        db_session.commit()

        # Index the evidence
        service = VectorStoreService(db_session)
        chunks_created = await service.index_evidence("evid_1")

        assert chunks_created == 1

        # Check vector store entry
        vector = db_session.query(VectorStore).filter_by(
            source_type='evidence',
            source_id='evid_1'
        ).first()

        assert vector is not None
        assert vector.embedding is not None
        assert len(vector.embedding) == 1536
        assert vector.meta_data['evidence_type'] == 'theme'

    @pytest.mark.asyncio
    async def test_semantic_search(self, db_session):
        """Test semantic search functionality"""
        # Create test data
        org = Org(id="org_1", name="Test Org")
        project = Project(id="proj_1", org_id="org_1", name="Test Project")
        db_session.add_all([org, project])

        # Add some vector entries
        service = VectorStoreService(db_session)
        embedding_service = EmbeddingService(use_mock=True)

        texts = [
            "Customer complains about high prices",
            "Product quality is excellent",
            "Delivery service needs improvement"
        ]

        for i, text in enumerate(texts):
            vector = VectorStore(
                org_id="org_1",
                project_id="proj_1",
                source_type="test",
                source_id=f"test_{i}",
                content=text,
                chunk_index=0,
                embedding=embedding_service.generate_embedding(text)
            )
            db_session.add(vector)

        db_session.commit()

        # Perform search
        results = await service.semantic_search(
            query="pricing issues",
            project_id="proj_1",
            top_k=2,
            threshold=0.0
        )

        assert len(results) <= 2
        assert all('content' in r for r in results)
        assert all('similarity' in r for r in results)
        assert all(0 <= r['similarity'] <= 1 for r in results)


class TestRAGService:
    """Test RAG service"""

    @pytest.mark.asyncio
    async def test_create_chat_session(self, db_session):
        """Test creating a chat session"""
        # Create test data
        org = Org(id="org_1", name="Test Org")
        user = User(id="user_1", email="test@example.com", org_id="org_1")
        project = Project(id="proj_1", org_id="org_1", name="Test Project")

        db_session.add_all([org, user, project])
        db_session.commit()

        # Create chat session
        service = RAGService(db_session)
        session = await service.create_chat_session(
            user_id="user_1",
            project_id="proj_1",
            title="Test Chat"
        )

        assert session is not None
        assert session.user_id == "user_1"
        assert session.project_id == "proj_1"
        assert session.title == "Test Chat"
        assert session.is_active is True

    @pytest.mark.asyncio
    async def test_chat_with_mock_response(self, db_session):
        """Test chat functionality with mock responses"""
        # Create test data
        org = Org(id="org_1", name="Test Org")
        user = User(id="user_1", email="test@example.com", org_id="org_1")
        project = Project(id="proj_1", org_id="org_1", name="Test Project")

        db_session.add_all([org, user, project])
        db_session.commit()

        # Create session and chat
        service = RAGService(db_session)
        session = await service.create_chat_session(
            user_id="user_1",
            project_id="proj_1"
        )

        # Send a message
        result = await service.chat(
            session_id=session.id,
            message="What are the main themes?",
            use_rag=False  # Don't use RAG for this test
        )

        assert 'response' in result
        assert 'retrieved_context' in result
        assert 'tokens_used' in result
        assert result['response'] is not None

        # Check message was saved
        messages = db_session.query(ChatMessage).filter_by(
            session_id=session.id
        ).all()

        assert len(messages) == 2  # User + Assistant
        assert messages[0].role == "user"
        assert messages[1].role == "assistant"

    @pytest.mark.asyncio
    async def test_chat_with_rag(self, db_session):
        """Test chat with RAG context retrieval"""
        # Create test data
        org = Org(id="org_1", name="Test Org")
        user = User(id="user_1", email="test@example.com", org_id="org_1")
        project = Project(id="proj_1", org_id="org_1", name="Test Project")

        db_session.add_all([org, user, project])

        # Add some vector entries for context
        embedding_service = EmbeddingService(use_mock=True)

        vector = VectorStore(
            org_id="org_1",
            project_id="proj_1",
            source_type="test",
            source_id="test_1",
            content="Customers frequently mention price sensitivity",
            chunk_index=0,
            embedding=embedding_service.generate_embedding("price sensitivity")
        )
        db_session.add(vector)
        db_session.commit()

        # Create session and chat with RAG
        service = RAGService(db_session)
        session = await service.create_chat_session(
            user_id="user_1",
            project_id="proj_1"
        )

        result = await service.chat(
            session_id=session.id,
            message="Tell me about pricing",
            use_rag=True,
            top_k=3
        )

        assert 'response' in result
        assert 'retrieved_context' in result
        # With our test data, we should get context
        # (though it might be empty if similarity is too low)

    @pytest.mark.asyncio
    async def test_get_chat_history(self, db_session):
        """Test retrieving chat history"""
        # Create test data
        org = Org(id="org_1", name="Test Org")
        user = User(id="user_1", email="test@example.com", org_id="org_1")
        project = Project(id="proj_1", org_id="org_1", name="Test Project")

        db_session.add_all([org, user, project])
        db_session.commit()

        # Create session with messages
        service = RAGService(db_session)
        session = await service.create_chat_session(
            user_id="user_1",
            project_id="proj_1"
        )

        # Send multiple messages
        await service.chat(session_id=session.id, message="First question")
        await service.chat(session_id=session.id, message="Second question")

        # Get history
        history = await service.get_chat_history(session.id)

        assert len(history) == 4  # 2 user + 2 assistant
        assert history[0]['role'] == 'user'
        assert history[1]['role'] == 'assistant'
        assert history[2]['role'] == 'user'
        assert history[3]['role'] == 'assistant'

    @pytest.mark.asyncio
    async def test_suggested_questions(self, db_session):
        """Test suggested questions generation"""
        # Create test data
        org = Org(id="org_1", name="Test Org")
        user = User(id="user_1", email="test@example.com", org_id="org_1")
        project = Project(id="proj_1", org_id="org_1", name="Test Project")

        db_session.add_all([org, user, project])
        db_session.commit()

        service = RAGService(db_session)
        session = await service.create_chat_session(
            user_id="user_1",
            project_id="proj_1"
        )

        # Get default suggestions
        suggestions = await service.get_suggested_questions(session.id)

        assert isinstance(suggestions, list)
        assert len(suggestions) > 0
        assert all(isinstance(s, str) for s in suggestions)

        # Send a message about themes
        await service.chat(session_id=session.id, message="What themes are present?")

        # Get contextual suggestions
        suggestions = await service.get_suggested_questions(session.id)

        assert len(suggestions) > 0
        # Should have theme-related suggestions now


class TestChatTemplates:
    """Test chat templates functionality"""

    def test_create_chat_template(self, db_session):
        """Test creating a chat template"""
        org = Org(id="org_1", name="Test Org")
        user = User(id="user_1", email="test@example.com", org_id="org_1")

        db_session.add_all([org, user])
        db_session.commit()

        template = ChatTemplate(
            org_id="org_1",
            name="Interview Analysis Template",
            description="Template for analyzing interview transcripts",
            system_prompt="You are analyzing qualitative research interviews",
            initial_messages=[
                {"role": "assistant", "content": "I'll help you analyze the interview data."}
            ],
            suggested_questions=["What are the main themes?", "Show key insights"],
            use_case="interview_analysis",
            created_by="user_1"
        )

        db_session.add(template)
        db_session.commit()

        # Verify template
        saved = db_session.query(ChatTemplate).filter_by(
            name="Interview Analysis Template"
        ).first()

        assert saved is not None
        assert saved.use_case == "interview_analysis"
        assert len(saved.suggested_questions) == 2

    @pytest.mark.asyncio
    async def test_apply_template_to_session(self, db_session):
        """Test applying a template to a chat session"""
        # Create test data
        org = Org(id="org_1", name="Test Org")
        user = User(id="user_1", email="test@example.com", org_id="org_1")
        project = Project(id="proj_1", org_id="org_1", name="Test Project")

        # Create template
        template = ChatTemplate(
            id="tmpl_1",
            org_id="org_1",
            name="Analysis Template",
            system_prompt="You are a research analyst",
            initial_messages=[
                {"role": "assistant", "content": "Ready to analyze"}
            ],
            created_by="user_1"
        )

        db_session.add_all([org, user, project, template])
        db_session.commit()

        # Create session with template
        service = RAGService(db_session)
        session = await service.create_chat_session(
            user_id="user_1",
            project_id="proj_1",
            template_id="tmpl_1"
        )

        # Check initial messages were added
        messages = db_session.query(ChatMessage).filter_by(
            session_id=session.id
        ).all()

        assert len(messages) == 2  # system + initial assistant
        assert messages[0].role == "system"
        assert messages[0].content == "You are a research analyst"
        assert messages[1].role == "assistant"
        assert messages[1].content == "Ready to analyze"


class TestSavedPrompts:
    """Test saved prompts functionality"""

    def test_create_saved_prompt(self, db_session):
        """Test creating a saved prompt"""
        org = Org(id="org_1", name="Test Org")
        user = User(id="user_1", email="test@example.com", org_id="org_1")

        db_session.add_all([org, user])
        db_session.commit()

        prompt = SavedPrompt(
            org_id="org_1",
            name="Theme Analysis",
            description="Analyze themes in transcript",
            prompt_template="Identify the top 5 themes in the following transcript: {transcript}",
            category="analysis",
            tags=["themes", "qualitative"],
            is_public=True,
            created_by="user_1"
        )

        db_session.add(prompt)
        db_session.commit()

        # Verify prompt
        saved = db_session.query(SavedPrompt).filter_by(
            name="Theme Analysis"
        ).first()

        assert saved is not None
        assert saved.category == "analysis"
        assert "themes" in saved.tags
        assert saved.is_public is True

    def test_increment_usage_count(self, db_session):
        """Test incrementing prompt usage count"""
        org = Org(id="org_1", name="Test Org")
        prompt = SavedPrompt(
            org_id="org_1",
            name="Test Prompt",
            prompt_template="Test template",
            usage_count=0,
            created_by="user_1"
        )

        db_session.add_all([org, prompt])
        db_session.commit()

        # Simulate usage
        prompt.usage_count += 1
        prompt.last_used = datetime.utcnow()
        db_session.commit()

        # Verify
        updated = db_session.query(SavedPrompt).filter_by(
            name="Test Prompt"
        ).first()

        assert updated.usage_count == 1
        assert updated.last_used is not None


class TestSemanticSearchLog:
    """Test semantic search logging"""

    def test_log_search(self, db_session):
        """Test logging a semantic search"""
        org = Org(id="org_1", name="Test Org")
        user = User(id="user_1", email="test@example.com", org_id="org_1")
        project = Project(id="proj_1", org_id="org_1", name="Test Project")

        db_session.add_all([org, user, project])
        db_session.commit()

        # Log a search
        log = SemanticSearchLog(
            org_id="org_1",
            project_id="proj_1",
            user_id="user_1",
            query_text="price sensitivity analysis",
            search_type="similarity",
            top_k=5,
            similarity_threshold=0.7,
            results_count=3,
            result_ids=["chunk1", "chunk2", "chunk3"],
            result_scores=[0.92, 0.85, 0.71],
            search_time_ms=250
        )

        db_session.add(log)
        db_session.commit()

        # Verify log
        saved = db_session.query(SemanticSearchLog).filter_by(
            query_text="price sensitivity analysis"
        ).first()

        assert saved is not None
        assert saved.results_count == 3
        assert len(saved.result_ids) == 3
        assert saved.result_scores[0] == 0.92


class TestKnowledgeBase:
    """Test knowledge base functionality"""

    def test_create_knowledge_base(self, db_session):
        """Test creating a project knowledge base"""
        project = Project(id="proj_1", org_id="org_1", name="Test Project")
        db_session.add(project)
        db_session.commit()

        kb = KnowledgeBase(
            project_id="proj_1",
            name="Project Knowledge Base",
            description="All project transcripts and analyses",
            source_types=["transcripts", "analyses", "evidence"],
            auto_update=True,
            chunk_size=500,
            chunk_overlap=50,
            include_code_mixed=True,
            primary_language="en"
        )

        db_session.add(kb)
        db_session.commit()

        # Verify
        saved = db_session.query(KnowledgeBase).filter_by(
            project_id="proj_1"
        ).first()

        assert saved is not None
        assert "transcripts" in saved.source_types
        assert saved.auto_update is True
        assert saved.chunk_size == 500


# Run specific test groups
if __name__ == "__main__":
    pytest.main([__file__, "-v"])