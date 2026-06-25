/**
 * Chat Controller - SOLID: Single Responsibility & Dependency Inversion
 * Orchestrates chat business logic
 */

import { IChatService, ChatExportFormat } from '../interfaces/IChatService';
import { ChatSession, ChatMessage, ChatContext, Citation } from '../models/entities/Chat';
import { EventEmitter } from '../utils/EventEmitter';

export interface ChatState {
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  isTyping: boolean;
  error: string | null;
  suggestedQuestions: string[];
  searchResults: Citation[];
  streamingContent: string;
}

export interface IChatController {
  getState(): ChatState;
  createSession(projectId: string, context: ChatContext): Promise<void>;
  loadSession(sessionId: string): Promise<void>;
  loadSessions(projectId: string): Promise<void>;
  sendMessage(message: string): Promise<void>;
  regenerateMessage(messageId: string): Promise<void>;
  updateContext(context: ChatContext): Promise<void>;
  searchCitations(query: string): Promise<void>;
  provideFeedback(messageId: string, rating: 'positive' | 'negative', comment?: string): Promise<void>;
  exportSession(format: ChatExportFormat): Promise<void>;
  subscribe(listener: (state: ChatState) => void): () => void;
}

/**
 * Chat Controller Implementation
 * SOLID: Open/Closed - Extended through dependency injection
 */
export class ChatController implements IChatController {
  private state: ChatState = {
    currentSession: null,
    sessions: [],
    messages: [],
    isLoading: false,
    isSending: false,
    isTyping: false,
    error: null,
    suggestedQuestions: [],
    searchResults: [],
    streamingContent: ''
  };

  private eventEmitter = new EventEmitter<any>();

  constructor(private chatService: IChatService) {}

  getState(): ChatState {
    return { ...this.state };
  }

  async createSession(projectId: string, context: ChatContext): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      const session = await this.chatService.createSession(projectId, context);

      this.updateState({
        currentSession: session,
        messages: session.messages,
        sessions: [session, ...this.state.sessions],
        isLoading: false
      });

      // Load suggested questions
      this.loadSuggestedQuestions(session.id);

