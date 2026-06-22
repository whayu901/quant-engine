"""
Phase 3: Chat/RAG Models (Module C)
Vector storage, embeddings, and chat functionality
"""

from sqlalchemy import (
    Column, String, Text, JSON, DateTime, Integer, Float,
    ForeignKey, Boolean, Index, UniqueConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import ARRAY
from datetime import datetime
import enum

from .database import Base
from .models import _uid


class VectorStore(Base):
    """
    Stores document embeddings for semantic search
    Supports both PostgreSQL (with pgvector) and SQLite (JSON array)
    """
    __tablename__ = "vector_stores"

    id = Column(String(36), primary_key=True, default=_uid)
    org_id = Column(String(36), ForeignKey("orgs.id"), nullable=False)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)

    # Source information
    source_type = Column(String(32))  # transcript, document, analysis, evidence
    source_id = Column(String(36))  # ID of source object

    # Content chunk
    content = Column(Text, nullable=False)  # The actual text chunk
    chunk_index = Column(Integer)  # Position in original document

    # Embedding - stored as JSON array for SQLite compatibility
    # In PostgreSQL with pgvector, this would be: Column(Vector(1536))
    embedding = Column(JSON)  # List of floats [0.1, 0.2, ...]
    embedding_model = Column(String(64), default="text-embedding-ada-002")

    # Metadata for filtering
    meta_data = Column(JSON, default=dict)  # Additional metadata
    language = Column(String(10))  # Content language

    # SEA-specific metadata
    market = Column(String(32))  # Country/market code
    segment = Column(String(128))  # Customer segment

    created_at = Column(DateTime, default=datetime.utcnow)

    # Indexes
    __table_args__ = (
        Index('idx_vector_project', 'project_id'),
        Index('idx_vector_source', 'source_type', 'source_id'),
        UniqueConstraint('source_type', 'source_id', 'chunk_index', name='uq_source_chunk'),
    )


class ChatSession(Base):
    """
    Represents a chat conversation with the RAG system
    """
    __tablename__ = "chat_sessions"

    id = Column(String(36), primary_key=True, default=_uid)
    org_id = Column(String(36), ForeignKey("orgs.id"), nullable=False)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)

    title = Column(String(256))  # Auto-generated or user-defined
    description = Column(Text)

    # Session configuration
    context_window = Column(Integer, default=5)  # Number of messages to maintain in context
    temperature = Column(Float, default=0.7)
    model = Column(String(64), default="claude-3-sonnet")

    # Session state
    is_active = Column(Boolean, default=True)
    total_messages = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")

    # Indexes
    __table_args__ = (
        Index('idx_chat_session_user', 'user_id'),
        Index('idx_chat_session_project', 'project_id'),
    )


class ChatMessage(Base):
    """
    Individual messages in a chat session
    """
    __tablename__ = "chat_messages"

    id = Column(String(36), primary_key=True, default=_uid)
    session_id = Column(String(36), ForeignKey("chat_sessions.id"), nullable=False)

    # Message content
    role = Column(String(32), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)

    # Retrieved context (for RAG)
    retrieved_chunks = Column(JSON, default=list)  # List of chunk IDs used
    retrieval_scores = Column(JSON, default=list)  # Similarity scores

    # Metadata
    tokens_used = Column(Integer)
    processing_time_ms = Column(Integer)

    # SEA-specific features
    detected_language = Column(String(10))  # Auto-detect language
    code_mixed = Column(Boolean, default=False)  # Contains code-mixing

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    session = relationship("ChatSession", back_populates="messages")

    # Indexes
    __table_args__ = (
        Index('idx_chat_message_session', 'session_id', 'created_at'),
    )


