"""
Phase 3: Embeddings Service
Generates and manages embeddings for semantic search and RAG
"""

import numpy as np
import hashlib
import json
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
import re

from .config import settings
from .models import Project, Transcript, TranscriptSegment
from .models_phase2 import Evidence, ContentAnalysisReport
from .models_phase3 import VectorStore, KnowledgeBase


class EmbeddingService:
    """
    Service for generating embeddings
    Uses OpenAI API in production, mock embeddings for development
    """

    def __init__(self, use_mock: bool = None):
        """Initialize embedding service"""
        # Check if API key exists in settings
        has_openai = hasattr(settings, 'openai_api_key') and settings.openai_api_key
        self.use_mock = use_mock if use_mock is not None else not has_openai
        self.model = "text-embedding-3-small"  # Updated to latest model
        self.dimension = 1536  # Dimension for text-embedding-3-small

        if not self.use_mock:
            try:
                import openai
                self.client = openai.Client(api_key=settings.openai_api_key)
                # Test the API key
                test_response = self.client.embeddings.create(
                    model=self.model,
                    input="test"
                )
                print(f"✅ OpenAI embeddings configured with {self.model}")
            except Exception as e:
                print(f"⚠️ OpenAI not configured: {e}. Using mock embeddings.")
                self.use_mock = True
        else:
            print("ℹ️ Using mock embeddings (no OpenAI API key configured)")

    def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for a single text
        Returns a vector of floats
        """
        if self.use_mock:
            return self._mock_embedding(text)

        try:
            response = self.client.embeddings.create(
                model=self.model,
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"Error generating embedding: {e}")
            return self._mock_embedding(text)

    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for multiple texts
        More efficient for batch processing
        """
        if self.use_mock:
            return [self._mock_embedding(text) for text in texts]

        try:
            response = self.client.embeddings.create(
                model=self.model,
                input=texts
            )
            return [data.embedding for data in response.data]
        except Exception as e:
            print(f"Error generating embeddings: {e}")
            return [self._mock_embedding(text) for text in texts]

    def _mock_embedding(self, text: str) -> List[float]:
        """
        Generate deterministic mock embedding based on text content
        Useful for development without API keys
        """
        # Create hash for deterministic generation
        text_hash = hashlib.sha256(text.encode()).hexdigest()
        seed = int(text_hash[:8], 16)
        np.random.seed(seed)

        # Generate normalized random vector
        embedding = np.random.randn(self.dimension)

        # Add some structure based on text features
        # This makes similar texts have somewhat similar embeddings

        # Feature 1: Text length
        length_feature = len(text) / 1000.0
        embedding[0:10] += length_feature

        # Feature 2: Common keywords for qualitative research
        keywords = {
            'price': 0, 'quality': 1, 'service': 2, 'experience': 3,
            'trust': 4, 'brand': 5, 'customer': 6, 'product': 7,
            'harga': 8, 'kualitas': 9, 'layanan': 10, 'pengalaman': 11
        }

        text_lower = text.lower()
        for word, idx in keywords.items():
            if word in text_lower:
                embedding[idx * 10:(idx + 1) * 10] += 0.5

        # Feature 3: Language detection (simple)
        if any(word in text_lower for word in ['saya', 'anda', 'ini', 'yang', 'untuk']):
            embedding[200:210] += 0.3  # Indonesian
        if any(word in text_lower for word in ['the', 'and', 'for', 'with', 'this']):
            embedding[210:220] += 0.3  # English

        # Normalize to unit vector
        embedding = embedding / np.linalg.norm(embedding)

        return embedding.tolist()

    def cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between two vectors"""
        vec1 = np.array(vec1)
        vec2 = np.array(vec2)

        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)

        if norm1 == 0 or norm2 == 0:
            return 0.0

        return float(dot_product / (norm1 * norm2))

    def search_similar(
        self,
        query_embedding: List[float],
        candidate_embeddings: List[Tuple[str, List[float]]],
        top_k: int = 5,
        threshold: float = 0.0
    ) -> List[Tuple[str, float]]:
        """
        Search for most similar embeddings
        Returns list of (id, similarity_score) tuples
        """
        similarities = []

        for candidate_id, candidate_embedding in candidate_embeddings:
            similarity = self.cosine_similarity(query_embedding, candidate_embedding)
            if similarity >= threshold:
                similarities.append((candidate_id, similarity))

        # Sort by similarity descending
        similarities.sort(key=lambda x: x[1], reverse=True)

        return similarities[:top_k]


class ChunkingService:
    """
    Service for splitting text into chunks for embedding
    """

    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 50):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk_text(self, text: str, preserve_sentences: bool = True) -> List[str]:
        """
        Split text into chunks
        Tries to preserve sentence boundaries if possible
        """
        if not text:
            return []

        if preserve_sentences:
            return self._chunk_by_sentences(text)
        else:
            return self._chunk_by_characters(text)

    def _chunk_by_sentences(self, text: str) -> List[str]:
        """Chunk text while preserving sentence boundaries"""
        # Split into sentences (simple approach)
        sentences = re.split(r'(?<=[.!?])\s+', text)

        chunks = []
        current_chunk = ""

        for sentence in sentences:
            # If adding this sentence exceeds chunk size
            if len(current_chunk) + len(sentence) > self.chunk_size:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = sentence
            else:
                current_chunk += " " + sentence if current_chunk else sentence

        # Add last chunk
        if current_chunk:
            chunks.append(current_chunk.strip())

        return chunks

    def _chunk_by_characters(self, text: str) -> List[str]:
        """Simple character-based chunking with overlap"""
        chunks = []
        start = 0

        while start < len(text):
            end = min(start + self.chunk_size, len(text))
            chunk = text[start:end]
            chunks.append(chunk)

            # Move forward with overlap
            start += self.chunk_size - self.chunk_overlap

        return chunks

    def chunk_transcript(self, segments: List[TranscriptSegment]) -> List[Dict[str, Any]]:
        """
        Chunk transcript segments intelligently
        Groups related segments together
        """
        chunks = []
        current_chunk = {
            'text': '',
            'speakers': set(),
            'start_time': None,
            'end_time': None,
            'segment_ids': []
        }

        for segment in segments:
            segment_text = f"{segment.speaker}: {segment.text}"

            # Check if adding this segment exceeds chunk size
            if len(current_chunk['text']) + len(segment_text) > self.chunk_size:
                if current_chunk['text']:
                    # Finalize current chunk
                    chunks.append({
                        'text': current_chunk['text'].strip(),
                        'speakers': list(current_chunk['speakers']),
                        'start_time': current_chunk['start_time'],
                        'end_time': current_chunk['end_time'],
                        'segment_ids': current_chunk['segment_ids']
                    })

                # Start new chunk
                current_chunk = {
                    'text': segment_text,
                    'speakers': {segment.speaker},
                    'start_time': segment.start_time if hasattr(segment, 'start_time') else None,
                    'end_time': segment.end_time if hasattr(segment, 'end_time') else None,
                    'segment_ids': [segment.id]
                }
            else:
                # Add to current chunk
                current_chunk['text'] += "\n" + segment_text
                current_chunk['speakers'].add(segment.speaker)
                if hasattr(segment, 'end_time'):
                    current_chunk['end_time'] = segment.end_time
                current_chunk['segment_ids'].append(segment.id)

        # Add final chunk
        if current_chunk['text']:
            chunks.append({
                'text': current_chunk['text'].strip(),
                'speakers': list(current_chunk['speakers']),
                'start_time': current_chunk['start_time'],
                'end_time': current_chunk['end_time'],
                'segment_ids': current_chunk['segment_ids']
            })

        return chunks


class VectorStoreService:
    """
    Service for managing vector store operations
    """

    def __init__(self, db: Session):
        self.db = db
        self.embedding_service = EmbeddingService()
        self.chunking_service = ChunkingService()

    async def index_transcript(self, transcript_id: str) -> int:
        """
        Index a transcript into vector store
        Returns number of chunks created
        """
        transcript = self.db.query(Transcript).filter_by(id=transcript_id).first()
        if not transcript:
            raise ValueError(f"Transcript {transcript_id} not found")

        # Get segments
        segments = self.db.query(TranscriptSegment).filter_by(
            transcript_id=transcript_id
        ).order_by(TranscriptSegment.segment_index).all()

        # Chunk the transcript
        chunks = self.chunking_service.chunk_transcript(segments)

        # Generate embeddings for each chunk
        chunk_texts = [chunk['text'] for chunk in chunks]
        embeddings = self.embedding_service.generate_embeddings(chunk_texts)

        # Store in vector store
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            vector_entry = VectorStore(
                org_id=transcript.org_id,
                project_id=transcript.project_id,
                source_type='transcript',
                source_id=transcript_id,
                content=chunk['text'],
                chunk_index=i,
                embedding=embedding,
                meta_data={
                    'speakers': chunk['speakers'],
                    'segment_ids': chunk['segment_ids'],
                    'start_time': chunk['start_time'],
                    'end_time': chunk['end_time']
                },
                language=transcript.language
            )
            self.db.add(vector_entry)

        self.db.commit()
        return len(chunks)

    async def index_evidence(self, evidence_id: str) -> int:
        """Index evidence into vector store"""
        evidence = self.db.query(Evidence).filter_by(id=evidence_id).first()
        if not evidence:
            raise ValueError(f"Evidence {evidence_id} not found")

        # Generate embedding
        embedding = self.embedding_service.generate_embedding(evidence.content)

        # Store in vector store
        vector_entry = VectorStore(
            org_id=evidence.org_id,
            project_id=evidence.project_id,
            source_type='evidence',
            source_id=evidence_id,
            content=evidence.content,
            chunk_index=0,
            embedding=embedding,
            meta_data={
                'evidence_type': evidence.evidence_type,
                'themes': evidence.themes,
                'speaker': evidence.speaker,
                'significance': evidence.significance
            },
            market=evidence.market
        )
        self.db.add(vector_entry)
        self.db.commit()

        return 1

    async def semantic_search(
        self,
        query: str,
        project_id: Optional[str] = None,
        source_types: Optional[List[str]] = None,
        top_k: int = 5,
        threshold: float = 0.0
    ) -> List[Dict[str, Any]]:
        """
        Perform semantic search across vector store
        Returns relevant chunks with similarity scores
        """
        # Generate query embedding
        query_embedding = self.embedding_service.generate_embedding(query)

        # Build query
        query_filter = []
        if project_id:
            query_filter.append(VectorStore.project_id == project_id)
        if source_types:
            query_filter.append(VectorStore.source_type.in_(source_types))

        # Get candidates from database
        candidates_query = self.db.query(VectorStore)
        if query_filter:
            candidates_query = candidates_query.filter(*query_filter)

        candidates = candidates_query.all()

        # Prepare for similarity search
        candidate_embeddings = [
            (c.id, c.embedding) for c in candidates
        ]

        # Search for similar
        results = self.embedding_service.search_similar(
            query_embedding,
            candidate_embeddings,
            top_k=top_k,
            threshold=threshold
        )

        # Enhance results with full data
        enhanced_results = []
        for chunk_id, similarity in results:
            chunk = next(c for c in candidates if c.id == chunk_id)
            enhanced_results.append({
                'id': chunk.id,
                'content': chunk.content,
                'similarity': similarity,
                'source_type': chunk.source_type,
                'source_id': chunk.source_id,
                'metadata': chunk.meta_data
            })

        return enhanced_results

    async def find_related_content(
        self,
        content_id: str,
        source_type: str,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """Find content related to a specific piece of content"""
        # Get the content's embedding
        vector_entry = self.db.query(VectorStore).filter_by(
            source_id=content_id,
            source_type=source_type
        ).first()

        if not vector_entry:
            return []

        # Search for similar content
        candidates = self.db.query(VectorStore).filter(
            VectorStore.id != vector_entry.id,
            VectorStore.project_id == vector_entry.project_id
        ).all()

        candidate_embeddings = [
            (c.id, c.embedding) for c in candidates
        ]

        results = self.embedding_service.search_similar(
            vector_entry.embedding,
            candidate_embeddings,
            top_k=top_k
        )

        # Enhance results
        enhanced_results = []
        for chunk_id, similarity in results:
            chunk = next(c for c in candidates if c.id == chunk_id)
            enhanced_results.append({
                'id': chunk.id,
                'content': chunk.content,
                'similarity': similarity,
                'source_type': chunk.source_type,
                'source_id': chunk.source_id
            })

        return enhanced_results