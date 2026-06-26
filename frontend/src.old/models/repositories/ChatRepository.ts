/**
 * Chat Repository - SOLID: Single Responsibility & Open/Closed
 * Handles chat data access with WebSocket support
 */

import { IChatService, ChatExportFormat } from '../../interfaces/IChatService';
import { ChatSession, ChatMessage, ChatContext, Citation, MessageRole } from '../entities/Chat';
import api from '../../lib/api/client';

export class ChatRepository implements IChatService {
  private wsConnection: WebSocket | null = null;
  private wsHandlers: Map<string, Function[]> = new Map();

  async createSession(projectId: string, context: ChatContext): Promise<ChatSession> {
    try {
      const response = await api.post(`/projects/${projectId}/chat/sessions`, {
        context: context.toJSON()
      });

      return ChatSession.fromJSON(response);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create chat session');
    }
  }

  async getSession(sessionId: string): Promise<ChatSession> {
    try {
      const response = await api.get(`/chat/sessions/${sessionId}`);
      return ChatSession.fromJSON(response);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch chat session');
    }
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      await api.delete(`/chat/sessions/${sessionId}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  async listSessions(projectId: string): Promise<ChatSession[]> {
    try {
      const response = await api.get(`/projects/${projectId}/chat/sessions`);
      return response.sessions.map((s: any) => ChatSession.fromJSON(s));
    } catch (error) {
      throw new Error('Failed to fetch chat sessions');
    }
  }

  async sendMessage(sessionId: string, message: string): Promise<ChatMessage> {
    try {
      const response = await api.post(`/chat/sessions/${sessionId}/messages`, {
        content: message,
        role: MessageRole.USER
      });

      return ChatMessage.fromJSON(response);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to send message');
    }
  }

  async streamMessage(
    sessionId: string,
    message: string,
    onChunk: (chunk: string) => void
  ): Promise<ChatMessage> {
    return new Promise((resolve, reject) => {
      const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/chat/${sessionId}`;

      // Add auth token
      const token = localStorage.getItem('access_token');
      const finalUrl = token ? `${wsUrl}?token=${token}` : wsUrl;

      const ws = new WebSocket(finalUrl);
      let fullMessage = '';
      let messageId = '';

      ws.onopen = () => {
        // Send the user message
        ws.send(JSON.stringify({
          type: 'message',
          content: message
        }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'chunk':
            fullMessage += data.content;
            onChunk(data.content);
            break;

          case 'complete':
            const completeMessage = ChatMessage.fromJSON({
              id: data.message_id,
              role: MessageRole.ASSISTANT,
              content: fullMessage,
              citations: data.citations || [],
              timestamp: new Date(),
              token_count: data.token_count,
              processing_time: data.processing_time
            });
            ws.close();
            resolve(completeMessage);
            break;

          case 'error':
            ws.close();
            reject(new Error(data.error));
            break;
        }
      };

      ws.onerror = (error) => {
        reject(new Error('WebSocket connection failed'));
      };

      ws.onclose = () => {
        // Connection closed
      };
    });
  }

  async regenerateMessage(sessionId: string, messageId: string): Promise<ChatMessage> {
    try {
      const response = await api.post(`/chat/sessions/${sessionId}/messages/${messageId}/regenerate`);
      return ChatMessage.fromJSON(response);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to regenerate message');
    }
  }

  async updateContext(sessionId: string, context: ChatContext): Promise<ChatSession> {
    try {
      const response = await api.patch(`/chat/sessions/${sessionId}/context`, {
        context: context.toJSON()
      });

      return ChatSession.fromJSON(response);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update context');
    }
  }

  async addToContext(
    sessionId: string,
    type: 'transcript' | 'analysis',
    id: string
  ): Promise<ChatSession> {
    try {
      const response = await api.post(`/chat/sessions/${sessionId}/context/${type}`, {
        id
      });

      return ChatSession.fromJSON(response);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to add to context');
    }
  }

  async removeFromContext(
    sessionId: string,
    type: 'transcript' | 'analysis',
    id: string
  ): Promise<ChatSession> {
    try {
      const response = await api.delete(`/chat/sessions/${sessionId}/context/${type}/${id}`);
      return ChatSession.fromJSON(response);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to remove from context');
    }
  }

  async searchCitations(sessionId: string, query: string): Promise<Citation[]> {
    try {
      const response = await api.post(`/chat/sessions/${sessionId}/search`, {
        query
      });

      return response.citations.map((c: any) => Citation.fromJSON(c));
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to search citations');
    }
  }

  async getSuggestedQuestions(sessionId: string): Promise<string[]> {
    try {
      const response = await api.get(`/chat/sessions/${sessionId}/suggestions`);
      return response.questions || [];
    } catch (error) {
      return [];
    }
  }

  async provideFeedback(
    sessionId: string,
    messageId: string,
    rating: 'positive' | 'negative',
    comment?: string
  ): Promise<void> {
    try {
      await api.post(`/chat/sessions/${sessionId}/messages/${messageId}/feedback`, {
        rating,
        comment
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to provide feedback');
    }
  }

  async exportSession(sessionId: string, format: ChatExportFormat): Promise<Blob> {
    try {
      const response = await api.get(`/chat/sessions/${sessionId}/export`, {
        params: { format },
        responseType: 'blob'
      });

      return new Blob([response], {
        type: this.getMimeType(format)
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to export session');
    }
  }

  private getMimeType(format: ChatExportFormat): string {
    switch (format) {
      case ChatExportFormat.PDF:
        return 'application/pdf';
      case ChatExportFormat.MARKDOWN:
        return 'text/markdown';
      case ChatExportFormat.DOCX:
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case ChatExportFormat.JSON:
        return 'application/json';
      default:
        return 'application/octet-stream';
    }
  }
}