import { ClaudeConfig } from './aiService';

// Key for local storage
const AI_SETTINGS_KEY = 'ai-settings';

// Default settings
const DEFAULT_SETTINGS: AISettings = {
  apiKey: '',
  model: 'claude-3-sonnet-20240229',
  temperature: 0.7,
  maxTokens: 1000,
  features: {
    grammar: true,
    style: true,
    suggestions: true,
    autoComplete: true,
  },
  indexing: {
    enabled: true,
    frequency: 'onSave',
    excludedFolders: [],
  }
};

// Types
export interface AIFeatureSettings {
  grammar: boolean;
  style: boolean;
  suggestions: boolean;
  autoComplete: boolean;
}

export interface IndexingSettings {
  enabled: boolean;
  frequency: 'manual' | 'onSave' | 'hourly' | 'daily';
  excludedFolders: string[];
}

export interface AISettings {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  features: AIFeatureSettings;
  indexing: IndexingSettings;
}

// Settings service
export const aiSettings = {
  // Get current settings
  getSettings(): AISettings {
    const stored = localStorage.getItem(AI_SETTINGS_KEY);
    if (!stored) return DEFAULT_SETTINGS;
    
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch (e) {
      console.error('Failed to parse AI settings:', e);
      return DEFAULT_SETTINGS;
    }
  },
  
  // Save settings
  saveSettings(settings: Partial<AISettings>): void {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(updated));
    
    // Store API key in a separate location for the MockClaudeClient check
    if (settings.apiKey !== undefined) {
      if (settings.apiKey) {
        localStorage.setItem('claude-api-key', settings.apiKey);
      } else {
        localStorage.removeItem('claude-api-key');
      }
    }
    
    // Import claudeClient dynamically to avoid circular dependency
    import('./aiService').then(({ claudeClient }) => {
      // Update the client config if relevant settings changed
      if (settings.apiKey || settings.model || settings.temperature || settings.maxTokens) {
        const config: Partial<ClaudeConfig> = {};
        if (settings.apiKey !== undefined) config.apiKey = settings.apiKey;
        if (settings.model) config.model = settings.model;
        if (settings.temperature) config.temperature = settings.temperature;
        if (settings.maxTokens) config.maxTokens = settings.maxTokens;
        
        claudeClient.updateConfig(config);
        
        // Force reload the page if API key changed to switch between real and mock client
        if (settings.apiKey !== undefined && settings.apiKey !== current.apiKey) {
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }
      }
    });
  },
  
  // Check if API key is set
  hasApiKey(): boolean {
    return !!this.getSettings().apiKey;
  },
};
