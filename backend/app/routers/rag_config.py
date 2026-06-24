"""
RAG Configuration API endpoints
For managing API keys and testing integration
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from ..deps import get_db, get_current_user
from ..models import User
from ..config import settings
from ..embeddings import EmbeddingService
from ..rag import RAGService


router = APIRouter(prefix="/api/v1/rag-config", tags=["rag-config"])


class TestAPIRequest(BaseModel):
    openai_key: Optional[str] = None
    anthropic_key: Optional[str] = None


class APIStatusResponse(BaseModel):
    openai: dict
    anthropic: dict
    embeddings_mode: str
    chat_mode: str


@router.get("/status")
async def get_api_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current API configuration status"""

    # Admin only
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")

    # Check OpenAI
    openai_status = {
        'configured': hasattr(settings, 'openai_api_key') and bool(settings.openai_api_key),
        'model': 'text-embedding-3-small',
        'working': False
    }

    if openai_status['configured']:
        try:
            embedding_service = EmbeddingService(use_mock=False)
            if not embedding_service.use_mock:
                openai_status['working'] = True
        except:
            pass

    # Check Anthropic
    anthropic_status = {
        'configured': hasattr(settings, 'anthropic_api_key') and bool(settings.anthropic_api_key),
        'model': 'claude-3-sonnet-20240229',
        'working': False
    }

    if anthropic_status['configured']:
        try:
            rag_service = RAGService(db)
            if not rag_service.use_mock:
                anthropic_status['working'] = True
        except:
            pass

    return APIStatusResponse(
        openai=openai_status,
        anthropic=anthropic_status,
        embeddings_mode='openai' if openai_status['working'] else 'mock',
        chat_mode='claude' if anthropic_status['working'] else 'mock'
    )


@router.post("/test")
async def test_api_keys(
    request: TestAPIRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Test API keys without saving them"""

    # Admin only
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")

    results = {}

    # Test OpenAI
    if request.openai_key:
        try:
            import openai
            client = openai.Client(api_key=request.openai_key)
            response = client.embeddings.create(
                model="text-embedding-3-small",
                input="test"
            )
            results['openai'] = {
                'status': 'success',
                'message': 'OpenAI API key is valid',
                'model': 'text-embedding-3-small',
                'dimension': len(response.data[0].embedding)
            }
        except Exception as e:
            results['openai'] = {
                'status': 'error',
                'message': str(e)
            }

    # Test Anthropic
    if request.anthropic_key:
        try:
            from anthropic import Anthropic
            client = Anthropic(api_key=request.anthropic_key)
            response = client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=10,
                messages=[{"role": "user", "content": "test"}]
            )
            results['anthropic'] = {
                'status': 'success',
                'message': 'Anthropic API key is valid',
                'model': 'claude-3-haiku-20240307'
            }
        except Exception as e:
            results['anthropic'] = {
                'status': 'error',
                'message': str(e)
            }

    return results


@router.post("/test-embedding")
async def test_embedding_generation(
    text: str = "This is a test text for embedding generation",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Test embedding generation with current configuration"""

    embedding_service = EmbeddingService()

    try:
        embedding = embedding_service.generate_embedding(text)

        return {
            'status': 'success',
            'mode': 'openai' if not embedding_service.use_mock else 'mock',
            'text_length': len(text),
            'embedding_dimension': len(embedding),
            'embedding_sample': embedding[:5]  # First 5 values
        }
    except Exception as e:
        return {
            'status': 'error',
            'error': str(e)
        }


@router.post("/test-chat")
async def test_chat_generation(
    message: str = "What are the main themes in qualitative research?",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Test chat response generation with current configuration"""

    rag_service = RAGService(db)

    try:
        # Create a temporary mock context
        mock_context = [
            {
                'content': 'Customer satisfaction is a key theme',
                'similarity': 0.85
            }
        ]

        if rag_service.use_mock:
            response = rag_service._generate_mock_response(message, mock_context)
        else:
            # Use real API
            response, tokens = await rag_service._generate_llm_response(
                session=None,  # Will need to handle this
                message=message,
                context=mock_context
            )

        return {
            'status': 'success',
            'mode': 'claude' if not rag_service.use_mock else 'mock',
            'message_length': len(message),
            'response_preview': response[:200] + '...' if len(response) > 200 else response
        }
    except Exception as e:
        return {
            'status': 'error',
            'error': str(e)
        }