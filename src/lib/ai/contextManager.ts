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
    
    // Analyze current document structure for better context
    let documentAnalysis = '';
    if (currentDocument.text && currentDocument.text.length > 0) {
      documentAnalysis = this.analyzeDocumentStructure(currentDocument.text);
    }
    
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
  
  // Build system context string with enhanced document understanding
  buildSystemContext(documents: DocumentContext[], maxTokens: number): string {
    // Sort by relevance
    const sortedDocs = [...documents].sort((a, b) => 
      (b.relevance || 0) - (a.relevance || 0)
    );
    
    // Get primary document (the one being edited)
    const primaryDoc = sortedDocs[0];
    const relatedDocs = sortedDocs.slice(1);
    
    // Analyze the document
    const documentAnalysis = this.analyzeDocumentStructure(primaryDoc.content);
    
    // Start with primary document context - but don't include full content
    let context = `You are an AI writing assistant helping with a document titled "${primaryDoc.title}".

${documentAnalysis}

IMPORTANT: When responding to the user:
1. Do NOT repeat large sections of the document content in your responses
2. Refer to specific parts of the document when relevant, but be concise
3. Use brief quotes (1-2 sentences) when necessary to highlight specific points
4. Focus on providing helpful analysis and suggestions rather than repeating content

`;
    
    // Add related documents if available (only titles, not content)
    if (relatedDocs.length > 0) {
      context += `\nRELATED DOCUMENTS:`;
      
      // Just list the related document titles
      for (const doc of relatedDocs) {
        context += `\n- ${doc.title}`;
      }
    }
    
    // Add context about having the document for reference
    context += `\n\nYou have access to the document content for analysis, but do not need to display it back to the user. They already have the document open and can see it.
    
As a writing assistant, your role is to:
1. Help improve the document's content, structure, and clarity
2. Answer questions specifically about this document
3. Provide suggestions tailored to the document's purpose and current state
4. Refer to specific parts of the document when giving feedback
5. Avoid generic advice - be document-specific and actionable

YOU MUST KEEP YOUR RESPONSES FOCUSED AND CONCISE. Avoid long explanations and never repeat large portions of the original document text in your responses.`;
    
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
  },
  
  // Analyze document structure for better context
  analyzeDocumentStructure(text: string): string {
    if (!text || text.trim().length === 0) {
      return 'DOCUMENT ANALYSIS: This document is empty.';
    }
    
    // Count paragraphs
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    // Look for headings (markdown style)
    const headingPattern = /^(#{1,6})\s+(.+)$/gm;
    const headings: {level: number, text: string}[] = [];
    let match;
    
    while ((match = headingPattern.exec(text)) !== null) {
      headings.push({
        level: match[1].length,
        text: match[2].trim()
      });
    }
    
    // Check for code blocks
    const codeBlocks = (text.match(/```[\s\S]*?```/g) || []).length;
    
    // Check for lists
    const bulletLists = (text.match(/^[ \t]*[-*+][ \t]+/gm) || []).length;
    const numberedLists = (text.match(/^[ \t]*\d+\.[ \t]+/gm) || []).length;
    
    // Check for links and images
    const links = (text.match(/\[.+?\]\(.+?\)/g) || []).length;
    const images = (text.match(/!\[.+?\]\(.+?\)/g) || []).length;
    
    // Approximate word count
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    
    // Build analysis
    let analysis = 'DOCUMENT ANALYSIS:\n';
    
    // Document size info
    analysis += `- Word count: Approximately ${wordCount} words\n`;
    analysis += `- Structure: ${paragraphs.length} paragraphs\n`;
    
    // Document organization
    if (headings.length > 0) {
      analysis += `- Contains ${headings.length} headings/sections\n`;
      
      // List major sections (only level 1-2 headings)
      const majorHeadings = headings.filter(h => h.level <= 2);
      if (majorHeadings.length > 0) {
        analysis += `- Major sections: ${majorHeadings.map(h => `"${h.text}"`).join(', ')}\n`;
      }
    }
    
    // Document elements
    const elements = [];
    if (codeBlocks > 0) elements.push(`${codeBlocks} code block(s)`);
    if (bulletLists > 0) elements.push(`bullet lists`);
    if (numberedLists > 0) elements.push(`numbered lists`);
    if (links > 0) elements.push(`${links} link(s)`);
    if (images > 0) elements.push(`${images} image(s)`);
    
    if (elements.length > 0) {
      analysis += `- Special elements: ${elements.join(', ')}\n`;
    }
    
    // Document type inference
    analysis += `- Document type: ${this.inferDocumentType(text, {
      headings, 
      paragraphs: paragraphs.length,
      lists: bulletLists + numberedLists,
      code: codeBlocks
    })}\n`;
    
    return analysis;
  },
  
  // Get a meaningful excerpt from document content
  getDocumentExcerpt(text: string, maxLength: number = 300): string {
    if (!text || text.length === 0) return '';
    
    // If text is short enough, return it all
    if (text.length <= maxLength) return text;
    
    // Try to get the first paragraph if it's a reasonable length
    const paragraphs = text.split(/\n\s*\n/);
    if (paragraphs[0] && paragraphs[0].length <= maxLength * 0.8) {
      return paragraphs[0] + (paragraphs.length > 1 ? '...' : '');
    }
    
    // Otherwise, get the first maxLength characters
    return text.substring(0, maxLength) + '...';
  },
  
  // Infer document type based on content patterns
  inferDocumentType(text: string, stats: {
    headings: {level: number, text: string}[],
    paragraphs: number,
    lists: number,
    code: number
  }): string {
    const { headings, paragraphs, lists, code } = stats;
    
    // Check for code-heavy documents
    if (code > 3 || code > paragraphs * 0.5) {
      return "Technical document or code documentation";
    }
    
    // Check for heading structure pattern
    if (headings.length > 5 && headings.length > paragraphs * 0.3) {
      return "Structured reference document or guide";
    }
    
    // Check for list-heavy content
    if (lists > 5 && lists > paragraphs * 0.5) {
      return "List-based document (notes, outline, or checklist)";
    }
    
    // Check for specific heading patterns
    const headingTexts = headings.map(h => h.text.toLowerCase());
    
    if (headingTexts.some(h => h.includes('introduction') || h.includes('overview')) &&
        headingTexts.some(h => h.includes('conclusion') || h.includes('summary'))) {
      return "Formal article or report";
    }
    
    if (headingTexts.some(h => h.includes('abstract')) &&
        headingTexts.some(h => h.includes('references') || h.includes('bibliography'))) {
      return "Academic paper";
    }
    
    // Default types based on length
    if (paragraphs > 10) {
      return "Long-form document or article";
    } else if (paragraphs >= 3) {
      return "Short document or note";
    } else {
      return "Brief note or draft";
    }
  }
};
