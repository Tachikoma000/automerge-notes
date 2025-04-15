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
  
  // Add initial greeting with document context
  useEffect(() => {
    if (messages.length === 0) {
      // Get document word count instead of showing content
      const wordCount = document.text ? document.text.trim().split(/\s+/).length : 0;
      const title = document.title || 'Untitled';

      setMessages([{
        role: 'assistant',
        content: `Hi! I'm your AI writing assistant. I'm looking at your document **"${title}"**.
        
${document.text && document.text.length > 0 
  ? `This document has approximately ${wordCount} words. What would you like help with today?` 
  : `This document is currently empty. Would you like help with starting your writing?`}`,
        timestamp: Date.now()
      }]);
    }
  }, [document.title, document.text, messages.length]);
  
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
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">Document Assistant</CardTitle>
            <div className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">
              {document.title || 'Untitled'} • {document.text ? `${document.text.length} chars` : 'Empty'}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="overflow-y-auto pb-0 flex-1">
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
                <div className="prose-sm dark:prose-invert max-w-none break-words whitespace-normal overflow-hidden">
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
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about your document..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSendMessage} 
              size="sm"
              disabled={!input.trim() || isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
              Send
            </Button>
          </div>
          <div className="flex flex-wrap gap-1 justify-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-6 px-2"
              onClick={() => setInput("Summarize this document for me")}
            >
              Summarize
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-6 px-2"
              onClick={() => setInput("Suggest improvements to this writing")}
            >
              Improve
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-6 px-2"
              onClick={() => setInput("Check grammar and spelling")}
            >
              Grammar
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-6 px-2"
              onClick={() => setInput("Help me brainstorm ideas for this topic")}
            >
              Brainstorm
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AIChatPanel;
