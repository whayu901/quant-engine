"""
WebSocket Routes for Real-time Collaboration
Phase 3 Implementation
"""

import json
import asyncio
from typing import Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query, HTTPException
from sqlalchemy.orm import Session
import logging

from ..database import get_db
from ..models import User, Project
from ..deps import get_current_user_ws
from ..websocket_manager import manager, WebSocketHandler

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ws", tags=["websocket"])


@router.websocket("/project/{project_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    project_id: str,
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    WebSocket endpoint for real-time project collaboration

    Features:
    - Real-time presence tracking
    - Typing indicators
    - Live updates for comments, analysis, grids
    - Cursor position sharing
    - AI response streaming
    """
    user = None

    try:
        # Authenticate user from token
        user = await get_current_user_ws(token, db)
        if not user:
            await websocket.close(code=4001, reason="Unauthorized")
            return

        # Verify project access
        project = db.query(Project).filter_by(
            id=project_id,
            org_id=user.org_id
        ).first()

        if not project:
            await websocket.close(code=4004, reason="Project not found")
            return

        # Connect to WebSocket manager
        await manager.connect(websocket, project_id, user.id, user.email)

        # Handle incoming messages
        while True:
            try:
                # Receive message
                data = await websocket.receive_text()
                message = json.loads(data)

                # Process message
                await WebSocketHandler.handle_message(
                    websocket, project_id, user.id, message
                )

            except WebSocketDisconnect:
                break
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": "Invalid JSON format"
                }))
            except Exception as e:
                logger.error(f"WebSocket error: {e}")
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": "Internal server error"
                }))

    except Exception as e:
        logger.error(f"WebSocket connection error: {e}")

    finally:
        # Clean up on disconnect
        manager.disconnect(websocket)
        if user:
            await manager.broadcast_user_left(project_id, user.id, user.email)


@router.websocket("/chat/{project_id}/stream")
async def chat_stream_endpoint(
    websocket: WebSocket,
    project_id: str,
    session_id: str = Query(...),
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    WebSocket endpoint for streaming AI chat responses
    Provides real-time streaming of AI-generated content
    """
    user = None

    try:
        # Authenticate user
        user = await get_current_user_ws(token, db)
        if not user:
            await websocket.close(code=4001, reason="Unauthorized")
            return

        # Verify project access
        project = db.query(Project).filter_by(
            id=project_id,
            org_id=user.org_id
        ).first()

        if not project:
            await websocket.close(code=4004, reason="Project not found")
            return

        await websocket.accept()

        # Send initial connection confirmation
        await websocket.send_text(json.dumps({
            "type": "connected",
            "session_id": session_id,
            "user_id": user.id
        }))

        # Handle streaming messages
        while True:
            try:
                data = await websocket.receive_text()
                message = json.loads(data)

                if message.get("type") == "chat_message":
                    # Process chat message and stream response
                    content = message.get("content", "")

                    # Create response queue for streaming
                    response_queue = asyncio.Queue()

                    # Start AI processing in background
                    asyncio.create_task(
                        process_ai_chat_stream(
                            project_id, session_id, content, response_queue, db
                        )
                    )

                    # Stream response chunks
                    await stream_response_to_client(websocket, response_queue)

                elif message.get("type") == "stop_generation":
                    # Handle stop generation request
                    await websocket.send_text(json.dumps({
                        "type": "generation_stopped"
                    }))

            except WebSocketDisconnect:
                break
            except Exception as e:
                logger.error(f"Chat stream error: {e}")
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": str(e)
                }))

    except Exception as e:
        logger.error(f"Chat stream connection error: {e}")

    finally:
        if websocket.client_state.value == 1:  # Connected
            await websocket.close()


async def process_ai_chat_stream(
    project_id: str,
    session_id: str,
    content: str,
    response_queue: asyncio.Queue,
    db: Session
):
    """
    Process AI chat message and stream response chunks
    This simulates streaming for development (replace with actual AI streaming)
    """
    try:
        # Simulate AI response streaming
        response_text = f"This is a simulated streaming response to: {content}"
        words = response_text.split()

        for i, word in enumerate(words):
            await response_queue.put({
                "chunk": word + " ",
                "index": i,
                "done": False
            })
            await asyncio.sleep(0.1)  # Simulate processing time

        # Send completion signal
        await response_queue.put({
            "chunk": "",
            "index": len(words),
            "done": True
        })

    except Exception as e:
        logger.error(f"AI processing error: {e}")
        await response_queue.put({
            "error": str(e),
            "done": True
        })


async def stream_response_to_client(websocket: WebSocket, response_queue: asyncio.Queue):
    """Stream AI response chunks to WebSocket client"""
    try:
        while True:
            chunk_data = await response_queue.get()

            if chunk_data.get("error"):
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": chunk_data["error"]
                }))
                break

            await websocket.send_text(json.dumps({
                "type": "stream_chunk",
                "content": chunk_data.get("chunk", ""),
                "index": chunk_data.get("index", 0),
                "done": chunk_data.get("done", False)
            }))

            if chunk_data.get("done"):
                break

    except Exception as e:
        logger.error(f"Streaming error: {e}")
        await websocket.send_text(json.dumps({
            "type": "error",
            "message": "Streaming failed"
        }))


@router.websocket("/notifications")
async def notifications_endpoint(
    websocket: WebSocket,
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    WebSocket endpoint for real-time notifications
    Delivers instant notifications for mentions, comments, completions
    """
    user = None

    try:
        # Authenticate user
        user = await get_current_user_ws(token, db)
        if not user:
            await websocket.close(code=4001, reason="Unauthorized")
            return

        await websocket.accept()

        # Register for notifications
        notification_queue = asyncio.Queue()

        # Keep connection alive and send notifications
        while True:
            try:
                # Check for notifications (with timeout to allow periodic checks)
                notification = await asyncio.wait_for(
                    notification_queue.get(),
                    timeout=30.0
                )

                await websocket.send_text(json.dumps({
                    "type": "notification",
                    "data": notification
                }))

            except asyncio.TimeoutError:
                # Send ping to keep connection alive
                await websocket.send_text(json.dumps({"type": "ping"}))

            except WebSocketDisconnect:
                break

    except Exception as e:
        logger.error(f"Notification WebSocket error: {e}")

    finally:
        if websocket.client_state.value == 1:
            await websocket.close()