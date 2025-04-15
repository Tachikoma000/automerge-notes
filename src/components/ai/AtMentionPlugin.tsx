import React, { useState, useEffect, useRef } from 'react';
import { getAllDocuments } from '../../lib/documentService';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';

interface AtMentionPluginProps {
  text: string;
  cursorPosition: number;
  onSelectDocument: (documentId: string, title: string) => void;
  editorRef?: React.RefObject<HTMLTextAreaElement | null>;
}

interface DocumentReference {
  id: string;
  title: string;
}

const AtMentionPlugin: React.FC<AtMentionPluginProps> = ({
  text,
  cursorPosition,
  onSelectDocument,
  editorRef
}) => {
  const [isActive, setIsActive] = useState(false);
  const [search, setSearch] = useState('');
  const [documents, setDocuments] = useState<DocumentReference[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentReference[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Load all documents
  useEffect(() => {
    const loadDocuments = async () => {
      const allDocs = await getAllDocuments();
      const docsArray = allDocs.map(doc => ({
        id: doc.id,
        title: doc.doc?.title || 'Untitled'
      }));
      setDocuments(docsArray);
    };
    
    loadDocuments();
  }, []);
  
  // Check for @ mention
  useEffect(() => {
    if (!text || cursorPosition === undefined) return;
    
    const checkForMention = () => {
      // Get text before cursor
      const textBeforeCursor = text.substring(0, cursorPosition);
      
      // Find the last @ character
      const lastAtIndex = textBeforeCursor.lastIndexOf('@');
      
      if (lastAtIndex === -1 || lastAtIndex < textBeforeCursor.lastIndexOf('\n')) {
        setIsActive(false);
        return;
      }
      
      // Check if there's a space between the @ and the cursor
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      
      // If no space found after @, activate mention
      if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
        setIsActive(true);
        setSearch(textAfterAt);
        
        // Calculate dropdown position
        calculatePosition(lastAtIndex);
        
        // Filter documents
        const filtered = documents.filter(doc => 
          doc.title.toLowerCase().includes(textAfterAt.toLowerCase())
        ).slice(0, 5);
        
        setFilteredDocuments(filtered);
        setSelectedIndex(0);
      } else {
        setIsActive(false);
      }
    };
    
    checkForMention();
  }, [text, cursorPosition, documents]);
  
  // Calculate dropdown position
  const calculatePosition = (atIndex: number) => {
    if (!editorRef?.current) {
      setPosition({ top: 20, left: 20 });
      return;
    }
    
    const textarea = editorRef.current;
    const text = textarea.value;
    
    // Create a temporary div to calculate position
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.top = '0';
    div.style.left = '0';
    div.style.visibility = 'hidden';
    div.style.whiteSpace = 'pre-wrap';
    div.style.width = `${textarea.clientWidth}px`;
    div.style.font = window.getComputedStyle(textarea).font;
    div.style.lineHeight = window.getComputedStyle(textarea).lineHeight;
    div.style.padding = window.getComputedStyle(textarea).padding;
    
    // Add text up to the @ symbol
    div.textContent = text.substring(0, atIndex);
    
    // Add a span to mark the @ position
    const span = document.createElement('span');
    span.id = 'marker';
    div.appendChild(span);
    
    document.body.appendChild(div);
    
    // Get the position of the marker
    const marker = document.getElementById('marker');
    const rect = marker?.getBoundingClientRect();
    const textareaRect = textarea.getBoundingClientRect();
    
    document.body.removeChild(div);
    
    if (rect) {
      setPosition({
        top: (rect.top - textareaRect.top) + textarea.scrollTop + 20,
        left: (rect.left - textareaRect.left) + textarea.scrollLeft
      });
    }
  };
  
  // Handle document selection
  const handleSelectDocument = (docId: string, title: string) => {
    onSelectDocument(docId, title);
    setIsActive(false);
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isActive) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredDocuments.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredDocuments.length > 0) {
          const selected = filteredDocuments[selectedIndex];
          handleSelectDocument(selected.id, selected.title);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsActive(false);
        break;
    }
  };
  
  // Set up keyboard listeners
  useEffect(() => {
    if (isActive) {
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, filteredDocuments, selectedIndex]);
  
  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsActive(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  if (!isActive || filteredDocuments.length === 0) {
    return null;
  }
  
  return (
    <div 
      ref={dropdownRef}
      className="absolute z-50"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <Card className="w-64 shadow-lg">
        <CardContent className="p-1">
          <div className="text-xs p-2 text-muted-foreground">
            Reference a document
          </div>
          <div className="overflow-y-auto max-h-48">
            {filteredDocuments.map((doc, index) => (
              <Button
                key={doc.id}
                variant="ghost"
                className={`w-full justify-start px-2 py-1 h-auto text-sm ${
                  selectedIndex === index ? 'bg-primary text-primary-foreground' : ''
                }`}
                onClick={() => handleSelectDocument(doc.id, doc.title)}
              >
                {doc.title}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AtMentionPlugin;
