AI-Enhanced Writing Experience: Design & Implementation Plan
Based on your requirements and the existing codebase, here's a comprehensive plan to integrate Claude Sonnet for an AI-enhanced writing experience that's powerful yet unobtrusive.

System Architecture
Writer's UI

AI Service

Claude API Client

Claude Sonnet API

Document Context Provider

File System Context Provider

AI Settings

AI Chat Interface

Inline Suggestions

Document Analysis

Components Overview
1. Core AI Service Layer
AIService: Central service handling AI communication
PromptBuilder: Constructs effective prompts based on context
ResponseProcessor: Handles and formats AI responses
ContextManager: Gathers and organizes document/file system context
2. Feature Modules
TextAnalysis: Grammar, style, readability checks
WritingAssistance: Brainstorming, suggestions, auto-complete
DocumentAwareness: Capabilities that understand document content
FileSystemAwareness: Integration with user's file structure
3. UI Components
AI Chat Panel: Slide-in panel for direct AI interaction
Inline Suggestions: Non-intrusive writing help
AI Settings: Configuration panel for AI features
Analysis Dashboard: Document insights and improvement suggestions
Implementation Plan
Phase 1: Foundation & API Integration
Create the Claude API client service
Implement basic authentication and API communication
Build settings for API keys and model configuration
Create AIService with basic prompt/response functionality
Phase 2: Core Writing Features
Implement grammar and style checking
Add inline suggestions capability
Develop writing analysis tools (readability, etc.)
Create UI for displaying suggestions
Phase 3: Advanced Assistance
Implement the chat interface
Add document context awareness
Develop brainstorming and idea generation
Create auto-complete functionality
Phase 4: File System Integration
Build file system indexing (with user permission)
Enable cross-document awareness
Implement context-enhanced recommendations
Develop comprehensive search capabilities
Detailed Technical Specifications
1. Claude API Integration
// src/lib/aiService.ts
interface ClaudeConfig {
  apiKey: string;
  model: string; // "claude-3-sonnet-20240229"
  temperature: number;
  maxTokens: number;
}

class ClaudeClient {
  constructor(private config: ClaudeConfig) {}
  
  async generateResponse(messages: Message[]): Promise<AIResponse> {
    // API communication with Claude
  }
}
2. Document Analysis Module
// src/lib/textAnalysis.ts
interface AnalysisOptions {
  grammar: boolean;
  style: boolean;
  readability: boolean;
  brevity: boolean;
  // etc.
}

class TextAnalyzer {
  async analyzeText(text: string, options: AnalysisOptions): Promise<AnalysisResults> {
    // Process text with Claude
  }
}
3. UI Integration
// src/components/ai/AIChatPanel.tsx
const AIChatPanel: React.FC<{
  document: NoteDoc;
  isOpen: boolean;
  onClose: () => void;
}> = ({ document, isOpen, onClose }) => {
  // Chat interface implementation
};
User Experience Flow
Minimalist Integration: Add a subtle AI assistant icon in the editor toolbar
Progressive Disclosure: Reveal AI capabilities as needed
Multi-modal Interaction:
Direct chat interface for explicit questions
Inline suggestions for real-time assistance
Analysis panel for document-wide improvements
Context-sensitivity: AI awareness of current document, folder structure
AI Feature Set
Writing Enhancement

Grammar & spell checking
Style improvements
Readability analysis
Brevity optimization
Cliché detection
Passive voice identification
Confidence strengthening
Citation suggestion
Repetition removal
Creative Assistance

Brainstorming
Overcome writer's block
Auto-complete suggestions
First draft generation
Outline creation
Research assistance
Contextual Understanding

