import { claudeClient, Message } from './aiService';

// Text analysis types
export interface AnalysisOptions {
  grammar?: boolean;
  style?: boolean;
  readability?: boolean;
  brevity?: boolean;
  cliches?: boolean;
  passiveVoice?: boolean;
  confidence?: boolean;
  citation?: boolean;
  repetition?: boolean;
}

export interface TextAnalysisSuggestion {
  type: keyof AnalysisOptions;
  text: string;
  replacementText?: string;
  explanation: string;
  position?: {
    start: number;
    end: number;
  };
}

export interface TextAnalysisResult {
  suggestions: TextAnalysisSuggestion[];
}

// Text Analysis Service
export const textAnalysisService = {
  // Analyze text with specified options
  async analyzeText(
    text: string, 
    options: AnalysisOptions = {}
  ): Promise<TextAnalysisResult> {
    // Skip empty text
    if (!text || text.trim() === '') {
      return { suggestions: [] };
    }
    
    // Enable defaults if not specified
    const analysisOptions = {
      grammar: true,
      style: true,
      readability: true,
      ...options
    };
    
    // Build system message
    const systemMessage: Message = {
      role: 'system',
      content: `You are an expert writing assistant with a specialty in writing analysis. 
      Analyze the text and provide specific, actionable suggestions for improvement.
      Focus on the following aspects: ${this.buildOptionsString(analysisOptions)}.
      
      Provide suggestions in JSON format only, with no additional text. Each suggestion should have the following structure:
      {
        "type": "grammar|style|readability|etc",
        "text": "the original text with the issue",
        "replacementText": "suggested replacement text",
        "explanation": "brief explanation of the issue and improvement"
      }
      
      Wrap the entire response in a JSON array of suggestions. Return an empty array if no issues are found.
      Do not include any markdown formatting, just raw JSON.`
    };
    
    // Build user message
    const userMessage: Message = {
      role: 'user',
      content: text
    };
    
    try {
      // Call Claude API
      const response = await claudeClient.generateResponse([
        systemMessage,
        userMessage
      ]);
      
      // Parse response as JSON
      try {
        // Clean the response to ensure it's valid JSON
        const cleanedResponse = this.cleanJsonResponse(response.text);
        const suggestions = JSON.parse(cleanedResponse);
        
        if (Array.isArray(suggestions)) {
          return { suggestions };
        } else {
          console.error('Invalid response format:', response.text);
          return { suggestions: [] };
        }
      } catch (e) {
        console.error('Failed to parse analysis response:', e);
        return { suggestions: [] };
      }
    } catch (error) {
      console.error('Error analyzing text:', error);
      return { suggestions: [] };
    }
  },
  
  // Clean JSON response
  cleanJsonResponse(text: string): string {
    // Remove any markdown code block formatting
    text = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '');
    
    // Remove any leading/trailing non-JSON content
    const jsonStartIndex = text.indexOf('[');
    const jsonEndIndex = text.lastIndexOf(']') + 1;
    
    if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
      return text.substring(jsonStartIndex, jsonEndIndex);
    }
    
    return text;
  },
  
  // Build options string for prompt
  buildOptionsString(options: AnalysisOptions): string {
    const enabledOptions = Object.entries(options)
      .filter(([_, enabled]) => enabled)
      .map(([option]) => option);
    
    if (enabledOptions.length === 0) {
      return 'grammar, style, and readability';
    }
    
    return enabledOptions.join(', ');
  }
};