      // Emit event
      this.eventEmitter.emit('session_created', session);
    } catch (error: any) {
      this.updateState({
        isLoading: false,
        error: error.message || 'Failed to create session'
      });
      throw error;
    }
  }

  async loadSession(sessionId: string): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      const session = await this.chatService.getSession(sessionId);

      this.updateState({
        currentSession: session,
        messages: session.messages,
        isLoading: false
      });

      // Load suggested questions
      this.loadSuggestedQuestions(sessionId);

      // Emit event
      this.eventEmitter.emit('session_loaded', session);
    } catch (error: any) {
      this.updateState({
        isLoading: false,
        error: error.message || 'Failed to load session'
      });
      throw error;
    }
  }

  async loadSessions(projectId: string): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      const sessions = await this.chatService.listSessions(projectId);

      this.updateState({
        sessions,
        isLoading: false
      });
    } catch (error: any) {
      this.updateState({
        isLoading: false,
        error: error.message || 'Failed to load sessions'
      });
      throw error;
    }
  }

  async sendMessage(message: string): Promise<void> {
    if (!this.state.currentSession) {
      throw new Error('No session loaded');
    }

    // Validate message
    if (!message.trim()) {
      throw new Error('Message cannot be empty');
    }

    this.updateState({
      isSending: true,
      error: null,
      streamingContent: ''
    });

    try {
      // Add user message immediately
      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        role: 'user' as any,
        content: message,
        citations: [],
        timestamp: new Date()
      } as ChatMessage;

      this.updateState({
        messages: [...this.state.messages, userMessage]
      });

      // Send message with streaming
      const assistantMessage = await this.chatService.streamMessage(
        this.state.currentSession.id,
        message,
        (chunk) => {
          // Update streaming content
          this.updateState({
            streamingContent: this.state.streamingContent + chunk,
            isTyping: true
          });
        }
      );

      // Add complete assistant message
      this.updateState({
        messages: [...this.state.messages, assistantMessage],
        isSending: false,
        isTyping: false,
        streamingContent: ''
      });

      // Calculate time saved (5 minutes per AI response)
      this.eventEmitter.emit('time_saved', {
        action: 'chat_response',
        minutes: 5
      });

      // Emit message event
      this.eventEmitter.emit('message_received', assistantMessage);

      // Load new suggested questions
      this.loadSuggestedQuestions(this.state.currentSession.id);
    } catch (error: any) {
      this.updateState({
        isSending: false,
        isTyping: false,
        error: error.message || 'Failed to send message'
      });
      throw error;
    }
  }

  async regenerateMessage(messageId: string): Promise<void> {
    if (!this.state.currentSession) {
      throw new Error('No session loaded');
    }

    this.updateState({ isSending: true, error: null });

    try {
      const regeneratedMessage = await this.chatService.regenerateMessage(
        this.state.currentSession.id,
        messageId
      );

      // Replace the message in the list
      const messages = this.state.messages.map(m =>
        m.id === messageId ? regeneratedMessage : m
      );

      this.updateState({
        messages,
        isSending: false
      });

      this.eventEmitter.emit('message_regenerated', regeneratedMessage);
    } catch (error: any) {
      this.updateState({
        isSending: false,
        error: error.message || 'Failed to regenerate message'
      });
      throw error;
    }
  }

  async updateContext(context: ChatContext): Promise<void> {
    if (!this.state.currentSession) {
      throw new Error('No session loaded');
    }

    this.updateState({ isLoading: true });

    try {
      const updatedSession = await this.chatService.updateContext(
        this.state.currentSession.id,
        context
      );

      this.updateState({
        currentSession: updatedSession,
        isLoading: false
      });

      this.eventEmitter.emit('context_updated', context);
    } catch (error: any) {
      this.updateState({
        isLoading: false,
        error: error.message || 'Failed to update context'
      });
      throw error;
    }
  }

  async searchCitations(query: string): Promise<void> {
    if (!this.state.currentSession) {
      throw new Error('No session loaded');
    }

    this.updateState({ isLoading: true });

    try {
      const citations = await this.chatService.searchCitations(
        this.state.currentSession.id,
        query
      );

      this.updateState({
        searchResults: citations,
        isLoading: false
      });

      this.eventEmitter.emit('citations_found', citations);
    } catch (error: any) {
      this.updateState({
        isLoading: false,
        error: error.message || 'Failed to search citations'
      });
      throw error;
    }
  }

  async provideFeedback(
    messageId: string,
    rating: 'positive' | 'negative',
    comment?: string
  ): Promise<void> {
    if (!this.state.currentSession) {
      throw new Error('No session loaded');
    }

    try {
      await this.chatService.provideFeedback(
        this.state.currentSession.id,
        messageId,
        rating,
        comment
      );

      // Update message with feedback
      const messages = this.state.messages.map(m =>
        m.id === messageId
          ? { ...m, feedback: { rating, comment, timestamp: new Date() } }
          : m
      );

      this.updateState({ messages });

      this.eventEmitter.emit('feedback_provided', { messageId, rating, comment });
    } catch (error: any) {
      this.updateState({
        error: error.message || 'Failed to provide feedback'
      });
      throw error;
    }
  }

  async exportSession(format: ChatExportFormat): Promise<void> {
    if (!this.state.currentSession) {
      throw new Error('No session loaded');
    }

    this.updateState({ isLoading: true });

    try {
      const blob = await this.chatService.exportSession(
        this.state.currentSession.id,
        format
      );

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chat-session-${this.state.currentSession.id}.${this.getFileExtension(format)}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      this.updateState({ isLoading: false });

      this.eventEmitter.emit('session_exported', { format });
    } catch (error: any) {
      this.updateState({
        isLoading: false,
        error: error.message || 'Failed to export session'
      });
      throw error;
    }
  }

  subscribe(listener: (state: ChatState) => void): () => void {
    listener(this.state);
    return this.eventEmitter.on('state_change', listener);
  }

  // Private methods
  private updateState(partial: Partial<ChatState>): void {
    this.state = { ...this.state, ...partial };
    this.eventEmitter.emit('state_change', this.state);
  }

  private async loadSuggestedQuestions(sessionId: string): Promise<void> {
    try {
      const questions = await this.chatService.getSuggestedQuestions(sessionId);
      this.updateState({ suggestedQuestions: questions });
    } catch (error) {
      // Silently fail - suggested questions are not critical
      console.error('Failed to load suggested questions:', error);
    }
  }

  private getFileExtension(format: ChatExportFormat): string {
    switch (format) {
      case ChatExportFormat.PDF:
        return 'pdf';
      case ChatExportFormat.MARKDOWN:
        return 'md';
      case ChatExportFormat.DOCX:
        return 'docx';
      case ChatExportFormat.JSON:
        return 'json';
      default:
        return 'file';
    }
  }
}