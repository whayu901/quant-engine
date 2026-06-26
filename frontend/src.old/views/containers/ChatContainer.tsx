/**
 * Chat Container - MVC/SOLID
 * Manages AI chat interactions with context
 */

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Services } from '../../di/services';
import { ChatView } from '../components/ChatView';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const ChatContainer: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');

  const chatController = Services.chat;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<string>('');
  const messageIdCounter = useRef(0);

  useEffect(() => {
    // Load initial context if projectId is provided
    if (projectId) {
      loadProjectContext();
    }

    // Add welcome message
    addMessage('assistant', 'Hello! I\'m your AI research assistant. I can help you analyze interviews, extract insights, and answer questions about your qualitative data. What would you like to explore today?');
  }, [projectId]);

  const loadProjectContext = async () => {
    try {
      // Load project transcripts as context
      const projectContext = await chatController.getProjectContext(projectId!);
      setContext(projectContext);
      addMessage('assistant', `I've loaded the context from your project. I can now help you analyze the interview data. What would you like to know?`);
    } catch (error) {
      console.error('Failed to load project context:', error);
    }
  };

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const newMessage: ChatMessage = {
      id: String(messageIdCounter.current++),
      role,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const handleSendMessage = async (content: string) => {
    // Add user message
    addMessage('user', content);

    setIsLoading(true);
    try {
      // Get AI response
      const response = await chatController.sendMessage({
        message: content,
        context: context || undefined,
        projectId: projectId || undefined
      });

      // Add AI response
      addMessage('assistant', response.content);
    } catch (error) {
      console.error('Failed to send message:', error);
      addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    messageIdCounter.current = 0;
    addMessage('assistant', 'Chat cleared. How can I help you with your research today?');
  };

  const handleExportChat = () => {
    const chatText = messages
      .map(msg => `${msg.role.toUpperCase()} (${msg.timestamp.toLocaleString()}):\n${msg.content}\n`)
      .join('\n---\n\n');

    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ChatView
      messages={messages}
      isLoading={isLoading}
      hasContext={!!context}
      onSendMessage={handleSendMessage}
      onClearChat={handleClearChat}
      onExportChat={handleExportChat}
    />
  );
};