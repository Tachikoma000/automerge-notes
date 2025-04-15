import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { aiSettings } from '../../lib/ai/aiSettings';
import AIChatPanel from '../ai/AIChatPanel';
import TextSuggestions from '../ai/TextSuggestions';
import AtMentionPlugin from '../ai/AtMentionPlugin';
import { assistantService } from '../../lib/ai/assistantService';

interface MarkdownEditorProps {
  initialValue: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onCursorChange?: (position: { cursor: number; selection: [number, number] | null }) => void;
  collaborators?: Record<string, any>;
  userId?: string;
  getUserColor?: (userId: string) => string;
  documentId?: string;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  initialValue,
  onChange,
  placeholder = 'Start typing...',
  className = '',
  onCursorChange,
  collaborators = {},
  userId = '',
  getUserColor = () => '#000',
  documentId,
}) => {
  const [text, setText] = useState(initialValue);
  const [previewMode, setPreviewMode] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // AI-related state
  const [showAIChat, setShowAIChat] = useState(false);
  const [referencedDocs, setReferencedDocs] = useState<string[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isCompletionLoading, setIsCompletionLoading] = useState(false);
  const [settings, setSettings] = useState(aiSettings.getSettings());
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  // Get document ID from props or use a default
  const docId = documentId || "current";

  useEffect(() => {
    setText(initialValue);
  }, [initialValue]);

  useEffect(() => {
    // Update word count
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);
    
    // Update character count
    setCharCount(text.length);
  }, [text]);

  // Handle text changes
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setText(newValue);
    onChange(newValue);
    updateCursorPosition();
  };

  // Handle keyboard events for special functions like accepting suggestions with Tab
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Accept suggestion with Tab key
    if (e.key === 'Tab' && aiSuggestion) {
      e.preventDefault(); // Prevent default tab behavior
      applyAiSuggestion();
    }
    
    // We could add more keyboard shortcuts here in the future
  };

  // Update cursor position
  const updateCursorPosition = () => {
    if (textareaRef.current && onCursorChange) {
      const { selectionStart, selectionEnd } = textareaRef.current;
      onCursorChange({
        cursor: selectionStart,
        selection: selectionStart !== selectionEnd ? [selectionStart, selectionEnd] : null,
      });
      
      // Store cursor position for AI features
      setCursorPosition(selectionStart);
    }
  };
  
  // Auto-complete functionality
  const handleAutoComplete = async () => {
    if (!settings.features.autoComplete) return;
    
    // Get text up to cursor
    const textBeforeCursor = text.substring(0, cursorPosition);
    
    // Only trigger if ended with trigger characters
    if (textBeforeCursor.endsWith('+++')) {
      // Remove trigger
      const textForCompletion = textBeforeCursor.slice(0, -3);
      
      try {
        const completion = await assistantService.generateCompletion(textForCompletion);
        setAiSuggestion(completion);
      } catch (error) {
        console.error('Error generating completion:', error);
      }
    }
  };
  
  // Apply AI suggestion
  const applyAiSuggestion = () => {
    if (!aiSuggestion) return;
    
    // If triggered by +++ marker, remove it
    const removeMarker = text.substring(0, cursorPosition).endsWith('+++');
    const textBeforeCursor = removeMarker 
      ? text.substring(0, cursorPosition - 3) 
      : text.substring(0, cursorPosition);
    const textAfterCursor = text.substring(cursorPosition);
    
    const newText = textBeforeCursor + aiSuggestion + textAfterCursor;
    setText(newText);
    onChange(newText);
    setAiSuggestion(null);
  };
  
  // Request AI completion at cursor position 
  const requestCompletion = async () => {
    if (!settings.features.autoComplete) return;
    
    // Set loading state
    setIsCompletionLoading(true);
    
    // Get context around the cursor
    const textBeforeCursor = text.substring(0, cursorPosition);
    const textAfterCursor = text.substring(cursorPosition);
    
    // Use the text up to the cursor for completion
    try {
      setAiSuggestion(null); // Clear any existing suggestion first
      const completion = await assistantService.generateCompletion(textBeforeCursor);
      setAiSuggestion(completion);
    } catch (error) {
      console.error('Error requesting AI completion:', error);
    } finally {
      setIsCompletionLoading(false);
    }
  };
  
  // Handle @ mentions
  const handleDocumentReference = (docId: string, title: string) => {
    // Add document reference
    const textBeforeCursor = text.substring(0, cursorPosition);
    const textAfterCursor = text.substring(cursorPosition);
    
    // Find the last @ to replace
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    const newText = 
      textBeforeCursor.substring(0, lastAtIndex) + 
      `@${title}` + 
      textAfterCursor;
    
    setText(newText);
    onChange(newText);
    
    // Add to referenced docs
    setReferencedDocs(prev => [...prev, docId]);
  };
  
  // Check for auto-complete triggers
  useEffect(() => {
    const timer = setTimeout(() => {
      handleAutoComplete();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [cursorPosition, text]);
  
  // Load AI settings
  useEffect(() => {
    setSettings(aiSettings.getSettings());
  }, []);

  // Toggle preview mode
  const togglePreviewMode = () => {
    setPreviewMode(!previewMode);
  };

  // Insert markdown formatting
  const insertFormatting = (startChar: string, endChar: string = startChar) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);
    
    const newText = `${beforeText}${startChar}${selectedText}${endChar}${afterText}`;
    
    setText(newText);
    onChange(newText);
    
    // Set focus back and adjust selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + startChar.length,
        end + startChar.length
      );
      updateCursorPosition();
    }, 0);
  };

  // Render cursor indicators for collaborators
  const renderCursors = () => {
    if (!textareaRef.current || !text) return null;
    
    // Get textarea dimensions and text info
    const textarea = textareaRef.current;
    
    // Calculate line heights and positions
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20;
    const paddingTop = parseInt(getComputedStyle(textarea).paddingTop) || 0;
    const paddingLeft = parseInt(getComputedStyle(textarea).paddingLeft) || 0;
    
    return Object.entries(collaborators).map(([peerId, state]: [string, any]) => {
      if (peerId === userId || !state?.cursor) return null;
      
      // Find the line number and character position
      const textBeforeCursor = text.substring(0, state.cursor);
      const lines = textBeforeCursor.split('\n');
      const lineNumber = lines.length - 1;
      const charPosition = lines[lineNumber].length;
      
      // Calculate cursor position
      const cursorTop = lineNumber * lineHeight + paddingTop;
      const charWidth = 8;
      const cursorLeft = (charPosition * charWidth) + paddingLeft + (3 * charWidth);
      
      return (
        <div 
          key={peerId}
          className="absolute pointer-events-none z-10"
          style={{
            top: `${cursorTop}px`,
            left: `${cursorLeft}px`,
            width: '2px',
            height: `${lineHeight}px`,
            backgroundColor: getUserColor(peerId),
          }}
        >
          <div 
            className="absolute top-[-20px] left-0 text-white text-xs whitespace-nowrap px-1.5 py-0.5 rounded shadow-sm" 
            style={{ backgroundColor: getUserColor(peerId) }}
          >
            {peerId}
          </div>
        </div>
      );
    });
  };

  return (
    <div className={`w-full flex flex-col ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between border rounded-t-md bg-muted/50 p-1">
        <div className="flex items-center space-x-1 overflow-x-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => insertFormatting('# ')}
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
            title="Heading 1"
          >
            H1
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => insertFormatting('## ')}
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
            title="Heading 2"
          >
            H2
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => insertFormatting('### ')}
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
            title="Heading 3"
          >
            H3
          </Button>
          <div className="h-6 w-px bg-border mx-1"></div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => insertFormatting('**', '**')}
            className="h-8 w-8 p-0 font-bold text-muted-foreground hover:text-foreground"
            title="Bold"
          >
            B
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => insertFormatting('*', '*')}
            className="h-8 w-8 p-0 italic text-muted-foreground hover:text-foreground"
            title="Italic"
          >
            I
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => insertFormatting('~~', '~~')}
            className="h-8 w-8 p-0 line-through text-muted-foreground hover:text-foreground"
            title="Strikethrough"
          >
            S
          </Button>
          <div className="h-6 w-px bg-border mx-1"></div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => insertFormatting('- ')}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            title="Bullet List"
          >
            •
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => insertFormatting('1. ')}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            title="Numbered List"
          >
            1.
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => insertFormatting('- [ ] ')}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            title="Task List"
          >
            ☐
          </Button>
          <div className="h-6 w-px bg-border mx-1"></div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => insertFormatting('[', '](url)')}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            title="Link"
          >
            🔗
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => insertFormatting('![alt](', ')')}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            title="Image"
          >
            🖼️
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => insertFormatting('```\n', '\n```')}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            title="Code Block"
          >
            { '{ }' }
          </Button>
          
          {/* AI features divider */}
          <div className="h-6 w-px bg-border mx-1"></div>
          
          {/* AI assistant button */}
          <Button 
            variant={showAIChat ? "default" : "ghost"}
            size="sm" 
            onClick={() => {
              const newState = !showAIChat;
              setShowAIChat(newState);
              if (newState) {
                // Turn off suggestions when enabling chat
                setShowSuggestions(false);
              }
            }}
            className={`h-8 w-8 p-0 relative ${showAIChat ? 'text-primary-foreground bg-primary' : 'text-muted-foreground hover:text-foreground'}`}
            title={showAIChat ? "Hide AI Assistant" : "Show AI Assistant"}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M12 8V4H8" />
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <path d="M14 8h-4v4h4" />
              <path d="M8 16h8" />
            </svg>
            {showAIChat && (
              <span className="absolute top-0 right-0 block w-2 h-2 bg-green-500 rounded-full"></span>
            )}
          </Button>
          
          {/* Toggle suggestions button */}
          <Button 
            variant={showSuggestions ? "default" : "ghost"}
            size="sm" 
            onClick={() => {
              const newState = !showSuggestions;
              setShowSuggestions(newState);
              if (newState) {
                // Turn off AI chat when enabling suggestions
                setShowAIChat(false);
              }
            }}
            className={`h-8 w-8 p-0 relative ${showSuggestions ? 'text-primary-foreground bg-primary' : 'text-muted-foreground hover:text-foreground'}`}
            title={showSuggestions ? "Hide Writing Suggestions" : "Show Writing Suggestions"}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
              <path d="M9 18h6" />
              <path d="M10 22h4" />
            </svg>
            {showSuggestions && (
              <span className="absolute top-0 right-0 block w-2 h-2 bg-green-500 rounded-full"></span>
            )}
          </Button>
          
          {/* AI Completion button - with keyboard/typing icon and loading state */}
          <Button 
            variant={isCompletionLoading ? "default" : "ghost"} 
            size="sm" 
            className={`h-8 w-8 p-0 relative ${isCompletionLoading ? 'text-primary-foreground bg-primary' : 'text-muted-foreground hover:text-foreground'}`}
            title="AI Complete at Cursor"
            onClick={requestCompletion}
            disabled={isCompletionLoading}
          >
            {isCompletionLoading ? (
              <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <path d="M6 10h0" />
                <path d="M10 10h0" />
                <path d="M14 10h0" />
                <path d="M18 10h0" />
                <path d="M6 14h0" />
                <path d="M18 14h0" />
                <path d="M10 14h4" />
              </svg>
            )}
          </Button>
        </div>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={togglePreviewMode}
          className="h-8"
        >
          {previewMode ? 'Edit' : 'Preview'}
        </Button>
      </div>

      {/* Main Content Area with Flex Layout */}
      <div className="flex flex-1 rounded-t-none border-t-0">
        {/* Left side: Editor/Preview */}
        <Card className={`rounded-t-none border-t-0 ${(showSuggestions || showAIChat) ? 'w-2/3' : 'w-full'}`}>
          <CardContent className="p-0">
            {previewMode ? (
              <div className="h-[75vh] overflow-y-auto prose dark:prose-invert max-w-none p-4">
                <ReactMarkdown>{text}</ReactMarkdown>
              </div>
            ) : (
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  value={text}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  onSelect={updateCursorPosition}
                  onClick={updateCursorPosition}
                  onKeyUp={updateCursorPosition}
                  placeholder={placeholder}
                  className="h-[75vh] font-mono text-sm resize-none bg-transparent border-none rounded-none focus-visible:ring-0 p-4"
                />
                {renderCursors()}
                
                {/* @ mention plugin */}
                <AtMentionPlugin
                  text={text}
                  cursorPosition={cursorPosition}
                  onSelectDocument={handleDocumentReference}
                  editorRef={textareaRef}
                />
                
                {/* AI Suggestion inline display */}
                {aiSuggestion && (
                  <div className="absolute rounded-md border bg-background/95 shadow-lg right-6 top-1/3 transform -translate-y-1/2 w-64 overflow-hidden">
                    <div className="p-3 bg-primary/10 border-b flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-5 0v-15A2.5 2.5 0 0 1 9.5 2Z"/>
                          <path d="M19.5 13.5A2.5 2.5 0 0 1 22 16v3a2.5 2.5 0 0 1-5 0v-3a2.5 2.5 0 0 1 2.5-2.5Z"/>
                          <path d="M5 13.5A2.5 2.5 0 0 0 2 16v3a2.5 2.5 0 0 0 5 0v-3a2.5 2.5 0 0 0-2.5-2.5Z"/>
                          <path d="M12 4.5a2.5 2.5 0 0 1 5 0v15a2.5 2.5 0 0 1-5 0z"/>
                        </svg>
                        <span className="text-xs font-semibold">AI Completion</span>
                      </div>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setAiSuggestion(null)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </Button>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-mono italic opacity-80 mb-3 line-clamp-4">{aiSuggestion}</p>
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-muted-foreground">Type <kbd className="px-1 py-0.5 bg-muted rounded">Tab</kbd> to accept</div>
                        <Button size="sm" variant="default" className="h-7" onClick={applyAiSuggestion}>
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          
          {/* Footer */}
          <div className="flex justify-between items-center p-2 text-xs text-muted-foreground border-t">
            <div>
              {wordCount} words · {charCount} characters
            </div>
            <div>
              {previewMode ? 'Preview Mode' : 'Edit Mode'}
            </div>
          </div>
        </Card>
        
        {/* Right side: AI Features */}
        {(showSuggestions || showAIChat) && (
          <div className="w-1/3 ml-4 flex flex-col">
            {/* Text suggestions - fixed height with scrolling */}
            {showSuggestions && settings.features.suggestions && !previewMode && (
              <div className="h-[75vh] overflow-auto mb-4">
                <TextSuggestions 
                  text={text}
                  onApplySuggestion={(original, replacement) => {
                    const newText = text.replace(original, replacement);
                    setText(newText);
                    onChange(newText);
                  }}
                  analysisOptions={{
                    grammar: true,
                    style: true,
                    readability: true,
                  }}
                />
              </div>
            )}
            
            {/* AI chat panel - fixed height to match editor */}
            {showAIChat && (
              <div className="h-[calc(75vh+2.5rem)]">
                <AIChatPanel
                  document={{title: document?.title || 'Current Document', text: text, createdAt: Date.now(), updatedAt: Date.now(), comments: []}}
                  documentId={docId}
                  isOpen={showAIChat}
                  onClose={() => setShowAIChat(false)}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor;