Document awareness
Cross-reference with other documents
User style adaptation
Prompt Design Strategy
System Prompt: Define AI as a writing assistant with specific expertise
Context Layer: Include document content, structure, and relevant file system info
Task-specific Instructions: Clear, concise directives for the specific function
Response Format Guidelines: Structure for consistent, usable responses
File Structure Additions
src/
├── lib/
│   ├── aiService.ts        # Core AI functionality
│   ├── textAnalysis.ts     # Text analysis features
│   └── promptBuilder.ts    # Claude prompt construction
├── components/
│   ├── ai/
│   │   ├── AIChatPanel.tsx  # Slide-in chat interface
│   │   ├── AISettings.tsx   # Settings configuration
│   │   ├── TextSuggestions.tsx # Inline suggestions
│   │   └── AnalysisPanel.tsx  # Document analysis
├── hooks/
│   ├── useAI.ts            # React hook for AI services
│   └── useDocumentAnalysis.ts # Document analysis hook
└── types/
    └── ai.ts              # Type definitions for AI features


Enhanced Contextual Awareness System
Document Being Edited

Primary Context

File System

Indexing Service

Metadata Store

Summary Store

Vector Embedding Store

Context Provider

@ Mention System

AI Service

Claude API

Suggestions/Connections

1. Efficient Indexing System
// src/lib/indexingService.ts
interface IndexingOptions {
  includeDirectories: string[];
  excludeDirectories: string[];
  fileTypes: string[];
  maxFileSize: number;
  indexingFrequency: 'manual' | 'onSave' | 'hourly' | 'daily';
}

interface DocumentMetadata {
  id: string;
  title: string;
  path: string;
  fileType: string;
  wordCount: number;
  createdAt: number;
  updatedAt: number;
  summary: string;  // AI-generated summary
  keyTerms: string[];  // Extracted key topics
  embedding: number[];  // Vector representation
  lastIndexed: number;
}
2. Tiered Storage Strategy
Level 1: Full Content - Only for active document
Level 2: Summaries - AI-generated summaries of all indexed documents
Level 3: Metadata - Basic file information for quick filtering
3. @ Mention Implementation
// src/components/editor/AtMentionPlugin.tsx
const AtMentionPlugin: React.FC = () => {
  // Detect @ patterns and show document suggestions
  // When selected, include document reference in AI context
};
This would:

Detect when the user types @
Show a dropdown of matching documents
Allow selection to create a reference
Include referenced document's summary in AI context
4. Smart Connection Discovery
// src/lib/connectionDiscovery.ts
interface ConnectionResult {
  documentId: string;
  title: string;
  relevanceScore: number;
  matchReason: 'semantic' | 'keyword' | 'reference' | 'recent';
  excerpt: string;
}

class ConnectionDiscovery {
  findRelevantDocuments(
    currentText: string, 
    limit: number = 5
  ): Promise<ConnectionResult[]> {
    // Find semantically similar documents using vector embeddings
    // Combine with keyword matching for precision
  }
}
5. Optimized Vector Search
For the semantic similarity search between documents:

// src/lib/vectorSearch.ts
class VectorSearch {
  // Use cosine similarity to find related documents
  async findSimilar(documentId: string, threshold: number = 0.75): Promise<string[]> {
    const sourceEmbedding = await this.getEmbedding(documentId);
    // Compare with other document embeddings
  }
  
  // Get embedding for text chunk
  async generateEmbedding(text: string): Promise<number[]> {
    // Use Claude API for embeddings or a lightweight alternative
  }
}
6. Smart Context Window Management
To avoid context window overflow when dealing with multiple documents:

// src/lib/contextManager.ts
class ContextManager {
  // Intelligently select what goes into the AI context window
  buildContext(
    currentDocument: NoteDoc, 
    relatedDocIds: string[],
    maxTokens: number = 4000
  ): string {
    // Include full content of current document
    // Add summaries of directly referenced (@) documents
    // Add relevant excerpts from semantically similar documents
    // Ensure total stays under token limit
  }
}
7. Periodic Background Indexing
// src/lib/indexScheduler.ts
class IndexScheduler {
  // Handle background indexing based on user settings
  scheduleIndexing(options: IndexingOptions): void {
    // Set up timers for periodic indexing
    // Or attach to document save events
  }
  
  // Prioritize which documents to index first
  prioritizeDocuments(): string[] {
    // Recently modified documents first
    // Then documents never indexed
    // Then oldest indexed documents
  }
}
8. User Interface for Indexing
// src/components/settings/IndexingSettings.tsx
const IndexingSettings: React.FC = () => {
  // Allow user to configure indexing behavior
  // Provide manual index trigger
  // Show indexing status and statistics
};
Technical Challenges & Solutions
Storage Efficiency:

