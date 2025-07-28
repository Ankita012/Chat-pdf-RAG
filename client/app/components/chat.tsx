'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, FileText, Clock, User, Bot } from 'lucide-react';

interface Source {
  filename: string;
  page: number | string;
  content: string;
}

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  sources?: Source[];
}

interface ApiResponse {
  response: string;
  sources: Source[];
  query: string;
}

export default function ChatComponent() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format the AI response to preserve line breaks and structure
  const formatResponse = (response: string) => {
    return response.split('\n').map((line, index) => {
      if (line.trim() === '') return <br key={index} />;
      
      // Handle numbered lists
      if (line.match(/^\d+\./)) {
        return (
          <div key={index} className="font-semibold text-blue-700 mt-3 mb-1">
            {line}
          </div>
        );
      }
      
      // Handle bullet points with dashes
      if (line.trim().startsWith('- ') || line.trim().startsWith('•')) {
        return (
          <div key={index} className="ml-4 mb-1 flex items-start">
            <span className="mr-2 text-blue-500">•</span>
            <span>{line.replace(/^[\-•]\s*/, '')}</span>
          </div>
        );
      }
      
      // Handle sub-categories (indented lines)
      if (line.match(/^\s{2,}/)) {
        return (
          <div key={index} className="ml-8 mb-1 text-gray-700">
            {line.trim()}
          </div>
        );
      }
      
      return (
        <div key={index} className="mb-1">
          {line}
        </div>
      );
    });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setInputMessage('');

    try {
      const response = await fetch(
        `http://localhost:8000/chat?message=${encodeURIComponent(inputMessage)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        isUser: false,
        timestamp: new Date(),
        sources: data.sources,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full max-h-full">
      {/* Messages Container with Proper Scrolling */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg mb-2">Ready to chat!</p>
            <p className="text-sm text-gray-400">
              Upload a PDF document to start asking questions
            </p>
            <div className="mt-4 text-xs text-gray-400">
              <p>💡 Try asking:</p>
              <ul className="mt-2 space-y-1">
                <li>"What is this document about?"</li>
                <li>"List the main skills"</li>
                <li>"Summarize the key points"</li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-lg break-words ${
                    message.isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 border border-gray-200'
                  }`}
                >
                  {/* Message Header */}
                  <div className="flex items-center mb-2">
                    {message.isUser ? (
                      <User size={14} className="mr-2 flex-shrink-0" />
                    ) : (
                      <Bot size={14} className="mr-2 text-blue-600 flex-shrink-0" />
                    )}
                    <span className="font-medium text-xs">
                      {message.isUser ? 'You' : 'AI'}
                    </span>
                    <Clock size={10} className="ml-auto opacity-70 flex-shrink-0" />
                    <span className="text-xs ml-1 opacity-70">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>

                  {/* Message Content */}
                  <div className={`text-sm ${message.isUser ? 'text-white' : 'text-gray-800'}`}>
                    {message.isUser ? (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        {formatResponse(message.content)}
                      </div>
                    )}
                  </div>

                  {/* Sources - Collapsible for better space management */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-gray-300">
                      <details className="group">
                        <summary className="text-xs font-semibold text-gray-600 cursor-pointer hover:text-gray-800 flex items-center">
                          <span>📚 Sources ({message.sources.length})</span>
                          <span className="ml-2 transform group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                          {message.sources.map((source, index) => (
                            <div
                              key={index}
                              className="bg-gray-50 p-2 rounded text-xs border"
                            >
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-medium text-blue-700 truncate">
                                  📄 {source.filename}
                                </span>
                                <span className="text-xs text-gray-500 bg-gray-200 px-1 py-0.5 rounded ml-2 flex-shrink-0">
                                  P.{source.page}
                                </span>
                              </div>
                              <p className="text-gray-600 leading-relaxed">
                                {source.content.substring(0, 100)}...
                              </p>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                    <span className="text-gray-600 text-xs">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="border-t border-gray-200 p-3 bg-white flex-shrink-0">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your PDF..."
            disabled={isLoading}
            className="flex-1 p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 resize-none"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
        
        {/* Character counter for long messages */}
        {inputMessage.length > 100 && (
          <div className="text-xs text-gray-500 mt-1 text-right">
            {inputMessage.length} characters
          </div>
        )}
      </div>
    </div>
  );
}