class SavedPrompt(Base):
    """
    Reusable prompt templates for common queries
    """
    __tablename__ = "saved_prompts"

    id = Column(String(36), primary_key=True, default=_uid)
    org_id = Column(String(36), ForeignKey("orgs.id"), nullable=False)

    name = Column(String(256), nullable=False)
    description = Column(Text)
    prompt_template = Column(Text, nullable=False)

    # Categorization
    category = Column(String(64))  # analysis, summary, comparison, insight
    tags = Column(JSON, default=list)

    # Usage tracking
    usage_count = Column(Integer, default=0)
    last_used = Column(DateTime)

    # Sharing
    is_public = Column(Boolean, default=False)  # Available to all users in org
    created_by = Column(String(36), ForeignKey("users.id"))

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Indexes
    __table_args__ = (
        Index('idx_saved_prompt_org', 'org_id', 'is_public'),
        Index('idx_saved_prompt_category', 'category'),
    )


class SemanticSearchLog(Base):
    """
    Logs semantic search queries for analytics and improvement
    """
    __tablename__ = "semantic_search_logs"

    id = Column(String(36), primary_key=True, default=_uid)
    org_id = Column(String(36), ForeignKey("orgs.id"), nullable=False)
    project_id = Column(String(36), ForeignKey("projects.id"))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)

    # Query details
    query_text = Column(Text, nullable=False)
    query_embedding = Column(JSON)  # Store for analysis

    # Search parameters
    search_type = Column(String(32))  # similarity, hybrid, filtered
    filters_applied = Column(JSON)
    top_k = Column(Integer, default=5)
    similarity_threshold = Column(Float)

    # Results
    results_count = Column(Integer)
    result_ids = Column(JSON)  # IDs of returned chunks
    result_scores = Column(JSON)  # Similarity scores

    # Performance
    search_time_ms = Column(Integer)

    # User feedback (optional)
    was_helpful = Column(Boolean)
    feedback = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Indexes
    __table_args__ = (
        Index('idx_search_log_user', 'user_id'),
        Index('idx_search_log_project', 'project_id'),
        Index('idx_search_log_created', 'created_at'),
    )


class KnowledgeBase(Base):
    """
    Project-specific knowledge base for RAG context
    """
    __tablename__ = "knowledge_bases"

    id = Column(String(36), primary_key=True, default=_uid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)

    name = Column(String(256), nullable=False)
    description = Column(Text)

    # Content sources
    source_types = Column(JSON, default=list)  # transcripts, documents, analyses
    auto_update = Column(Boolean, default=True)  # Auto-add new content

    # Processing configuration
    chunk_size = Column(Integer, default=500)  # Characters per chunk
    chunk_overlap = Column(Integer, default=50)  # Overlap between chunks

    # Statistics
    total_chunks = Column(Integer, default=0)
    last_updated = Column(DateTime)

    # SEA-specific configuration
    include_code_mixed = Column(Boolean, default=True)
    primary_language = Column(String(10), default="en")

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Indexes
    __table_args__ = (
        Index('idx_knowledge_base_project', 'project_id'),
    )


class ChatTemplate(Base):
    """
    Pre-configured chat templates for specific research tasks
    """
    __tablename__ = "chat_templates"

    id = Column(String(36), primary_key=True, default=_uid)
    org_id = Column(String(36), ForeignKey("orgs.id"), nullable=False)

    name = Column(String(256), nullable=False)
    description = Column(Text)

    # Template configuration
    system_prompt = Column(Text)
    initial_messages = Column(JSON, default=list)  # Pre-loaded context
    suggested_questions = Column(JSON, default=list)  # Quick actions

    # Use case
    use_case = Column(String(64))  # interview_analysis, theme_exploration, comparison
    research_type = Column(String(64))  # qualitative, quantitative, mixed

    # SEA market templates
    market_specific = Column(Boolean, default=False)
    target_markets = Column(JSON, default=list)  # ['ID', 'SG', 'TH']

    # Usage
    usage_count = Column(Integer, default=0)
    rating = Column(Float)  # Average user rating

    is_default = Column(Boolean, default=False)  # System default template
    created_by = Column(String(36), ForeignKey("users.id"))

    created_at = Column(DateTime, default=datetime.utcnow)

    # Indexes
    __table_args__ = (
        Index('idx_chat_template_use_case', 'use_case'),
        Index('idx_chat_template_org', 'org_id'),
    )