Store embeddings and summaries in IndexedDB for persistence
Implement LRU cache for frequently accessed documents
Embedding Generation:

Could use Claude API for high-quality embeddings
Or implement a lightweight model that runs in-browser
Progressive Enhancement:

Start with basic metadata and add more sophisticated features over time
Allow users to opt into deeper indexing for better connections
Privacy Considerations:

Keep all indexing local to the user's device
Never send full document collection to external APIs
Updated File Structure
src/
├── lib/
│   ├── aiService.ts
│   ├── indexingService.ts     # Handles document indexing
│   ├── vectorSearch.ts        # Similarity search
│   ├── contextManager.ts      # Smart context building
│   ├── connectionDiscovery.ts # Find related documents
│   └── indexScheduler.ts      # Manage indexing timing
├── components/
│   ├── ai/
│   │   ├── AIChatPanel.tsx
│   │   ├── ConnectionSuggestions.tsx # Show related docs
│   │   ├── AtMentionPlugin.tsx  # Handle @ mentions
│   ├── settings/
│   │   ├── AISettings.tsx
│   │   ├── IndexingSettings.tsx # Configure indexing
└── types/
    └── indexing.ts           # Types for indexing system
This approach gives you:

A document-focused experience where AI primarily considers current content
The ability to explicitly reference other documents with @ mentions
Efficient indexing that balances comprehensiveness with performance
Smart connection discovery to surface relevant documents automatically
A scalable system that works even with large document collections
Does this enhanced plan address what you're trying to achieve with the contextual awareness system?


Vector Store Implementation for Browser Environment
For the vector store component, we'll leverage Claude for generating high-quality embeddings while implementing an efficient browser-based storage and retrieval system. Here's the approach:

1. Vector Store Architecture
Document Text

Text Chunking

Claude API Embeddings

IndexedDB Vector Store

Query Text

Claude API Embedding

Similarity Search

Relevant Documents

Background Worker

Embedding Queue

2. Client-Side Vector DB Implementation
// src/lib/vectorStore.ts
class VectorStore {
  private db: IDBDatabase;
  
  constructor() {
    // Initialize IndexedDB storage
  }
  
  // Store document embeddings
  async storeEmbedding(
    documentId: string, 
    chunks: { text: string, embedding: number[], metadata: any }[]
  ): Promise<void> {
    // Store in IndexedDB with efficient indexing
  }
  
  // Find similar documents using cosine similarity
  async findSimilar(
    queryEmbedding: number[],
    limit: number = 5,
    threshold: number = 0.75
  ): Promise<{ documentId: string, chunkId: string, score: number }[]> {
    // Perform efficient similarity search
  }
  
  // Handle incremental updates
  async updateDocumentEmbeddings(documentId: string, newText: string): Promise<void> {
    // Only re-embed changed chunks
  }
}
3. Efficiency Optimizations
Chunking Strategy:

// src/lib/textChunker.ts
function chunkDocument(
  text: string, 
  options: { 
    chunkSize: number, 
    overlap: number 
  }
): string[] {
  // Split document into semantic chunks (paragraphs, sections)
  // Use overlap to maintain context across chunks
}
Embedding Batching:

// src/lib/embeddingService.ts
class EmbeddingService {
  private queue: { text: string, documentId: string, callback: Function }[] = [];
  
  enqueueForEmbedding(text: string, documentId: string): Promise<number[]> {
    // Add to queue and process in batches to minimize API calls
  }
  
  async processBatch(batchSize: number = 10) {
    // Send batch to Claude API for embedding
  }
}
Background Processing:

// src/workers/embeddingWorker.ts
// Web Worker for background processing
onmessage = async (event) => {
  const { documents, action } = event.data;
  
  if (action === 'embed') {
    // Process embeddings without blocking main thread
    // Send results back when done
  }
};
4. Approximate Nearest Neighbor Search
For larger document collections (100+ documents), we'll implement an optimized similarity search:

