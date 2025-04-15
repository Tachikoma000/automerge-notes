import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { assistantService, AssistantResponse } from '../../lib/ai/assistantService';
import { NoteDoc } from '../../repo';
import ReactMarkdown from 'react-markdown';

interface AIChatPanelProps {
  document: NoteDoc;
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const AIChatPanel: React.FC<AIChatPanelProps> = ({ 
  document, 
  documentId,
  isOpen, 
  onClose 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [relatedDocuments, setRelatedDocuments] = useState<AssistantResponse['relatedDocuments']>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Add initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `Hi! I'm your AI writing assistant. I can help with brainstorming, editing, research, and more. How can I help with your document "${document.title || 'Untitled'}"?`,
        timestamp: Date.now()
      }]);
    }
  }, [document.title, messages.length]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);
  
  // Handle send message
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Get response from assistant
      const response = await assistantService.generateResponse({
        currentText: document.text || '',
        currentDocumentId: documentId,
        currentDocument: document,
        instruction: userMessage.content
      });
      
      // Add assistant message
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setRelatedDocuments(response.relatedDocuments);
    } catch (error) {
      console.error('Error getting assistant response:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <Card className="fixed right-4 bottom-4 w-80 h-[500px] shadow-lg z-50 flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">AI Assistant</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            ✕
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto pb-0">
        <div className="flex flex-col gap-3">
          {messages.map((message, i) => (
            <div 
              key={i} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[90%] p-2 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}
              >
                <div className="prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[90%] p-2 rounded-lg bg-muted">
                <span className="animate-pulse">Thinking...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {relatedDocuments && relatedDocuments.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground mb-2">Related documents:</p>
            <div className="flex flex-col gap-1">
              {relatedDocuments.map((doc, i) => (
                <Button 
                  key={i} 
                  variant="link" 
                  size="sm"
                  className="text-xs h-auto p-0 justify-start"
                  // TODO: Add navigation to document
                >
                  {doc.title}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      <div className="p-3 mt-3 border-t">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask a question..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSendMessage} 
            size="sm"
            disabled={!input.trim() || isLoading}
          >
            Send
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AIChatPanel;
