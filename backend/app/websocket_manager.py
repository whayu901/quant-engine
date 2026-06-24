"""
WebSocket Manager for Real-time Collaboration
Handles WebSocket connections, broadcasting, and real-time features
"""

import json
import asyncio
from typing import Dict, Set, List, Optional, Any
from datetime import datetime
from fastapi import WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections for real-time collaboration"""

    def __init__(self):
        # Active connections by project_id
        self.active_connections: Dict[str, Set[WebSocket]] = {}

        # User presence tracking
        self.user_presence: Dict[str, Dict[str, Any]] = {}

        # Connection to user mapping
        self.connection_users: Dict[WebSocket, Dict[str, Any]] = {}

        # Typing indicators
        self.typing_users: Dict[str, Set[str]] = {}

    async def connect(self, websocket: WebSocket, project_id: str, user_id: str, user_name: str):
        """Accept WebSocket connection and add to project room"""
        await websocket.accept()

        # Add to project connections
        if project_id not in self.active_connections:
            self.active_connections[project_id] = set()
            self.user_presence[project_id] = {}
            self.typing_users[project_id] = set()

        self.active_connections[project_id].add(websocket)

        # Track user presence
        user_info = {
            "user_id": user_id,
            "user_name": user_name,
            "project_id": project_id,
            "connected_at": datetime.utcnow().isoformat(),
            "status": "online"
        }

        self.user_presence[project_id][user_id] = user_info
        self.connection_users[websocket] = user_info

        # Notify others of new user
        await self.broadcast_user_joined(project_id, user_id, user_name)

        # Send current presence list to new user
        await self.send_presence_list(websocket, project_id)

        logger.info(f"User {user_name} ({user_id}) connected to project {project_id}")

    def disconnect(self, websocket: WebSocket):
        """Remove WebSocket connection and update presence"""
        if websocket not in self.connection_users:
            return

        user_info = self.connection_users[websocket]
        project_id = user_info["project_id"]
        user_id = user_info["user_id"]
        user_name = user_info["user_name"]

        # Remove from active connections
        if project_id in self.active_connections:
            self.active_connections[project_id].discard(websocket)

            # Clean up empty projects
            if not self.active_connections[project_id]:
                del self.active_connections[project_id]
                del self.user_presence[project_id]
                del self.typing_users[project_id]
            else:
                # Remove user presence
                if user_id in self.user_presence[project_id]:
                    del self.user_presence[project_id][user_id]

                # Remove from typing indicators
                self.typing_users[project_id].discard(user_id)

        # Remove connection mapping
        del self.connection_users[websocket]

        logger.info(f"User {user_name} ({user_id}) disconnected from project {project_id}")

    async def send_personal_message(self, message: str, websocket: WebSocket):
        """Send message to specific WebSocket connection"""
        try:
            await websocket.send_text(message)
        except Exception as e:
            logger.error(f"Error sending personal message: {e}")

    async def broadcast(self, project_id: str, message: Dict[str, Any], exclude: Optional[WebSocket] = None):
        """Broadcast message to all connections in a project"""
        if project_id not in self.active_connections:
            return

        message_str = json.dumps(message)
        disconnected = []

        for connection in self.active_connections[project_id]:
            if connection != exclude:
                try:
                    await connection.send_text(message_str)
                except Exception as e:
                    logger.error(f"Error broadcasting message: {e}")
                    disconnected.append(connection)

        # Clean up disconnected sockets
        for conn in disconnected:
            self.disconnect(conn)

    async def broadcast_user_joined(self, project_id: str, user_id: str, user_name: str):
        """Notify all users in project that a new user joined"""
        message = {
            "type": "user_joined",
            "user_id": user_id,
            "user_name": user_name,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.broadcast(project_id, message)

    async def broadcast_user_left(self, project_id: str, user_id: str, user_name: str):
        """Notify all users in project that a user left"""
        message = {
            "type": "user_left",
            "user_id": user_id,
            "user_name": user_name,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.broadcast(project_id, message)

    async def send_presence_list(self, websocket: WebSocket, project_id: str):
        """Send list of online users to a specific connection"""
        if project_id not in self.user_presence:
            return

        users = list(self.user_presence[project_id].values())
        message = {
            "type": "presence_list",
            "users": users,
            "timestamp": datetime.utcnow().isoformat()
        }

        await self.send_personal_message(json.dumps(message), websocket)

    async def handle_typing_indicator(self, project_id: str, user_id: str, user_name: str, is_typing: bool):
        """Handle typing indicator updates"""
        if project_id not in self.typing_users:
            self.typing_users[project_id] = set()

        if is_typing:
            self.typing_users[project_id].add(user_id)
        else:
            self.typing_users[project_id].discard(user_id)

        # Broadcast typing status
        message = {
            "type": "typing_indicator",
            "user_id": user_id,
            "user_name": user_name,
            "is_typing": is_typing,
            "timestamp": datetime.utcnow().isoformat()
        }

        await self.broadcast(project_id, message)

    async def broadcast_comment_update(self, project_id: str, comment_data: Dict[str, Any]):
        """Broadcast new/updated comment to all users in project"""
        message = {
            "type": "comment_update",
            "data": comment_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.broadcast(project_id, message)

    async def broadcast_analysis_update(self, project_id: str, analysis_data: Dict[str, Any]):
        """Broadcast analysis status update"""
        message = {
            "type": "analysis_update",
            "data": analysis_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.broadcast(project_id, message)

    async def broadcast_grid_update(self, project_id: str, grid_data: Dict[str, Any]):
        """Broadcast grid cell update for real-time collaboration"""
        message = {
            "type": "grid_update",
            "data": grid_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.broadcast(project_id, message)

    async def stream_ai_response(self, project_id: str, user_id: str, response_chunks: asyncio.Queue):
        """Stream AI response chunks to users in real-time"""
        chunk_id = 0

        while True:
            try:
                chunk = await asyncio.wait_for(response_chunks.get(), timeout=30.0)

                if chunk is None:  # End of stream
                    message = {
                        "type": "ai_stream_end",
                        "user_id": user_id,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    await self.broadcast(project_id, message)
                    break

                message = {
                    "type": "ai_stream_chunk",
                    "user_id": user_id,
                    "chunk_id": chunk_id,
                    "content": chunk,
                    "timestamp": datetime.utcnow().isoformat()
                }

                await self.broadcast(project_id, message)
                chunk_id += 1

            except asyncio.TimeoutError:
                logger.warning(f"AI stream timeout for user {user_id} in project {project_id}")
                break
            except Exception as e:
                logger.error(f"Error streaming AI response: {e}")
                break

    def get_online_users(self, project_id: str) -> List[Dict[str, Any]]:
        """Get list of online users for a project"""
        if project_id not in self.user_presence:
            return []
        return list(self.user_presence[project_id].values())

    def get_typing_users(self, project_id: str) -> List[str]:
        """Get list of users currently typing"""
        if project_id not in self.typing_users:
            return []
        return list(self.typing_users[project_id])

    def is_user_online(self, project_id: str, user_id: str) -> bool:
        """Check if a specific user is online"""
        return (project_id in self.user_presence and
                user_id in self.user_presence[project_id])

    def get_project_connection_count(self, project_id: str) -> int:
        """Get number of active connections for a project"""
        if project_id not in self.active_connections:
            return 0
        return len(self.active_connections[project_id])


# Global connection manager instance
manager = ConnectionManager()


class WebSocketHandler:
    """Handles WebSocket message processing"""

    @staticmethod
    async def handle_message(websocket: WebSocket, project_id: str, user_id: str, message: Dict[str, Any]):
        """Process incoming WebSocket messages"""
        msg_type = message.get("type")

        if msg_type == "ping":
            # Heartbeat to keep connection alive
            await manager.send_personal_message(json.dumps({"type": "pong"}), websocket)

        elif msg_type == "typing":
            # Handle typing indicator
            is_typing = message.get("is_typing", False)
            user_name = message.get("user_name", "Unknown")
            await manager.handle_typing_indicator(project_id, user_id, user_name, is_typing)

        elif msg_type == "cursor_position":
            # Share cursor position for collaborative editing
            cursor_data = {
                "type": "cursor_update",
                "user_id": user_id,
                "position": message.get("position"),
                "timestamp": datetime.utcnow().isoformat()
            }
            await manager.broadcast(project_id, cursor_data, exclude=websocket)

        elif msg_type == "selection":
            # Share text selection for collaborative awareness
            selection_data = {
                "type": "selection_update",
                "user_id": user_id,
                "selection": message.get("selection"),
                "timestamp": datetime.utcnow().isoformat()
            }
            await manager.broadcast(project_id, selection_data, exclude=websocket)

        else:
            logger.warning(f"Unknown message type: {msg_type}")