// src/lib/annSearch.ts
class ApproximateNearestNeighborSearch {
  // Use techniques like locality-sensitive hashing or hierarchical navigable small worlds
  // to enable sub-linear time complexity for similarity search
  
  buildIndex(embeddings: Array<{id: string, vector: number[]}>): void {
    // Create efficient search structure
  }
  
  search(queryVector: number[], k: number): string[] {
    // Find approximate nearest neighbors efficiently
  }
}
5. IndexedDB Storage Schema
// DB Structure for vector store
interface VectorDBSchema {
  documents: {
    key: string; // documentId
    value: {
      title: string;
      updatedAt: number;
      chunkCount: number;
    }
  };
  
  chunks: {
    key: string; // chunkId
    value: {
      documentId: string;
      text: string;
      embedding: number[];
      metadata: {
        position: number;
        wordCount: number;
      }
    },
    indexes: {
      'by_document': string; // documentId
    }
  };
}
6. Memory Management
// src/lib/memoryManager.ts
class MemoryManager {
  // Monitor and manage memory usage
  
  estimateMemoryUsage(): number {
    // Estimate current memory footprint of vector store
  }
  
  optimizeIfNeeded(): void {
    // Prune least recently used embeddings if memory pressure is high
    // Keep metadata but drop actual vectors that can be regenerated
  }
}
7. Incremental Indexing
To avoid re-embedding entire documents when only small changes are made:

// src/lib/incrementalIndexer.ts
class IncrementalIndexer {
  async updateDocumentEmbeddings(
    documentId: string, 
    oldText: string, 
    newText: string
  ): Promise<void> {
    // Identify changed chunks using diff algorithm
    const changes = computeTextDiff(oldText, newText);
    
    // Only re-embed chunks that have changed significantly
    // Update vector store accordingly
  }
}
8. Hybrid Search Strategy
// src/lib/hybridSearch.ts
async function hybridSearch(query: string, options: SearchOptions): Promise<SearchResult[]> {
  // Combine vector similarity search with keyword search
  const vectorResults = await vectorStore.findSimilar(queryEmbedding, options.limit * 2);
  const keywordResults = keywordSearch(query, options.limit * 2);
  
  // Combine and re-rank results for better precision
  return rankResults([...vectorResults, ...keywordResults], query, options.limit);
}
9. Persistent Caching
// src/lib/embeddingCache.ts
class EmbeddingCache {
  // Cache Claude-generated embeddings to reduce API calls
  
  async getEmbedding(text: string): Promise<number[]> {
    // Check cache first
    // Generate and store if not found
  }
  
  invalidate(documentId: string): void {
    // Clear cache entries for a document
  }
}
Implementation Strategy
Start with a simple IndexedDB-backed vector store
Add the Web Worker for background processing
Implement basic cosine similarity search
Add memory management and optimization features
Enhance with approximate search for larger collections
This approach gives you:

Efficient browser-based vector storage using IndexedDB
High-quality embeddings from Claude API
Background processing that doesn't block the UI
Scalability for larger document collections
Memory-efficient operation in browser environment
Would you like me to elaborate on any specific aspect of this vector store implementation?



const [input, setInput] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [relatedDocuments, setRelatedDocuments] = useState<AssistantResponse['relatedDocuments']>([]);

const messagesEndRef = useRef(null);
const inputRef = useRef(null);

