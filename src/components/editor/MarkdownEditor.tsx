import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

interface MarkdownEditorProps {
  initialValue: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onCursorChange?: (position: { cursor: number; selection: [number, number] | null }) => void;
  collaborators?: Record<string, any>;
  userId?: string;
  getUserColor?: (userId: string) => string;
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
}) => {
  const [text, setText] = useState(initialValue);
  const [previewMode, setPreviewMode] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Update cursor position
  const updateCursorPosition = () => {
    if (textareaRef.current && onCursorChange) {
      const { selectionStart, selectionEnd } = textareaRef.current;
      onCursorChange({
        cursor: selectionStart,
        selection: selectionStart !== selectionEnd ? [selectionStart, selectionEnd] : null,
      });
    }
  };

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
        <div className="flex items-center space-x-1">
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

      {/* Editor/Preview Area */}
      <Card className="rounded-t-none border-t-0">
        <CardContent className="p-0">
          {previewMode ? (
            <div className="prose dark:prose-invert max-w-none p-4">
              <ReactMarkdown>{text}</ReactMarkdown>
            </div>
          ) : (
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={text}
                onChange={handleChange}
                onSelect={updateCursorPosition}
                onClick={updateCursorPosition}
                onKeyUp={updateCursorPosition}
                placeholder={placeholder}
                className="min-h-[60vh] font-mono text-sm resize-none bg-transparent border-none rounded-none focus-visible:ring-0 p-4"
              />
              {renderCursors()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="flex justify-between items-center p-2 text-xs text-muted-foreground">
        <div>
          {wordCount} words · {charCount} characters
        </div>
        <div>
          {previewMode ? 'Preview Mode' : 'Edit Mode'}
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditor;
