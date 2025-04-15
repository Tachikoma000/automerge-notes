import { chunkDocument } from './textChunker';
import { vectorStore } from './vectorStore';
import { claudeClient } from './aiService';
import { NoteDoc } from '../../repo';
import { getDocument, getAllDocuments } from '../documentService';
import { aiSettings } from './aiSettings';

// Indexing options type
export interface IndexingOptions {
  forceReindex?: boolean;
  documentIds?: string[];
}

// Indexing state
interface IndexingState {
  isIndexing: boolean;
  progress: number; // 0-100
  lastIndexed: Date | null;
}

// Internal state
let indexingState: IndexingState = {
  isIndexing: false,
  progress: 0,
  lastIndexed: null
};

// Event listeners
const listeners: Array<(state: IndexingState) => void> = [];

// Store the interval ID outside the object to avoid typing issues
let intervalId: ReturnType<typeof setInterval> | undefined;

// Document Indexing Service
export const indexingService = {
  // Get current indexing state
  getState(): IndexingState {
    return { ...indexingState };
  },
  
  // Subscribe to state changes
  subscribe(listener: (state: IndexingState) => void): () => void {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  },
  
  // Update state and notify listeners
  updateState(newState: Partial<IndexingState>): void {
    indexingState = { ...indexingState, ...newState };
    listeners.forEach(listener => listener(indexingState));
  },
  
  // Index a single document
  async indexDocument(documentId: string): Promise<boolean> {
    // Skip if indexing is disabled
    if (!aiSettings.getSettings().indexing.enabled) {
      return false;
    }
    
    try {
      // Get document
      const handle = getDocument(documentId);
      if (!handle) return false;
      
      const doc = await handle.doc();
      
      // Skip empty or undefined documents
      if (!doc || !doc.text || doc.text.trim() === '') {
        return true; // Successfully skipped
      }
      
      // Chunk the document
      const chunks = chunkDocument(doc.text);
      
      if (chunks.length === 0) {
        return true; // Empty document, successfully skipped
      }
      
      // Generate embeddings
      const textsToEmbed = chunks.map(chunk => chunk.text);
      
      // Check if API key is set
      if (!aiSettings.getSettings().apiKey) {
        console.warn('API key not set, skipping embeddings generation');
        return false;
      }
      
      // Generate embeddings using Claude API
      const embeddings = await claudeClient.generateEmbeddings(textsToEmbed);
      
      // Store in vector store
      const chunksWithEmbeddings = chunks.map((chunk, i) => ({
        ...chunk,
        embedding: embeddings[i] || [] // Fallback to empty array if undefined
      }));
      
      await vectorStore.storeDocument(documentId, doc?.title || 'Untitled');
      await vectorStore.storeChunks(documentId, chunksWithEmbeddings);
      
      return true;
    } catch (error) {
      console.error('Error indexing document:', error);
      return false;
    }
  },
  
  // Index all documents
  async indexAllDocuments(options: IndexingOptions = {}): Promise<boolean> {
    // Skip if indexing is disabled
    if (!aiSettings.getSettings().indexing.enabled) {
      return false;
    }
    
    // Avoid concurrent indexing
    if (indexingState.isIndexing) {
      return false;
    }
    
    try {
      this.updateState({ isIndexing: true, progress: 0 });
      
      // Get documents to index
      let documents;
      if (options.documentIds && options.documentIds.length > 0) {
        documents = options.documentIds;
      } else {
        const allDocs = await getAllDocuments();
        documents = allDocs.map(doc => doc.id);
      }
      
      // Index each document
      for (let i = 0; i < documents.length; i++) {
        await this.indexDocument(documents[i]);
        
        // Update progress
        const progress = Math.round(((i + 1) / documents.length) * 100);
        this.updateState({ progress });
      }
      
      this.updateState({ 
        isIndexing: false, 
        progress: 100,
        lastIndexed: new Date()
      });
      
      return true;
    } catch (error) {
      console.error('Error indexing documents:', error);
      this.updateState({ isIndexing: false });
      return false;
    }
  },
  
  // Schedule indexing based on user settings
  scheduleIndexing(): void {
    const settings = aiSettings.getSettings();
    
    // Clear any existing schedules
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = undefined;
    }
    
    // Skip if disabled
    if (!settings.indexing.enabled) {
      return;
    }
    
    // Set up new schedule
    switch (settings.indexing.frequency) {
      case 'hourly':
        intervalId = setInterval(() => this.indexAllDocuments(), 60 * 60 * 1000);
        break;
      case 'daily':
        intervalId = setInterval(() => this.indexAllDocuments(), 24 * 60 * 60 * 1000);
        break;
      // onSave is handled separately in document service
    }
  }
};

// Initialize indexing schedule
indexingService.scheduleIndexing();
