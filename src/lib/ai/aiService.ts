import Anthropic from '@anthropic-ai/sdk';
import { v4 as uuidv4 } from 'uuid';

// Types for API communication
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  text: string;
  messageId: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

// Configuration options
export interface ClaudeConfig {
  apiKey: string;
  model: string; // 'claude-3-sonnet-20240229'
  temperature: number;
  maxTokens: number;
}

// Default configuration
const DEFAULT_CONFIG: ClaudeConfig = {
  apiKey: '', // To be set by user
  model: 'claude-3-sonnet-20240229',
  temperature: 0.7,
  maxTokens: 1000,
};

// Main Claude client
export class ClaudeClient {
  private anthropic: Anthropic;
  private config: ClaudeConfig;
  
  constructor(config: Partial<ClaudeConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.anthropic = new Anthropic({
      apiKey: this.config.apiKey,
      dangerouslyAllowBrowser: true
    });
  }
  
  // Set API key
  setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
    this.anthropic = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true
    });
  }
  
  // Update configuration
  updateConfig(config: Partial<ClaudeConfig>): void {
    this.config = { ...this.config, ...config };
  }
  
  // Generate response from Claude
  async generateResponse(messages: Message[]): Promise<AIResponse> {
    if (!this.config.apiKey) {
      throw new Error('API key not set');
    }
    
    try {
      // Extract system message if present
      const systemMessage = messages.find(msg => msg.role === 'system');
      const userAssistantMessages = messages.filter(msg => msg.role !== 'system');
      
      const response = await this.anthropic.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        system: systemMessage?.content || '',
        messages: userAssistantMessages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
      });
      
      // Check that we have text content to return
      let responseText = '';
      if (response.content && response.content.length > 0) {
        const firstContent = response.content[0];
        if ('text' in firstContent) {
          responseText = firstContent.text;
        }
      }
      
      return {
        text: responseText,
        messageId: response.id,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        }
      };
    } catch (error) {
      console.error('Error calling Claude API:', error);
      throw error;
    }
  }
  
  // Generate embeddings for text
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    if (!this.config.apiKey) {
      throw new Error('API key not set');
    }
    
    try {
      // NOTE: This is a placeholder implementation
      // The actual implementation will depend on the specific SDK version and API structure
      
      // Make a direct fetch request to the Anthropic embeddings API
      const response = await fetch('https://api.anthropic.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01' // Update to the correct version
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229', // Replace with the correct embedding model
          input: texts
        })
      });
      
      if (!response.ok) {
        throw new Error(`Embeddings API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Assuming the API returns an array of embeddings
      // Update this structure based on actual API response
      return data.embeddings as number[][];
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw error;
    }
  }
}

// Mock implementation that works without a real API key
class MockClaudeClient extends ClaudeClient {
  constructor() {
    super();
  }
  
  async generateResponse(messages: Message[]): Promise<AIResponse> {
    // Extract system message if present
    const systemMessage = messages.find(msg => msg.role === 'system')?.content || '';
    
    // Extract user message
    const userMessage = messages.find(msg => msg.role === 'user')?.content || '';
    
    // Generate a mock response
    let responseText = `This is a mock response. The app is running in demo mode without a Claude API key.
    
I see you're working with a document. Here's what I can tell about your request:
    
${userMessage.length < 50 ? "You've provided a brief message. Feel free to elaborate so I can help you better." : "You've provided a detailed message. In production mode, Claude would analyze this and provide a helpful response."}

To use the real Claude AI:
1. Go to Settings > AI Features
2. Enter your Claude API key
3. Configure your preferred model and settings

For now, I'll simulate basic functionality to demonstrate the UI.`;

    // Add a small delay to simulate network request
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      text: responseText,
      messageId: `mock-${Date.now()}`,
      usage: {
        inputTokens: userMessage.length / 4, // Approximate token count
        outputTokens: responseText.length / 4 // Approximate token count
      }
    };
  }
  
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    // Generate random mock embeddings
    return texts.map(() => {
      const dimension = 384; // Common embedding dimension
      return Array.from({ length: dimension }, () => Math.random() - 0.5);
    });
  }
}

// Use real client or mock based on API key
const hasApiKey = localStorage.getItem('claude-api-key') || '';
export const claudeClient = hasApiKey ? new ClaudeClient() : new MockClaudeClient();

// Initialize from local storage
const storedApiKey = localStorage.getItem('claude-api-key');
if (storedApiKey) {
  claudeClient.setApiKey(storedApiKey);
}
