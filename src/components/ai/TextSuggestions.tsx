import React, { useState, useEffect } from 'react';
import { 
  textAnalysisService, 
  TextAnalysisResult, 
  TextAnalysisSuggestion 
} from '../../lib/ai/textAnalysisService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

interface TextSuggestionsProps {
  text: string;
  onApplySuggestion: (original: string, replacement: string) => void;
  analysisOptions: {
    grammar?: boolean;
    style?: boolean;
    readability?: boolean;
    brevity?: boolean;
    cliches?: boolean;
    passiveVoice?: boolean;
    confidence?: boolean;
    citation?: boolean;
    repetition?: boolean;
    [key: string]: boolean | undefined;
  };
}

const TextSuggestions: React.FC<TextSuggestionsProps> = ({
  text,
  onApplySuggestion,
  analysisOptions
}) => {
  const [analysis, setAnalysis] = useState<TextAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // Group suggestions by type
  const groupedSuggestions = React.useMemo(() => {
    if (!analysis?.suggestions) return {};
    
    return analysis.suggestions.reduce<Record<string, TextAnalysisSuggestion[]>>((acc, suggestion) => {
      const type = suggestion.type;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(suggestion);
      return acc;
    }, { 'all': analysis.suggestions });
  }, [analysis]);
  
  // Get suggestion types for tabs
  const suggestionTypes = React.useMemo(() => {
    if (!analysis?.suggestions || analysis.suggestions.length === 0) return ['all'];
    return ['all', ...new Set(analysis.suggestions.map(s => s.type))];
  }, [analysis]);
  
  // Debounced analysis
  useEffect(() => {
    const timer = setTimeout(() => {
      if (text && text.trim().length > 20) {
        performAnalysis();
      } else {
        setAnalysis(null);
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
  
  // No suggestions or loading
  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Analyzing your text...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // No suggestions
  if (!analysis || analysis.suggestions.length === 0) {
    return null;
  }
  
  // Filtered suggestions
  const currentSuggestions = activeTab === 'all' 
    ? analysis.suggestions 
    : groupedSuggestions[activeTab] || [];
  
  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Suggestions ({analysis.suggestions.length})</span>
          <Button variant="ghost" size="sm" onClick={performAnalysis}>
            Refresh
          </Button>
        </CardTitle>
        
        {/* Tab navigation */}
        <div className="flex space-x-1 mt-2 overflow-x-auto pb-1">
          {suggestionTypes.map(type => (
            <Button
              key={type}
              variant={activeTab === type ? "default" : "outline"}
              size="sm"
              className="text-xs py-1 px-2 h-7"
              onClick={() => setActiveTab(type)}
            >
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
              {type !== 'all' && groupedSuggestions[type] && (
                <span className="ml-1 text-xs">({groupedSuggestions[type].length})</span>
              )}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {currentSuggestions.slice(0, 10).map((suggestion, index) => (
            <div key={index} className="border-b pb-2 last:border-b-0">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-medium capitalize">
                  {suggestion.type}
                </span>
                {suggestion.replacementText && (
                  <Button 
                    variant="default"
                    size="sm"
                    className="text-xs h-6 py-0 px-2"
                    onClick={() => onApplySuggestion(suggestion.text, suggestion.replacementText!)}
                  >
                    Apply
                  </Button>
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
          
          {currentSuggestions.length > 10 && (
            <p className="text-xs text-center text-muted-foreground">
              +{currentSuggestions.length - 10} more suggestions
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TextSuggestions;
