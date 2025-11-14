'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown,
  Copy,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Package,
  BarChart3,
  FileText,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { ChatMessage, ChatSession, AIResponse } from '@/types/ai';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface AIChatInterfaceProps {
  sessionId?: string;
  onSessionCreate?: (session: ChatSession) => void;
  className?: string;
}

export default function AIChatInterface({ 
  sessionId, 
  onSessionCreate, 
  className = '' 
}: AIChatInterfaceProps) {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [suggestedFollowups, setSuggestedFollowups] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat session
  useEffect(() => {
    if (user && !currentSession) {
      if (sessionId) {
        loadExistingSession(sessionId);
      } else {
        createNewSession();
      }
    }
  }, [user, sessionId]);

  // Load existing session
  const loadExistingSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/ai?action=session&user_id=${user?.id}&session_id=${sessionId}`);
      const result = await response.json();

      if (result.success) {
        setCurrentSession(result.data);
        setMessages(result.data.messages || []);
      } else {
        setError('Failed to load chat session');
      }
    } catch (error) {
      console.error('Error loading session:', error);
      setError('Failed to load chat session');
    }
  };

  // Create new session
  const createNewSession = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_session',
          user_id: user.id,
          title: 'New Chat'
        })
      });

      const result = await response.json();
      if (result.success) {
        setCurrentSession(result.data);
        onSessionCreate?.(result.data);
      }
    } catch (error) {
      console.error('Error creating session:', error);
      setError('Failed to create chat session');
    }
  };

  // Send message to AI
  const sendMessage = async (messageContent?: string) => {
    const content = messageContent || inputValue.trim();
    if (!content || !currentSession || !user) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      type: 'text',
      content,
      timestamp: new Date()
    };

    // Add user message to UI immediately
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);
    setSuggestedFollowups([]);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          user_id: user.id,
          session_id: currentSession.id,
          message: {
            content,
            type: 'text'
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        const aiResponse: AIResponse = result.data;
        setMessages(prev => [...prev, aiResponse.message]);
        setSuggestedFollowups(aiResponse.suggested_followups || []);
      } else {
        setError(result.error || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle key press in input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Send feedback for AI response
  const sendFeedback = async (messageId: string, rating: number, feedbackType: string) => {
    try {
      await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'feedback',
          message_id: messageId,
          user_id: user?.id,
          rating,
          feedback_type: feedbackType
        })
      });
    } catch (error) {
      console.error('Error sending feedback:', error);
    }
  };

  // Copy message content
  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  // Format message content with basic markdown-like formatting
  const formatMessageContent = (content: string) => {
    return content
      .split('\n')
      .map((line, index) => {
        // Handle headers
        if (line.startsWith('**') && line.endsWith('**')) {
          return (
            <div key={index} className="font-semibold text-lg mb-2">
              {line.replace(/\*\*/g, '')}
            </div>
          );
        }
        
        // Handle bullet points
        if (line.startsWith('- ')) {
          return (
            <div key={index} className="ml-4 mb-1">
              • {line.substring(2)}
            </div>
          );
        }
        
        // Handle empty lines
        if (line.trim() === '') {
          return <div key={index} className="mb-2" />;
        }
        
        // Regular text with inline formatting
        const formattedLine = line
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/📈|📊|📦|💰|🎉|👍|💪|🔍|⚙️|💡/g, '<span class="text-lg">$&</span>');
        
        return (
          <div 
            key={index} 
            className="mb-1"
            dangerouslySetInnerHTML={{ __html: formattedLine }}
          />
        );
      });
  };

  // Quick action buttons
  const quickActions = [
    { icon: TrendingUp, label: 'Show me sales analytics', query: 'Покажи мне аналитику продаж' },
    { icon: Package, label: 'Analyze products', query: 'Проанализируй мои товары' },
    { icon: BarChart3, label: 'Generate report', query: 'Создай отчет по продажам' },
    { icon: Sparkles, label: 'Optimize prices', query: 'Помоги оптимизировать цены' }
  ];

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">AI Assistant</h3>
          <p className="text-muted-foreground">Please log in to use the AI assistant</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`flex flex-col h-full ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          LogiCalc AI Assistant
          {currentSession && (
            <Badge variant="secondary" className="ml-auto">
              {messages.length} messages
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 px-6 overflow-y-auto max-h-96">
          <div className="space-y-4 pb-4">
            {messages.length === 0 && !isLoading && (
              <div className="text-center py-8">
                <Bot className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Welcome to LogiCalc AI!</h3>
                <p className="text-muted-foreground mb-6">
                  I can help you analyze your business data, generate reports, and optimize your marketplace performance.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md mx-auto">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 text-sm"
                      onClick={() => sendMessage(action.query)}
                    >
                      <action.icon className="h-4 w-4" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={message.id || index}
                className={`flex items-start gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center">
                  {message.role === 'user' ? (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-blue-600" />
                    </div>
                  )}
                </div>

                <div
                  className={`flex-1 max-w-[80%] ${
                    message.role === 'user' ? 'text-right' : ''
                  }`}
                >
                  <div
                    className={`rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white ml-auto'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="text-sm">
                      {message.role === 'user' ? (
                        message.content
                      ) : (
                        <div className="space-y-1">
                          {formatMessageContent(message.content)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {message.timestamp.toLocaleTimeString()}
                    
                    {message.role === 'assistant' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                          onClick={() => copyMessage(message.content)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                          onClick={() => sendFeedback(message.id, 5, 'helpful')}
                        >
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                          onClick={() => sendFeedback(message.id, 1, 'not_helpful')}
                        >
                          <ThumbsDown className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-blue-600" />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      AI is thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Suggested Follow-ups */}
        {suggestedFollowups.length > 0 && (
          <div className="px-6 py-2">
            <div className="text-xs text-muted-foreground mb-2">Suggested questions:</div>
            <div className="flex flex-wrap gap-2">
              {suggestedFollowups.map((followup, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => sendMessage(followup)}
                >
                  {followup}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="px-6 py-2">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 my-2"></div>

        {/* Input Area */}
        <div className="p-4">
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your business..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!inputValue.trim() || isLoading}
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground mt-2">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </CardContent>
    </Card>
  );
}