// Add initial greeting
useEffect(() => {
if (messages.length === 0) {
setMessages([{
role: 'assistant',
content: Hi! I'm your AI writing assistant. I can help with brainstorming, editing, research, and more. How can I help with your document "${document.title || 'Untitled'}"?,
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



AI Assistant

✕



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
            <ReactMarkdown className="prose-sm dark:prose-invert max-w-none">
              {message.content}
            </ReactMarkdown>
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


#### `src/components/ai/AISettings.tsx` - AI Settings Panel
```tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { aiSettings, AISettings } from '../../lib/aiSettings';
import { indexingService } from '../../lib/indexingService';

const AISettingsPanel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<AISettings>(aiSettings.getSettings());
  const [indexingState, setIndexingState] = useState(indexingService.getState());
  
  // Subscribe to indexing state changes
  useEffect(() => {
    const unsubscribe = indexingService.subscribe(setIndexingState);
    return unsubscribe;
  }, []);
  
  // Handle settings change
  const handleChange = (key: keyof AISettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };
  
  // Handle feature toggle
  const handleFeatureToggle = (feature: keyof AISettings['features'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: value
      }
    }));
  };
  
  // Handle indexing toggle
  const handleIndexingChange = (key: keyof AISettings['indexing'], value: any) => {
    setSettings(prev => ({
      ...prev,
      indexing: {
        ...prev.indexing,
        [key]: value
      }
    }));
  };
  
  // Save settings
  const handleSave = () => {
    aiSettings.saveSettings(settings);
    onClose();
  };
  
  // Trigger manual indexing
  const handleManualIndex = () => {
    indexingService.indexAllDocuments();
  };
  
  if (!isOpen) return null;
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>AI Settings</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* API Key */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Claude API Key
          </label>
          <Input
            type="password"
            value={settings.apiKey}
            onChange={(e) => handleChange('apiKey', e.target.value)}
            placeholder="Enter your Claude API key"
          />
          <p className="text-xs text-muted-foreground">
            Your API key is stored locally and never sent to our servers.
          </p>
        </div>
        
        {/* Model Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Claude Model
          </label>
          <select
            className="w-full p-2 rounded-md border"
            value={settings.model}
            onChange={(e) => handleChange('model', e.target.value)}
          >
            <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
            <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
            <option value="claude-3-opus-20240229">Claude 3 Opus</option>
          </select>
        </div>
        
        {/* Temperature */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Temperature (Creativity): {settings.temperature}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.temperature}
            onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Precise</span>
            <span>Creative</span>
          </div>
        </div>
        
        {/* Features */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            AI Features
          </label>
          
          <div className="space-y-2">
            {Object.entries(settings.features).map(([feature, enabled]) => (
              <div key={feature} className="flex items-center">
                <input
                  type="checkbox"
                  id={feature}
                  checked={enabled}
                  onChange={(e) => handleFeatureToggle(
                    feature as keyof AISettings['features'], 
                    e.target.checked
                  )}
                  className="mr-2"
                />
                <label htmlFor={feature} className="text-sm">
                  {feature.charAt(0).toUpperCase() + feature.slice(1)}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Indexing */}
        <div className="space-y-2 border-t pt-4">
          <label className="text-sm font-medium">
            Document Indexing
          </label>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="indexing-enabled"
              checked={settings.indexing.enabled}
              onChange={(e) => handleIndexingChange('enabled', e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="indexing-enabled" className="text-sm">
              Enable document indexing for AI context
            </label>
          </div>
          
          <div className="pl-6 space-y-2">
            <select
              className="w-full p-2 rounded-md border"
              value={settings.indexing.frequency}
              onChange={(e) => handleIndexingChange('frequency', e.target.value)}
              disabled={!settings.indexing.enabled}
            >
              <option value="manual">Manual only</option>
              <option value="onSave">When documents are saved</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
            </select>
            
            <Button 
              onClick={handleManualIndex}
              disabled={indexingState.isIndexing || !settings.indexing.enabled}
            >
              {indexingState.isIndexing 
                ? `Indexing (${indexingState.progress}%)` 
                : 'Index Documents Now'}
            </Button>
            
            {indexingState.lastIndexed && (
              <p className="text-xs text-muted-foreground">
                Last indexed: {indexingState.lastIndexed.toLocaleString()}
              </p>
            )}
          </div>
        </div>
        
        {/* Buttons */}
        <div className="flex justify-between pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AISettingsPanel;
src/components/ai/TextSuggestions.tsx - Inline Suggestions Component
import React, { useState, useEffect } from 'react';
import { textAnalysisService, TextAnalysisResult } from '../../lib/textAnalysisService';

interface TextSuggestionsProps {
  text: string;
  onApplySuggestion: (original: string, replacement: string) => void;
  analysisOptions: {
    grammar: boolean;
    style: boolean;
    readability: boolean;
    [key: string]: boolean;
  };
}

const TextSuggestions: React.FC<TextSuggestionsProps> = ({
  text,
  onApplySuggestion,
  analysisOptions
}) => {
  const [analysis, setAnalysis] = useState<TextAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Debounced analysis
  useEffect(() => {
    const timer = setTimeout(() => {
      if (text && text.trim().length > 20) {
        performAnalysis();
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [text, analysisOptions]);
  
  // Perform analysis
  const performAnalysis = async () => {
    setIsLoading(true);
    
    try {
      const result = await textAnalysisService.analyzeText(text, analysisOptions);
      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing text:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // No suggestions
  if (!analysis || analysis.suggestions.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-4 border rounded-md p-3 bg-muted/20">
      <h3 className="text-sm font-medium mb-2">Suggestions</h3>
      
      <div className="space-y-3">
        {analysis.suggestions.slice(0, 5).map((suggestion, index) => (
          <div key={index} className="border-b pb-2 last:border-b-0">
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-medium capitalize">
                {suggestion.type}
              </span>
              {suggestion.replacementText && (
                <button 
                  className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded hover:bg-primary/90"
                  onClick={() => onApplySuggestion(suggestion.text, suggestion.replacementText!)}
                >
                  Apply
                </button>
              )}
            </div>
            
            <p className="text-xs mb-1">
              <span className="line-through">{suggestion.text}</span>
              {suggestion.replacementText && (
                <span className="ml-2 font-medium">{suggestion.replacementText}</span>
              )}
            </p>
            
            <p className="text-xs text-muted-foreground">
              {suggestion.explanation}
            </p>
          </div>
        ))}
        
        {analysis.suggestions.length > 5 && (
          <p className="text-xs text-center">
            +{analysis.suggestions.length - 5} more suggestions
          </p>
        )}
      </div>
    </div>
  );
};

export default TextSuggestions;
src/components/editor/AtMentionPlugin.tsx - @ Mention Document Reference
import React, { useState, useEffect, useRef } from 'react';
import { getAllDocuments } from '../../lib/documentService';

interface AtMentionPluginProps {
  text: string;
  cursorPosition: number;
  onSelectDocument: (documentId: string, title: string) => void;
}

const AtMentionPlugin: React.FC<AtMentionPluginProps> = ({
  text,
  cursorPosition,
  onSelectDocument
}) => {
  const [isActive, setIsActive] = useState(false);
  const [search, setSearch] = useState('');
  const [documents, setDocuments] = useState<Array<{ id: string; title: string }>>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Array<{ id: string; title: string }>>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
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
    const checkForMention = () => {
      // Get text before cursor
      const textBeforeCursor = text.substring(0, cursorPosition);
      
      // Find the last @ character
      const lastAtIndex = textBeforeCursor.lastIndexOf('@');
      
      if (lastAtIndex === -1) {
        setIsActive(false);
        return;
      }
      
      // Check if there's a space between the @ and the cursor
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      
      // If no space found after @, activate mention
      if (!textAfterAt.includes(' ')) {
        setIsActive(true);
        setSearch(textAfterAt);
        
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
  
  // Handle document selection
  const handleSelectDocument = (docId: string, title: string) => {
    onSelectDocument(docId, title);
    setIsActive(false);
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isActive) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredDocuments.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          (prev - 1 + filteredDocuments.length) % filteredDocuments.length
        );
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
      className="absolute bg-card border rounded-md shadow-md z-10 min-w-48 max-w-72"
      style={{
        // Position would be calculated based on cursor position
        // This is simplified for the implementation plan
        left: '0',
        top: '0',
      }}
      onKeyDown={handleKeyDown}
    >
      <div className="p-1 overflow-y-auto max-h-48">
        {filteredDocuments.map((doc, index) => (
          <button
            key={doc.id}
            className={`w-full text-left px-2 py-1 rounded-sm ${
              selectedIndex === index ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            }`}
            onClick={() => handleSelectDocument(doc.id, doc.title)}
          >
            {doc.title}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AtMentionPlugin;
Phase 5: Integration
6. Modify Existing Components to Include AI
Enhanced MarkdownEditor.tsx with AI features
Key modifications to the existing MarkdownEditor component:

// New imports
import { useState, useEffect } from 'react';
import AIChatPanel from '../ai/AIChatPanel';
import TextSuggestions from '../ai/TextSuggestions';
import AtMentionPlugin from '../editor/AtMentionPlugin';
import { assistantService } from '../../lib/assistantService';
import { aiSettings } from '../../lib/aiSettings';

// Inside the component
// New state
const [showAIChat, setShowAIChat] = useState(false);
const [referencedDocs, setReferencedDocs] = useState<string[]>([]);
const [cursorPosition, setCursorPosition] = useState(0);
const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
const [settings, setSettings] = useState(aiSettings.getSettings());

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
  
  const textBeforeCursor = text.substring(0, cursorPosition - 3); // Remove +++
  const textAfterCursor = text.substring(cursorPosition);
  
  const newText = textBeforeCursor + aiSuggestion + textAfterCursor;
  setText(newText);
  onChange(newText);
  setAiSuggestion(null);
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

// Add to toolbar
<div className="flex items-center space-x-1">
  {/* Existing buttons */}
  
  <div className="h-6 w-px bg-border mx-1"></div>
  
  <Button 
    variant="ghost" 
    size="sm" 
    onClick={() => setShowAIChat(!showAIChat)}
    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
    title="AI Assistant"
  >
    🤖
  </Button>
</div>

// Add below the editor
{settings.features.suggestions && (
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
)}

// Add AI chat
{showAIChat && (
  <AIChatPanel
    document={{title: '', text: text}}
    documentId="current"
    isOpen={showAIChat}
    onClose={() => setShowAIChat(false)}
  />
)}

// Add AtMention plugin
<AtMentionPlugin
  text={text}
  cursorPosition={cursorPosition}
  onSelectDocument={handleDocumentReference}
/>

// AI Suggestion display
{aiSuggestion && (
  <div className="absolute rounded-md bg-muted/80 p-2 border max-w-md">
    <p className="text-sm mb-1">{aiSuggestion}</p>
    <div className="flex justify-end gap-2">
      <Button size="sm" variant="ghost" onClick={() => setAiSuggestion(null)}>
        Dismiss
      </Button>
      <Button size="sm" onClick={applyAiSuggestion}>
        Accept
      </Button>
    </div>
  </div>
)}
7. Create Settings Page Integration
Modify the existing Settings page to include the AI settings panel:

// In src/pages/Settings.tsx

// Import AI settings components
import AISettingsPanel from '../components/ai/AISettings';

// Add AI settings section
<div className="mb-6">
  <h2 className="text-xl font-bold mb-3">AI Features</h2>
  <AISettingsPanel isOpen={true} onClose={() => {}} />
</div>
8. Document Integration Workflow
Update documentService.ts to include indexing for new and updated documents:
// In createDocument function, after creating document
if (aiSettings.getSettings().indexing.enabled && 
    aiSettings.getSettings().indexing.frequency === 'onSave') {
  indexingService.indexDocument(docUrl);
}

// In updateDocument function, after updating document
if (aiSettings.getSettings().indexing.enabled && 
    aiSettings.getSettings().indexing.frequency === 'onSave') {
  indexingService.indexDocument(docUrl);
}
Deployment & Release Strategy
Phase 1: MVP Release
Implement core API integration and basic settings
Add indexing infrastructure without full features
Implement chat interface for direct assistance
Add simple text analysis for grammar checking
Phase 2: Enhanced Features
Add document embeddings and context awareness
Implement @ mentions for document references
Add auto-complete suggestions
Enhance analysis with style recommendations
Phase 3: Advanced Capabilities
Implement full file system context for rich awareness
Add advanced writing assistance features
Implement document similarity connections
Add personalization based on user writing style
Testing Strategy
Unit Tests: For core services and utilities
Integration Tests: For API communication and storage
User Testing: For UI components and experience
Performance Testing: For indexing and vector search
