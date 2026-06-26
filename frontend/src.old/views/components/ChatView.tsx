/**
 * Chat View - SOLID: Single Responsibility
 * Pure presentation component for chat interface
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Zap,
  FileText,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Download,
  Plus,
  X,
  MessageSquare,
  Sparkles,
  Search
} from 'lucide-react';
import { ChatMessage, Citation } from '../../models/entities/Chat';

export interface ChatViewProps {
  // Data
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  isTyping: boolean;
  error: string | null;
  streamingContent: string;
  suggestedQuestions: string[];

  // Events
  onSendMessage: (message: string) => void;
  onRegenerateMessage: (messageId: string) => void;
  onProvideFeedback: (messageId: string, rating: 'positive' | 'negative') => void;
  onSelectSuggestion: (question: string) => void;
  onSearchCitations: (query: string) => void;
  onExport: () => void;
  onNewSession: () => void;
}

/**
 * Pure View Component - No business logic
 * SOLID: Open/Closed - Extended through props, not modification
 */
export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  isLoading,
  isSending,
  isTyping,
  error,
  streamingContent,
  suggestedQuestions,
  onSendMessage,
  onRegenerateMessage,
  onProvideFeedback,
  onSelectSuggestion,
  onSearchCitations,
  onExport,
  onNewSession
}) => {
  const [inputValue, setInputValue] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isSending) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-slate-200">
      {/* Header */}
      <ChatHeader
        messageCount={messages.length}
        onNewSession={onNewSession}
        onExport={onExport}
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <EmptyState suggestedQuestions={suggestedQuestions} onSelectSuggestion={onSelectSuggestion} />
        ) : (
          <>
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isLast={index === messages.length - 1}
                onRegenerate={() => onRegenerateMessage(message.id)}
                onFeedback={(rating) => onProvideFeedback(message.id, rating)}
              />
            ))}

            {/* Streaming Message */}
            {streamingContent && (
              <StreamingMessage content={streamingContent} />
            )}

            {/* Typing Indicator */}
            {isTyping && !streamingContent && (
              <TypingIndicator />
            )}
          </>
        )}

        {/* Error Message */}
        {error && (
          <ErrorMessage error={error} />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {suggestedQuestions.length > 0 && messages.length > 0 && (
        <SuggestedQuestions
          questions={suggestedQuestions}
          onSelect={onSelectSuggestion}
        />
      )}

      {/* Input Area */}
      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleSubmit}
        onSearch={onSearchCitations}
        disabled={isSending}
        placeholder={isSending ? 'Sending...' : 'Ask about your research...'}
      />
    </div>
  );
};

/**
 * Sub-components - SOLID: Single Responsibility
 */

const ChatHeader: React.FC<{
  messageCount: number;
  onNewSession: () => void;
  onExport: () => void;
}> = ({ messageCount, onNewSession, onExport }) => (
  <div className="px-6 py-4 border-b border-slate-200">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-velocity-blue to-neural-purple rounded-lg">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">AI Research Assistant</h2>
          <p className="text-sm text-slate-600">{messageCount} messages</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onExport}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          title="Export conversation"
        >
          <Download className="h-4 w-4 text-slate-600" />
        </button>
        <button
          onClick={onNewSession}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          title="New conversation"
        >
          <Plus className="h-4 w-4 text-slate-600" />
        </button>
      </div>
    </div>
  </div>
);

const EmptyState: React.FC<{
  suggestedQuestions: string[];
  onSelectSuggestion: (question: string) => void;
}> = ({ suggestedQuestions, onSelectSuggestion }) => (
  <div className="flex flex-col items-center justify-center h-full text-center">
    <div className="p-4 bg-gradient-to-br from-velocity-blue/10 to-neural-purple/10 rounded-full mb-4">
      <MessageSquare className="h-12 w-12 text-velocity-blue" />
    </div>
    <h3 className="text-lg font-semibold text-slate-900 mb-2">Start a conversation</h3>
    <p className="text-slate-600 mb-6 max-w-md">
      Ask questions about your research data and get instant AI-powered insights
    </p>

    {suggestedQuestions.length > 0 && (
      <div className="space-y-2 w-full max-w-md">
        <p className="text-sm text-slate-500 mb-2">Try asking:</p>
        {suggestedQuestions.slice(0, 3).map((question, index) => (
          <button
            key={index}
            onClick={() => onSelectSuggestion(question)}
            className="w-full p-3 text-left text-sm bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Sparkles className="inline h-3 w-3 text-velocity-blue mr-2" />
            {question}
          </button>
        ))}
      </div>
    )}
  </div>
);

