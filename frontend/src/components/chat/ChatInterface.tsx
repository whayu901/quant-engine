import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Sparkles, Database, FileText, Loader, User,
  Bot, ChevronDown, Search, Globe, Zap, AlertCircle,
  ThumbsUp, ThumbsDown, Copy, RefreshCw, BookOpen
} from 'lucide-react';
import { ChatMessage, ChatContext, Citation } from '../../types/api';
import { Button } from '../../components/ui/Button';
import { useWebSocket } from '../../hooks/useWebSocket';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../../lib/utils';
import api from '../../lib/api/client';

interface ChatInterfaceProps {
  projectId?: string;
  sessionId?: string;
  onNewSession?: (sessionId: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  projectId,
  sessionId: initialSessionId,
  onNewSession
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(initialSessionId);
  const [context, setContext] = useState<ChatContext>({
    scope: projectId ? 'project' : 'knowledge_base',
    resource_ids: projectId ? [projectId] : undefined
  });
  const [showCitations, setShowCitations] = useState(true);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // WebSocket for streaming responses
  const { sendMessage: sendWebSocketMessage, lastMessage } = useWebSocket(
    sessionId ? `/ws/chat/${sessionId}` : null
  );

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage.data);

      if (data.type === 'chat.message.chunk') {
        setStreamingMessage(prev => prev + data.content);
      } else if (data.type === 'chat.message.complete') {
        const newMessage: ChatMessage = {
          id: data.messageId,
          session_id: sessionId!,
          role: 'assistant',
          content: streamingMessage + data.content,
          created_at: new Date().toISOString(),
          citations: data.citations
        };
        setMessages(prev => [...prev, newMessage]);
        setStreamingMessage('');
        setIsLoading(false);
      } else if (data.type === 'chat.error') {
        setIsLoading(false);
        // Handle error
      }
    }
  }, [lastMessage, sessionId, streamingMessage]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  // Create new session if needed
  useEffect(() => {
    if (!sessionId && projectId) {
      createNewSession();
    }
  }, [sessionId, projectId]);

  const createNewSession = async () => {
    try {
      const response = await api.post('/chat/sessions', {
        project_id: projectId,
        context
      });
      setSessionId(response.data.id);
      if (onNewSession) {
        onNewSession(response.data.id);
      }
    } catch (error) {
      console.error('Failed to create chat session:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      session_id: sessionId!,
      role: 'user',
      content: inputValue,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Send via WebSocket for streaming
      if (sendWebSocketMessage) {
        sendWebSocketMessage({
          type: 'chat.message',
          content: inputValue,
          context
        });
      } else {
        // Fallback to REST API
        const response = await api.post(`/chat/sessions/${sessionId}/messages`, {
          content: inputValue,
          context
        });

        const assistantMessage: ChatMessage = response.data;
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleRegenerateResponse = async (messageIndex: number) => {
    const lastUserMessage = messages
      .slice(0, messageIndex)
      .reverse()
      .find(m => m.role === 'user');

    if (lastUserMessage) {
      // Remove messages after the user message
      setMessages(prev => prev.slice(0, messageIndex - 1));
      setInputValue(lastUserMessage.content);
      handleSendMessage();
    }
  };

  const renderCitation = (citation: Citation) => {
    const getSourceIcon = () => {
      switch (citation.source_type) {
        case 'transcript':
          return <FileText className="w-4 h-4" />;
        case 'analysis':
          return <Database className="w-4 h-4" />;
        default:
          return <BookOpen className="w-4 h-4" />;
      }
    };

    return (
      <motion.div
        key={citation.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
      >
        <div className="flex items-start gap-2">
          <div className="text-slate-400 mt-0.5">
            {getSourceIcon()}
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-700 line-clamp-2">
              "{citation.text}"
            </p>
            {citation.timestamp && (
              <p className="text-xs text-slate-500 mt-1">
                @ {Math.floor(citation.timestamp / 60)}:{(citation.timestamp % 60).toString().padStart(2, '0')}
              </p>
            )}
            {citation.confidence && (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden max-w-[60px]">
                  <div
                    className="h-full bg-velocity-blue"
                    style={{ width: `${citation.confidence * 100}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500">
                  {Math.round(citation.confidence * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-velocity-blue to-neural-purple rounded-xl">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                AI Research Assistant
              </h2>
              <p className="text-sm text-slate-600">
                Ask questions about your {context.scope === 'project' ? 'project' : 'research'}
              </p>
            </div>
          </div>

          {/* Context Selector */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCitations(!showCitations)}
              className={cn(
                'px-3 py-1.5 text-sm rounded-lg transition-colors',
                showCitations
                  ? 'bg-velocity-blue text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              )}
            >
              <BookOpen className="w-4 h-4 inline mr-1" />
              Citations
            </button>
            <select
              value={context.scope}
              onChange={(e) => setContext(prev => ({
                ...prev,
                scope: e.target.value as ChatContext['scope']
              }))}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-velocity-blue"
            >
              <option value="project">Current Project</option>
              <option value="knowledge_base">All Projects</option>
              <option value="transcript">Current Transcript</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 && !streamingMessage ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-velocity-blue/10 to-neural-purple/10 rounded-full mb-4">
                <Sparkles className="w-8 h-8 text-velocity-blue" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Start a conversation
              </h3>
              <p className="text-slate-600 mb-6">
                Ask me anything about your research data. I can help you find insights, patterns, and answers.
              </p>

              {/* Suggested Questions */}
              <div className="space-y-2">
                <button
                  onClick={() => setInputValue("What are the main themes in this project?")}
                  className="w-full text-left px-4 py-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-700">
                      What are the main themes in this project?
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => setInputValue("Show me all negative feedback about pricing")}
                  className="w-full text-left px-4 py-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-700">
                      Show me all negative feedback about pricing
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => setInputValue("Compare sentiment between different demographics")}
                  className="w-full text-left px-4 py-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-700">
                      Compare sentiment between different demographics
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-velocity-blue to-neural-purple rounded-lg flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}

                  <div
                    className={cn(
                      'max-w-[70%] rounded-2xl px-4 py-3',
                      message.role === 'user'
                        ? 'bg-velocity-blue text-white'
                        : 'bg-slate-100 text-slate-900'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>

                    {/* Citations */}
                    {message.citations && message.citations.length > 0 && showCitations && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-medium text-slate-500 mb-2">
                          Sources ({message.citations.length})
                        </p>
                        {message.citations.map(citation => renderCitation(citation))}
                      </div>
                    )}

                    {/* Message Actions */}
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200">
                        <button
                          onClick={() => handleCopyMessage(message.content, message.id)}
                          className="p-1 hover:bg-slate-200 rounded transition-colors"
                        >
                          {copiedMessageId === message.id ? (
                            <ThumbsUp className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                        <button
                          onClick={() => handleRegenerateResponse(index)}
                          className="p-1 hover:bg-slate-200 rounded transition-colors"
                        >
                          <RefreshCw className="w-4 h-4 text-slate-400" />
                        </button>
                        <button className="p-1 hover:bg-slate-200 rounded transition-colors">
                          <ThumbsUp className="w-4 h-4 text-slate-400" />
                        </button>
                        <button className="p-1 hover:bg-slate-200 rounded transition-colors">
                          <ThumbsDown className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                    )}

                    <p className="text-xs text-slate-400 mt-2">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </p>
                  </div>

                  {message.role === 'user' && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-slate-600" />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Streaming Message */}
              {streamingMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-velocity-blue to-neural-purple rounded-lg flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="max-w-[70%] bg-slate-100 rounded-2xl px-4 py-3">
                    <p className="text-sm text-slate-900 whitespace-pre-wrap">
                      {streamingMessage}
                    </p>
                    <div className="flex gap-1 mt-2">
                      <div className="w-2 h-2 bg-velocity-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-velocity-blue rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-velocity-blue rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Loading Indicator */}
              {isLoading && !streamingMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-velocity-blue to-neural-purple rounded-lg flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="bg-slate-100 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader className="w-4 h-4 text-velocity-blue animate-spin" />
                      <span className="text-sm text-slate-600">Thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your research..."
              rows={1}
              className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-velocity-blue focus:border-transparent"
              style={{
                minHeight: '48px',
                maxHeight: '120px'
              }}
            />
            <div className="absolute right-2 bottom-2">
              <motion.button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all',
                  inputValue.trim() && !isLoading
                    ? 'bg-gradient-to-r from-velocity-blue to-neural-purple text-white shadow-lg'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                )}
              >
                {isLoading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Powered by AI
            </span>
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3" />
              Supports all SEA languages
            </span>
          </div>
          <span className="text-xs text-slate-500">
            Press Enter to send, Shift+Enter for new line
          </span>
        </div>
      </div>
    </div>
  );
};