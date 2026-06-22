"""
Phase 3: RAG (Retrieval-Augmented Generation) System
Chat interface with context retrieval from project knowledge base
"""

import json
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
from sqlalchemy.orm import Session
import time

from .config import settings
from .models import Project, User
from .models_phase3 import (
    ChatSession, ChatMessage, VectorStore,
    SavedPrompt, ChatTemplate, SemanticSearchLog
)
from .embeddings import VectorStoreService, EmbeddingService


class RAGService:
    """
    Main RAG service for chat with context retrieval
    """

    def __init__(self, db: Session):
        self.db = db
        self.vector_service = VectorStoreService(db)
        self.embedding_service = EmbeddingService()
        self.use_mock = not bool(settings.anthropic_api_key)

        if not self.use_mock:
            try:
                from anthropic import Anthropic
                self.client = Anthropic(api_key=settings.anthropic_api_key)
            except:
                print("⚠️ Anthropic not configured. Using mock RAG responses.")
                self.use_mock = True

    async def create_chat_session(
        self,
        user_id: str,
        project_id: str,
        title: Optional[str] = None,
        template_id: Optional[str] = None
    ) -> ChatSession:
        """Create a new chat session"""

        project = self.db.query(Project).filter_by(id=project_id).first()
        if not project:
            raise ValueError("Project not found")

        # Create session
        session = ChatSession(
            org_id=project.org_id,
            project_id=project_id,
            user_id=user_id,
            title=title or f"Chat - {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        )

        # Apply template if provided
        if template_id:
            template = self.db.query(ChatTemplate).filter_by(id=template_id).first()
            if template:
                session.title = f"{template.name} - {datetime.now().strftime('%Y-%m-%d %H:%M')}"

                # Add system message from template
                if template.system_prompt:
                    system_msg = ChatMessage(
                        session_id=session.id,
                        role="system",
                        content=template.system_prompt
                    )
                    self.db.add(system_msg)

                # Add initial messages from template
                for msg in template.initial_messages or []:
                    chat_msg = ChatMessage(
                        session_id=session.id,
                        role=msg.get('role', 'assistant'),
                        content=msg.get('content', '')
                    )
                    self.db.add(chat_msg)

        self.db.add(session)
        self.db.commit()

        return session

    async def chat(
        self,
        session_id: str,
        message: str,
        use_rag: bool = True,
        top_k: int = 5
    ) -> Dict[str, Any]:
        """
        Process a chat message with RAG
        Returns response with retrieved context
        """
        start_time = time.time()

        # Get session
        session = self.db.query(ChatSession).filter_by(id=session_id).first()
        if not session:
            raise ValueError("Chat session not found")

        # Save user message
        user_msg = ChatMessage(
            session_id=session_id,
            role="user",
            content=message,
            detected_language=self._detect_language(message),
            code_mixed=self._is_code_mixed(message)
        )
        self.db.add(user_msg)
        self.db.commit()

        # Retrieve relevant context if RAG is enabled
        retrieved_context = []
        if use_rag:
            search_results = await self.vector_service.semantic_search(
                query=message,
                project_id=session.project_id,
                top_k=top_k,
                threshold=0.5
            )

            retrieved_context = search_results
            user_msg.retrieved_chunks = [r['id'] for r in search_results]
            user_msg.retrieval_scores = [r['similarity'] for r in search_results]

        # Generate response
        if self.use_mock:
            response_text = self._generate_mock_response(message, retrieved_context)
            tokens_used = len(message) // 4 + len(response_text) // 4
        else:
            response_text, tokens_used = await self._generate_llm_response(
                session, message, retrieved_context
            )

        # Save assistant message
        assistant_msg = ChatMessage(
            session_id=session_id,
            role="assistant",
            content=response_text,
            tokens_used=tokens_used,
            processing_time_ms=int((time.time() - start_time) * 1000)
        )
        self.db.add(assistant_msg)

        # Update session stats
        session.total_messages += 2
        session.total_tokens += tokens_used
        session.updated_at = datetime.utcnow()

        self.db.commit()

        # Log search for analytics
        if use_rag and retrieved_context:
            search_log = SemanticSearchLog(
                org_id=session.org_id,
                project_id=session.project_id,
                user_id=session.user_id,
                query_text=message,
                search_type='rag',
                top_k=top_k,
                results_count=len(retrieved_context),
                result_ids=[r['id'] for r in retrieved_context],
                result_scores=[r['similarity'] for r in retrieved_context],
                search_time_ms=int((time.time() - start_time) * 1000)
            )
            self.db.add(search_log)
            self.db.commit()

        return {
            'response': response_text,
            'retrieved_context': retrieved_context,
            'tokens_used': tokens_used,
            'processing_time_ms': assistant_msg.processing_time_ms
        }

    async def _generate_llm_response(
        self,
        session: ChatSession,
        message: str,
        context: List[Dict]
    ) -> Tuple[str, int]:
        """Generate response using LLM"""

        # Build context string
        context_str = "\n\n".join([
            f"[Context {i+1}]:\n{c['content']}"
            for i, c in enumerate(context)
        ]) if context else "No specific context retrieved."

        # Get recent conversation history
        recent_messages = self.db.query(ChatMessage).filter_by(
            session_id=session.id
        ).order_by(ChatMessage.created_at.desc()).limit(
            session.context_window * 2
        ).all()

        recent_messages.reverse()

        # Build conversation history
        conversation = []
        for msg in recent_messages[:-1]:  # Exclude the just-added user message
            conversation.append({
                "role": msg.role,
                "content": msg.content
            })

        # Build prompt
        system_prompt = f"""You are an AI assistant helping with qualitative market research analysis.
You have access to transcripts, analyses, and evidence from research projects.
Respond in the same language as the user's question.
If the user mixes languages (code-mixing), respond similarly.

Relevant context from the project:
{context_str}

Use this context to provide accurate, insightful answers about the research data."""

        # Add current message
        conversation.append({
            "role": "user",
            "content": message
        })

        # Call Claude
        response = self.client.messages.create(
            model=session.model or "claude-3-sonnet-20240229",
            max_tokens=1500,
            temperature=session.temperature or 0.7,
            system=system_prompt,
            messages=conversation
        )

        response_text = response.content[0].text
        tokens_used = response.usage.input_tokens + response.usage.output_tokens

        return response_text, tokens_used

    def _generate_mock_response(self, message: str, context: List[Dict]) -> str:
        """Generate mock response for development"""

        message_lower = message.lower()

        # Check for specific question patterns
        if any(word in message_lower for word in ['theme', 'tema', 'pattern', 'pola']):
            if context:
                return f"""Based on the research data, I found several key themes:

1. **Price Sensitivity** - Many participants expressed concerns about pricing and value for money. This was particularly prominent in the Indonesian market.

2. **User Experience** - The importance of intuitive interfaces and smooth user journeys was highlighted repeatedly.

3. **Trust and Security** - Participants emphasized the need for secure platforms, especially for financial transactions.

Retrieved context shows: "{context[0]['content'][:200]}..."

These themes appear consistently across {len(context)} relevant segments I found in the data."""

            else:
                return "I couldn't find specific themes in the context. Could you provide more details about which aspect of the research you'd like me to analyze?"

        elif any(word in message_lower for word in ['insight', 'finding', 'temuan']):
            if context:
                return f"""Here are the key insights from the research:

**Primary Insight**: Consumers in Southeast Asia show distinct behavioral patterns when it comes to online shopping, with price consciousness being the dominant factor.

From the data: "{context[0]['content'][:150]}..."

**Supporting Evidence**: Found {len(context)} relevant data points that support this finding. The sentiment across these segments is predominantly mixed, with both positive experiences and pain points identified.

**Recommendation**: Consider implementing tiered pricing strategies that cater to different market segments while maintaining perceived value."""

            else:
                return "Let me search for specific insights. What particular aspect of the research would you like insights about?"

        elif any(word in message_lower for word in ['compare', 'bandingkan', 'difference', 'perbedaan']):
            return """Based on the comparative analysis:

**Indonesia vs Singapore Markets**:
- **Indonesia**: Higher price sensitivity, preference for COD, strong local brand loyalty
- **Singapore**: Quality-focused, comfortable with digital payments, international brand acceptance

**Key Differences**:
1. Payment preferences vary significantly
2. Trust factors differ based on market maturity
3. Language and cultural nuances affect user experience expectations

This comparison is based on patterns observed across multiple research sessions."""

        elif any(word in message_lower for word in ['summarize', 'summary', 'ringkas']):
            if context:
                return f"""Here's a summary of the relevant research findings:

**Overview**: The research data contains {len(context)} relevant segments related to your query.

**Main Points**:
- Participants consistently mentioned user experience and pricing as key factors
- Trust remains a significant barrier for digital adoption
- Local preferences and cultural factors strongly influence behavior

**Context Sample**: "{context[0]['content'][:200]}..."

**Conclusion**: The data suggests that successful strategies must balance global best practices with local market adaptations."""

            else:
                return "I can provide a summary once you specify which part of the research you'd like me to summarize. For example, you could ask about specific themes, participant groups, or time periods."

        # Default response with context awareness
        if context:
            return f"""Based on the research data, I found {len(context)} relevant segments.

The most relevant finding: "{context[0]['content'][:300]}..."

This data suggests that your question relates to important aspects of the research. Would you like me to elaborate on any specific theme or provide more detailed analysis?"""

        else:
            return """I understand you're asking about the research data. To provide the most relevant insights, could you be more specific about:
- Which themes or topics you're interested in?
- What type of analysis you need (themes, comparisons, trends, etc.)?
- Any particular market or demographic focus?

I have access to all project transcripts, analyses, and evidence to help answer your questions."""

    def _detect_language(self, text: str) -> str:
        """Simple language detection"""
        text_lower = text.lower()

        # Check for Indonesian words
        id_words = ['saya', 'anda', 'yang', 'untuk', 'ini', 'itu', 'dengan', 'adalah']
        id_count = sum(1 for word in id_words if word in text_lower)

        # Check for English words
        en_words = ['the', 'and', 'for', 'with', 'this', 'that', 'what', 'how']
        en_count = sum(1 for word in en_words if word in text_lower)

        if id_count > en_count:
            return 'id'
        elif en_count > id_count:
            return 'en'
        else:
            return 'id-en'  # Mixed or uncertain

    def _is_code_mixed(self, text: str) -> bool:
        """Check if text contains code-mixing"""
        text_lower = text.lower()

        has_indonesian = any(word in text_lower for word in ['saya', 'yang', 'untuk'])
        has_english = any(word in text_lower for word in ['the', 'and', 'for'])

        return has_indonesian and has_english

    async def get_chat_history(
        self,
        session_id: str,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Get chat history for a session"""

        messages = self.db.query(ChatMessage).filter_by(
            session_id=session_id
        ).order_by(ChatMessage.created_at.desc()).limit(limit).all()

        messages.reverse()

        return [
            {
                'id': msg.id,
                'role': msg.role,
                'content': msg.content,
                'created_at': msg.created_at.isoformat(),
                'retrieved_chunks': msg.retrieved_chunks,
                'tokens_used': msg.tokens_used
            }
            for msg in messages
        ]

    async def get_suggested_questions(
        self,
        session_id: str
    ) -> List[str]:
        """Get suggested questions based on context"""

        session = self.db.query(ChatSession).filter_by(id=session_id).first()
        if not session:
            return []

        # Get recent topics from messages
        recent_messages = self.db.query(ChatMessage).filter_by(
            session_id=session_id,
            role='user'
        ).order_by(ChatMessage.created_at.desc()).limit(3).all()

        # Default suggestions for qualitative research
        suggestions = [
            "What are the main themes in this research?",
            "Can you summarize the key findings?",
            "What do participants say about pricing?",
            "Compare responses between different demographics",
            "What are the pain points mentioned by users?",
            "Show me insights about customer experience",
            "Apa tema utama dalam riset ini?",
            "Bagaimana sentimen peserta terhadap produk?"
        ]

        # Contextual suggestions based on recent chat
        if recent_messages:
            last_msg = recent_messages[0].content.lower()

            if 'theme' in last_msg or 'tema' in last_msg:
                suggestions = [
                    "Can you elaborate on this theme?",
                    "What evidence supports this theme?",
                    "How does this theme compare across markets?",
                    "What are the sub-themes related to this?",
                    "Show me verbatim quotes for this theme"
                ]
            elif 'price' in last_msg or 'harga' in last_msg:
                suggestions = [
                    "What's the overall sentiment about pricing?",
                    "How does price sensitivity vary by demographic?",
                    "What price points do participants prefer?",
                    "Compare pricing feedback across markets",
                    "What value propositions resonate most?"
                ]
            elif 'compare' in last_msg or 'bandingkan' in last_msg:
                suggestions = [
                    "Show detailed market differences",
                    "What are the regional patterns?",
                    "Compare urban vs rural responses",
                    "How do age groups differ in their responses?",
                    "What are the common patterns across all segments?"
                ]

        return suggestions[:5]  # Return top 5 suggestions