const MessageBubble: React.FC<{
  message: ChatMessage;
  isLast: boolean;
  onRegenerate: () => void;
  onFeedback: (rating: 'positive' | 'negative') => void;
}> = ({ message, isLast, onRegenerate, onFeedback }) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-3xl ${isUser ? 'ml-12' : 'mr-12'}`}>
        <div
          className={`
            rounded-lg p-4
            ${isUser
              ? 'bg-gradient-to-r from-velocity-blue to-neural-purple text-white'
              : 'bg-slate-50 text-slate-900'
            }
          `}
        >
          {/* Message Content */}
          <div className="prose prose-sm max-w-none">
            {message.content}
          </div>

          {/* Citations */}
          {message.citations.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-200">
              <div className="text-xs font-medium mb-2 text-slate-500">Sources:</div>
              <div className="space-y-1">
                {message.citations.map((citation) => (
                  <CitationItem key={citation.id} citation={citation} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Message Actions */}
        {!isUser && (
          <div className="flex items-center gap-2 mt-2">
            {isLast && (
              <button
                onClick={onRegenerate}
                className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                title="Regenerate response"
              >
                <RefreshCw className="h-3 w-3 text-slate-500" />
              </button>
            )}
            <button
              onClick={() => onFeedback('positive')}
              className="p-1.5 hover:bg-slate-100 rounded transition-colors"
              title="Helpful"
            >
              <ThumbsUp className="h-3 w-3 text-slate-500" />
            </button>
            <button
              onClick={() => onFeedback('negative')}
              className="p-1.5 hover:bg-slate-100 rounded transition-colors"
              title="Not helpful"
            >
              <ThumbsDown className="h-3 w-3 text-slate-500" />
            </button>
            {message.tokenCount && (
              <span className="text-xs text-slate-400 ml-auto">
                {message.tokenCount} tokens
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const CitationItem: React.FC<{ citation: Citation }> = ({ citation }) => (
  <div className="flex items-start gap-2 p-2 bg-white rounded text-xs">
    <FileText className="h-3 w-3 text-slate-400 mt-0.5" />
    <div className="flex-1">
      <div className="font-medium text-slate-700">{citation.formattedSource}</div>
      <div className="text-slate-500 line-clamp-2">{citation.text}</div>
    </div>
    <div className="text-slate-400">
      {Math.round(citation.relevance * 100)}%
    </div>
  </div>
);

const StreamingMessage: React.FC<{ content: string }> = ({ content }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex justify-start"
  >
    <div className="max-w-3xl mr-12 bg-slate-50 rounded-lg p-4">
      <div className="prose prose-sm max-w-none text-slate-900">
        {content}
        <span className="inline-block w-1 h-4 bg-slate-400 animate-pulse ml-1" />
      </div>
    </div>
  </motion.div>
);

const TypingIndicator: React.FC = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex justify-start"
  >
    <div className="bg-slate-50 rounded-lg px-4 py-3">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  </motion.div>
);

const ErrorMessage: React.FC<{ error: string }> = ({ error }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-3 bg-red-50 border border-red-200 rounded-lg"
  >
    <p className="text-sm text-red-700">{error}</p>
  </motion.div>
);

const SuggestedQuestions: React.FC<{
  questions: string[];
  onSelect: (question: string) => void;
}> = ({ questions, onSelect }) => (
  <div className="px-6 py-3 border-t border-slate-200 bg-slate-50">
    <div className="flex gap-2 overflow-x-auto">
      {questions.map((question, index) => (
        <button
          key={index}
          onClick={() => onSelect(question)}
          className="flex-shrink-0 px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
        >
          {question}
        </button>
      ))}
    </div>
  </div>
);

const ChatInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onSearch: (query: string) => void;
  disabled: boolean;
  placeholder: string;
}> = ({ value, onChange, onSubmit, onSearch, disabled, placeholder }) => (
  <form onSubmit={onSubmit} className="p-4 border-t border-slate-200">
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onSearch('')}
        className="p-2.5 hover:bg-slate-100 rounded-lg transition-colors"
        title="Search citations"
      >
        <Search className="h-5 w-5 text-slate-600" />
      </button>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-velocity-blue focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="px-4 py-2.5 bg-gradient-to-r from-velocity-blue to-neural-purple text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <Send className="h-4 w-4" />
        Send
      </button>
    </div>
  </form>
);