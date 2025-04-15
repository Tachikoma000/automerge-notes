import { claudeClient, Message } from './aiService';
import { contextManager, ContextRequest } from './contextManager';
import { NoteDoc } from '../../repo';

// Assistant request types
export interface AssistantRequest {
  currentText: string;
  currentDocumentId: string;
  currentDocument: NoteDoc;
  instruction: string;
  referencedDocumentIds?: string[];
}

// Assistant response
export interface AssistantResponse {
  response: string;
  relatedDocuments?: Array<{
    title: string;
    url: string;
    relevance: number;
  }>;
}

// Writing Assistant Service
export const assistantService = {
  // Generate response from assistant
  async generateResponse(request: AssistantRequest): Promise<AssistantResponse> {
    const {
      currentText,
      currentDocumentId,
      currentDocument,
      instruction,
      referencedDocumentIds
    } = request;
    
    // Extract document references from instruction
    const mentionedDocuments = contextManager.extractDocumentReferences(instruction);
    const allReferencedDocs = [
      ...(referencedDocumentIds || []),
      ...mentionedDocuments
    ];
    
    // Build context
    const contextRequest: ContextRequest = {
      currentDocument,
      currentDocumentId,
      referencedDocumentIds: allReferencedDocs,
      query: instruction,
      maxTokens: 4000
    };
    
    const { systemContext, referencedDocuments } = await contextManager.buildContext(contextRequest);
    
    // Build messages
    const messages: Message[] = [
      {
        role: 'system',
        content: `You are an intelligent writing assistant helping a writer with their document. 
        You have access to the current document and other related documents for context.
        Provide helpful, concise, and relevant responses tailored to the writer's needs.
        Be informative, supportive, and focus on providing value.
        
        ${systemContext}`
      },
      {
        role: 'user',
        content: instruction
      }
    ];
    
    try {
      // Generate response
      const response = await claudeClient.generateResponse(messages);
      
      return {
        response: response.text,
        relatedDocuments: referencedDocuments.map(doc => ({
          title: doc.title,
          url: doc.url,
          relevance: doc.relevance || 0
        }))
      };
    } catch (error) {
      console.error('Error generating assistant response:', error);
      throw error;
    }
  },
  
  // Generate text completion suggestion
  async generateCompletion(text: string, maxTokens: number = 100): Promise<string> {
    const messages: Message[] = [
      {
        role: 'system',
        content: `You are an AI writing assistant. Complete the given text naturally, 
        maintaining the style, tone, and context. Provide only the completion text 
        with no additional explanation or formatting. Be concise and relevant.`
      },
      {
        role: 'user',
        content: `Complete this text naturally:\n\n${text}`
      }
    ];
    
    try {
      const response = await claudeClient.generateResponse(messages);
      return response.text;
    } catch (error) {
      console.error('Error generating completion:', error);
      return '';
    }
  },
  
  // Generate first draft or outline
  async generateFirstDraft(topic: string, type: 'outline' | 'draft' = 'outline'): Promise<string> {
    const contentType = type === 'outline' ? 'detailed outline' : 'first draft';
    
    const messages: Message[] = [
      {
        role: 'system',
        content: `You are an expert writer helping to create a ${contentType} on the given topic.
        For outlines, provide a well-structured, hierarchical outline with main points and important subpoints.
        For drafts, write a coherent, well-organized first draft that covers the topic thoroughly but concisely.
        Focus on quality content that would serve as a great starting point for the writer to further refine.`
      },
      {
        role: 'user',
        content: `Create a ${contentType} about: ${topic}`
      }
    ];
    
    try {
      const response = await claudeClient.generateResponse(messages);
      return response.text;
    } catch (error) {
      console.error(`Error generating ${contentType}:`, error);
      return '';
    }
  },
  
  // Brainstorm ideas related to a topic
  async brainstormIdeas(topic: string, count: number = 5): Promise<string[]> {
    const messages: Message[] = [
      {
        role: 'system',
        content: `You are a creative brainstorming assistant. Generate a list of ${count} unique, 
        interesting ideas related to the given topic. Each idea should be distinct and thought-provoking.
        Provide only the ideas themselves, formatted as a JSON array of strings. No additional text.`
      },
      {
        role: 'user',
        content: `Brainstorm ${count} ideas about: ${topic}`
      }
    ];
    
    try {
      const response = await claudeClient.generateResponse(messages);
      
      // Try to parse as JSON
      try {
        // Clean the response to get just the JSON array
        const cleanedResponse = response.text
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
        
        const jsonStartIndex = cleanedResponse.indexOf('[');
        const jsonEndIndex = cleanedResponse.lastIndexOf(']') + 1;
        
        if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
          const jsonStr = cleanedResponse.substring(jsonStartIndex, jsonEndIndex);
          const ideas = JSON.parse(jsonStr);
          
          if (Array.isArray(ideas)) {
            return ideas;
          }
        }
      } catch (e) {
        console.error('Failed to parse ideas as JSON:', e);
      }
      
      // Fallback: split by newlines or bullet points
      const ideas = response.text
        .split(/\n+|\s*•\s*|\s*\d+\.\s+/)
        .map(line => line.trim())
        .filter(line => line && line.length > 0);
      
      return ideas.slice(0, count);
    } catch (error) {
      console.error('Error brainstorming ideas:', error);
      return [];
    }
  }
};
