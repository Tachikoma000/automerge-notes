import { vectorStore } from './vectorStore';
import { claudeClient } from './aiService';
import { NoteDoc } from '../../repo';
import { getDocument } from '../documentService';

// Context types
export interface DocumentContext {
  title: string;
  content: string;
  url: string;
  relevance?: number; // 0-1 relevance score
}

export interface ContextRequest {
  currentDocument: NoteDoc;
  currentDocumentId: string;
  referencedDocumentIds?: string[];
  query?: string;
  maxTokens?: number;
}

// Context Manager Service
export const contextManager = {
  // Build context for AI prompt
  async buildContext(request: ContextRequest): Promise<{
    systemContext: string;
    referencedDocuments: DocumentContext[];
  }> {
    const {
      currentDocument,
      currentDocumentId,
      referencedDocumentIds = [],
      query,
      maxTokens = 4000
    } = request;
    
    // Always include the current document
    const documents: DocumentContext[] = [{
      title: currentDocument.title || 'Current Document',
      content: currentDocument.text || '',
      url: currentDocumentId,
      relevance: 1.0
    }];
    
    // Add explicitly referenced documents
    if (referencedDocumentIds.length > 0) {
      for (const docId of referencedDocumentIds) {
        try {
          const handle = getDocument(docId);
          if (handle) {
            const doc = await handle.doc();
            if (doc) {
              documents.push({
                title: doc.title || 'Referenced Document',
                content: doc.text || '',
                url: docId,
                relevance: 0.9 // High relevance since explicitly referenced
              });
            }
          }
        } catch (error) {
          console.error(`Error loading referenced document ${docId}:`, error);
        }
      }
    }
    
    // Find semantically similar documents if query provided
    if (query && query.trim()) {
      try {
        // Generate embedding for query
        const embeddings = await claudeClient.generateEmbeddings([query]);
        if (embeddings && embeddings.length > 0) {
          const queryEmbedding = embeddings[0];
          
          // Find similar documents
          const similarDocs = await vectorStore.findSimilar(queryEmbedding, 3, 0.75);
          
          // Add to context if not already included
          for (const doc of similarDocs) {
            if (!documents.some(d => d.url === doc.documentId) && 
                doc.documentId !== currentDocumentId) {
              
              // Try to get document title
              let title = 'Related Document';
              try {
                const handle = getDocument(doc.documentId);
                if (handle) {
                  const fullDoc = await handle.doc();
                  if (fullDoc && fullDoc.title) {
                    title = fullDoc.title;
                  }
                }
              } catch (error) {
                console.error(`Error getting title for document ${doc.documentId}:`, error);
              }
              
              documents.push({
                title: title,
                content: doc.text,
                url: doc.documentId,
                relevance: doc.score
              });
            }
          }
        }
      } catch (error) {
        console.error('Error finding similar documents:', error);
      }
    }
    
    // Build system context
    const systemContext = this.buildSystemContext(documents, maxTokens);
    
    return {
      systemContext,
      referencedDocuments: documents.filter(d => d.url !== currentDocumentId)
    };
  },
  
  // Build system context string
  buildSystemContext(documents: DocumentContext[], maxTokens: number): string {
    // Sort by relevance
    const sortedDocs = [...documents].sort((a, b) => 
      (b.relevance || 0) - (a.relevance || 0)
    );
    
    let context = 'You are an AI writing assistant helping with the following documents:\n\n';
    
    // Add documents until we approach token limit
    // This is a simplification - in reality, would need proper token estimation
    for (const doc of sortedDocs) {
      const docContext = `DOCUMENT: ${doc.title}\nCONTENT:\n${doc.content}\n\n`;
      
      // Crude token estimation (approx 4 chars per token)
      if ((context.length + docContext.length) / 4 > maxTokens * 0.8) {
        // If adding full document would exceed limit, add summary instead
        context += `DOCUMENT: ${doc.title}\nSUMMARY: This is a related document that may be relevant.\n\n`;
      } else {
        context += docContext;
      }
    }
    
    return context;
  },
  
  // Extract mentioned document references from text
  extractDocumentReferences(text: string): string[] {
    // Simple regex to find @DocumentName mentions
    // This could be enhanced with more sophisticated parsing
    const mentionRegex = /@([^@\s]+)/g;
    const mentions = text.match(mentionRegex) || [];
    
    // Remove the @ symbol
    return mentions.map(mention => mention.substring(1));
  }
};
