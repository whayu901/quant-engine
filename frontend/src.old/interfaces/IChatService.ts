/**
 * Chat Service Interface - SOLID: Dependency Inversion Principle
 * High-level modules depend on abstractions
 */

import { ChatSession, ChatMessage, ChatContext, Citation } from '../models/entities/Chat';

export interface IChatService {
  // Session management
  createSession(projectId: string, context: ChatContext): Promise<ChatSession>;
  getSession(sessionId: string): Promise<ChatSession>;
  deleteSession(sessionId: string): Promise<boolean>;
  listSessions(projectId: string): Promise<ChatSession[]>;

  // Messaging
  sendMessage(sessionId: string, message: string): Promise<ChatMessage>;
  streamMessage(sessionId: string, message: string, onChunk: (chunk: string) => void): Promise<ChatMessage>;
  regenerateMessage(sessionId: string, messageId: string): Promise<ChatMessage>;

  // Context management
  updateContext(sessionId: string, context: ChatContext): Promise<ChatSession>;
  addToContext(sessionId: string, type: 'transcript' | 'analysis', id: string): Promise<ChatSession>;
  removeFromContext(sessionId: string, type: 'transcript' | 'analysis', id: string): Promise<ChatSession>;

  // Search and retrieval
  searchCitations(sessionId: string, query: string): Promise<Citation[]>;
  getSuggestedQuestions(sessionId: string): Promise<string[]>;

  // Feedback
  provideFeedback(sessionId: string, messageId: string, rating: 'positive' | 'negative', comment?: string): Promise<void>;

  // Export
  exportSession(sessionId: string, format: ChatExportFormat): Promise<Blob>;
}

export enum ChatExportFormat {
  PDF = 'pdf',
  MARKDOWN = 'markdown',
  DOCX = 'docx',
  JSON = 'json'
}

export interface IChatWebSocket {
  connect(sessionId: string): void;
  disconnect(): void;
  sendMessage(message: string): void;
  onMessage(handler: (message: ChatMessage) => void): void;
  onTyping(handler: (isTyping: boolean) => void): void;
  onError(handler: (error: Error) => void): void;
}

export interface IChatStateListener {
  onMessageReceived(message: ChatMessage): void;
  onTypingStateChanged(isTyping: boolean): void;
  onContextUpdated(context: ChatContext): void;
  onCitationFound(citation: Citation): void;
}