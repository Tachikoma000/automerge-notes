import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { aiSettings, AISettings } from '../../lib/ai/aiSettings';
import { indexingService } from '../../lib/ai/indexingService';

interface AISettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AISettingsPanel: React.FC<AISettingsPanelProps> = ({ isOpen, onClose }) => {
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
          <label className="text-sm font-medium dark:text-white">
            Claude API Key
          </label>
          <Input
            type="password"
            value={settings.apiKey}
            onChange={(e) => handleChange('apiKey', e.target.value)}
            placeholder="Enter your Claude API key"
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          <p className="text-xs text-muted-foreground dark:text-gray-300">
            Your API key is stored locally and never sent to our servers.
          </p>
        </div>
        
        {/* Model Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium dark:text-white">
            Claude Model
          </label>
          <select
            className="w-full p-2 rounded-md border dark:bg-gray-800 dark:text-white dark:border-gray-700"
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
          <label className="text-sm font-medium dark:text-white">
            Temperature (Creativity): {settings.temperature}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.temperature}
            onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground dark:text-gray-300">
            <span>Precise</span>
            <span>Creative</span>
          </div>
        </div>
        
        {/* Features */}
        <div className="space-y-2">
          <label className="text-sm font-medium dark:text-white">
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
                  className="mr-2 w-4 h-4 accent-primary"
                />
                <label htmlFor={feature} className="text-sm dark:text-white">
                  {feature.charAt(0).toUpperCase() + feature.slice(1)}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Indexing */}
        <div className="space-y-2 border-t pt-4 dark:border-gray-700">
          <label className="text-sm font-medium dark:text-white">
            Document Indexing
          </label>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="indexing-enabled"
              checked={settings.indexing.enabled}
              onChange={(e) => handleIndexingChange('enabled', e.target.checked)}
              className="mr-2 w-4 h-4 accent-primary"
            />
            <label htmlFor="indexing-enabled" className="text-sm dark:text-white">
              Enable document indexing for AI context
            </label>
          </div>
          
          <div className="pl-6 space-y-2">
            <select
              className="w-full p-2 rounded-md border dark:bg-gray-800 dark:text-white dark:border-gray-700"
              value={settings.indexing.frequency}
              onChange={(e) => handleIndexingChange('frequency', e.target.value as any)}
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
              className="w-full"
            >
              {indexingState.isIndexing 
                ? `Indexing (${indexingState.progress}%)` 
                : 'Index Documents Now'}
            </Button>
            
            {indexingState.lastIndexed && (
              <p className="text-xs text-muted-foreground dark:text-gray-300">
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
