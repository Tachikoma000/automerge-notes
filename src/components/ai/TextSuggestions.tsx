import React, { useState, useEffect, useRef } from 'react';
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
  // State for analysis results and UI
  const [analysis, setAnalysis] = useState<TextAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isLocked, setIsLocked] = useState(false);
  const [backgroundAnalysis, setBackgroundAnalysis] = useState(false);
  const [lastAnalyzedText, setLastAnalyzedText] = useState("");
  
  // Debounce timer reference
  const analyzeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const significantChangeTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track whether there has been a significant change
  const hasSignificantChanges = (currentText: string, previousText: string) => {
    // If there's a big length difference (>10% change)
    if (Math.abs(currentText.length - previousText.length) > previousText.length * 0.1) {
      return true;
    }
    
    // If there are new paragraphs or sentences
    const currentParagraphs = currentText.split('\n\n').length;
    const previousParagraphs = previousText.split('\n\n').length;
    
    if (currentParagraphs !== previousParagraphs) {
      return true;
    }
    
    // Consider adding more complex diff algorithms if needed
    return false;
  };
  
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
  
  // Debounced analysis with significant change detection
  useEffect(() => {
    // Don't analyze if locked
    if (isLocked) return;
    
    // Clear existing timers
    if (analyzeTimerRef.current) {
      clearTimeout(analyzeTimerRef.current);
    }
    
    if (significantChangeTimerRef.current) {
      clearTimeout(significantChangeTimerRef.current);
    }
    
    // Check if text meets minimum requirements
    if (!text || text.trim().length <= 20) {
      if (analysis !== null) {
        setAnalysis(null);
      }
      return;
    }
    
    // Set a longer timer (3 seconds) for background analysis indicator
    significantChangeTimerRef.current = setTimeout(() => {
      // Only update background analysis state if we have previous analysis
      if (analysis && !isLoading) {
        setBackgroundAnalysis(true);
      }
    }, 1000);
    
    // Set a longer timer (4 seconds) for actual analysis
    analyzeTimerRef.current = setTimeout(() => {
      // Check if there have been significant changes since last analysis
      const shouldAnalyze = !lastAnalyzedText || hasSignificantChanges(text, lastAnalyzedText);
      
      if (shouldAnalyze) {
        performAnalysis();
      } else {
        setBackgroundAnalysis(false);
      }
    }, 4000);
    
    return () => {
      if (analyzeTimerRef.current) {
        clearTimeout(analyzeTimerRef.current);
      }
      if (significantChangeTimerRef.current) {
        clearTimeout(significantChangeTimerRef.current);
      }
    };
  }, [text, analysisOptions, isLocked]);
  
  // Perform analysis
  const performAnalysis = async () => {
    setIsLoading(true);
    setBackgroundAnalysis(false);
    
    try {
      const result = await textAnalysisService.analyzeText(text, analysisOptions);
      setAnalysis(result);
      setLastAnalyzedText(text);
    } catch (error) {
      console.error('Error analyzing text:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Force manual analysis
  const handleManualAnalysis = () => {
    setIsLocked(false);
    performAnalysis();
  };
  
  // Toggle lock
  const toggleLock = () => {
    setIsLocked(!isLocked);
  };
  
  // No suggestions yet
  if (!analysis && !isLoading) {
    return (
      <Card className="mt-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-center flex-col gap-2">
            <p className="text-sm text-muted-foreground">Waiting for enough text to analyze...</p>
            <Button size="sm" onClick={handleManualAnalysis} disabled={text.trim().length <= 20}>
              Analyze Now
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Initial loading
  if (!analysis && isLoading) {
    return (
      <Card className="mt-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm text-muted-foreground">Analyzing your text...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Filtered suggestions
  const currentSuggestions = activeTab === 'all' 
    ? (analysis?.suggestions || [])
    : groupedSuggestions[activeTab] || [];
  
  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <div className="flex items-center">
            <span>Suggestions ({analysis?.suggestions.length || 0})</span>
            {isLoading || backgroundAnalysis ? (
              <div className="ml-2 flex items-center">
                <svg className="animate-spin h-4 w-4 text-primary mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-xs text-muted-foreground">{backgroundAnalysis ? "Detecting changes..." : "Updating..."}</span>
              </div>
            ) : null}
          </div>
          <div className="flex space-x-1">
            <Button 
              variant={isLocked ? "default" : "outline"} 
              size="sm" 
              onClick={toggleLock}
              title={isLocked ? "Unlock suggestions (allow auto-update)" : "Lock suggestions (prevent auto-update)"}
              className="h-7 w-7 p-0"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                {isLocked ? (
                  <>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </>
                ) : (
                  <>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                  </>
                )}
              </svg>
            </Button>
            <Button variant="outline" size="sm" onClick={handleManualAnalysis} className="h-7">
              Refresh
            </Button>
          </div>
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
