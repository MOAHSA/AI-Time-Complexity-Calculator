import React, { useState, useEffect, useCallback, CSSProperties } from 'react';
import CodeEditor from './components/CodeEditor';
import StatusBar from './components/StatusBar';
import SettingsModal from './components/SettingsModal';
import OptimizationModal from './components/OptimizationModal';
import { analyzeCodeComplexity, getOptimizationSuggestion, detectLanguage } from './services/geminiService';
import type { Language, AnalysisResult, OptimizationResult, ConcreteLanguage } from './types';

const App = () => {
  const [language, setLanguage] = useState<Language>('auto');
  const [activeLanguage, setActiveLanguage] = useState<ConcreteLanguage>('python');
  const [code, setCode] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOptimizationOpen, setIsOptimizationOpen] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);


  // Font settings state
  const [fontFamily, setFontFamily] = useState(`'Fira Code', monospace`);
  const [fontSize, setFontSize] = useState(16); // in pixels
  const [lineHeight, setLineHeight] = useState(1.6); // multiplier
  
  const runAnalysis = useCallback(async () => {
    if (!code.trim()) {
      setAnalysis({ bigO: 'O(1)', lines: [] });
      return;
    }
    setIsLoading(true);
    setAnalysis(null);

    try {
      const langToAnalyze = language === 'auto' ? (await detectLanguage(code)) : language;

      if (!langToAnalyze) {
        throw new Error("Could not detect language. Please select a language manually.");
      }
      setActiveLanguage(langToAnalyze);

      const result = await analyzeCodeComplexity(code, langToAnalyze);
      setAnalysis(result);
    } catch(e) {
      const error = e as Error;
      setAnalysis({ bigO: "Error", lines: [{ lineNumber: 1, analysis: `Analysis failed: ${error.message}` }] });
    } finally {
      setIsLoading(false);
    }
  }, [code, language]);

  const handleSuggestOptimization = useCallback(async () => {
    if (!code.trim()) return;
    setIsLoading(true);
    setIsOptimizationOpen(true);
    setOptimizationResult(null); // Clear previous results

    try {
      const langToAnalyze = language === 'auto' ? (await detectLanguage(code)) : language;

      if (!langToAnalyze) {
        throw new Error("Could not detect language. Please select a language manually.");
      }
       setActiveLanguage(langToAnalyze);

      const result = await getOptimizationSuggestion(code, langToAnalyze);
      setOptimizationResult(result);
    } catch(e) {
      const error = e as Error;
       setOptimizationResult({ optimized: false, suggestion: `Optimization failed: ${error.message}` });
    } finally {
      setIsLoading(false);
    }
  }, [code, language]);
  
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };
  
  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setIsSettingsOpen(false); // Close modal on selection
  };
  
  useEffect(() => {
    if (language === 'auto') {
      setCode('');
      setAnalysis(null);
      return;
    }

    const exampleCode = {
      python: `def inefficient_sum(n):
    # This function calculates the sum of numbers from 0 to n-1
    # using a slow, nested loop approach (O(n^2)).
    total = 0
    for i in range(n):
        for j in range(i):
            total += 1
    return total
`,
      java: `public int inefficientSum(int n) {
    // This function calculates the sum of numbers from 0 to n-1
    // using a slow, nested loop approach (O(n^2)).
    int total = 0;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < i; j++) {
            total++;
        }
    }
    return total;
}
`,
      cpp: `int inefficientSum(int n) {
    // This function calculates the sum of numbers from 0 to n-1
    // using a slow, nested loop approach (O(n^2)).
    int total = 0;
    for (int i = 0; i < n; ++i) {
        for (int j = 0; j < i; ++j) {
            total++;
        }
    }
    return total;
}
`
    };
    setCode(exampleCode[language]);
    setActiveLanguage(language);
    setAnalysis(null); // Clear previous analysis on language change
  }, [language]);


  return (
    <div 
      className="flex flex-col h-screen bg-gray-900 text-gray-100 font-sans"
      style={{
        '--font-family': fontFamily,
        '--font-size': `${fontSize}px`,
        '--line-height': lineHeight,
      } as CSSProperties}
    >
      <header className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700 shrink-0">
        <h1 className="text-xl font-bold text-indigo-400">
          Big O Analyzer <span className="text-sm font-normal text-gray-400">with Gemini</span>
        </h1>
        <div className="flex items-center gap-4">
           <button
            onClick={handleSuggestOptimization}
            disabled={isLoading}
            className="p-2 rounded-md hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Suggest Optimization"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
          </button>
          <button
            onClick={runAnalysis}
            disabled={isLoading}
            className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-500 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
          >
            {isLoading && !isOptimizationOpen && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isLoading && !isOptimizationOpen ? 'Analyzing...' : 'Analyze'}
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            disabled={isLoading}
            className="p-2 rounded-md hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:opacity-50"
            title="Settings"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-grow flex flex-col min-h-0">
        <CodeEditor 
          code={code} 
          onCodeChange={handleCodeChange}
          analysisLines={analysis?.lines || []}
          language={activeLanguage}
        />
      </main>

      <StatusBar 
        bigO={analysis?.bigO || null}
        isLoading={isLoading && !isOptimizationOpen}
        language={language}
        activeLanguage={activeLanguage}
      />

      {isSettingsOpen && (
        <SettingsModal
          currentLanguage={language}
          onLanguageChange={handleLanguageChange}
          fontFamily={fontFamily}
          onFontFamilyChange={setFontFamily}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          lineHeight={lineHeight}
          onLineHeightChange={setLineHeight}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {isOptimizationOpen && (
        <OptimizationModal
          isLoading={isLoading}
          result={optimizationResult}
          onClose={() => setIsOptimizationOpen(false)}
        />
      )}
    </div>
  );
};

export default App;