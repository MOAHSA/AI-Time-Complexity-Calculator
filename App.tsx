
import React, { useState, useEffect, useCallback, CSSProperties } from 'react';
import CodeEditor from './components/CodeEditor';
import StatusBar from './components/StatusBar';
import SettingsModal from './components/SettingsModal';
import { analyzeCodeComplexity } from './services/geminiService';
import type { Language, AnalysisResult } from './types';

const App = () => {
  const [language, setLanguage] = useState<Language>('python');
  const [code, setCode] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
    const result = await analyzeCodeComplexity(code, language);
    setAnalysis(result);
    setIsLoading(false);
  }, [code, language]);
  
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };
  
  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setIsSettingsOpen(false); // Close modal on selection
  };
  
  // Example of pre-filling code for demonstration
  useEffect(() => {
    const exampleCode = {
      python: `def factorial(n):
    if n == 0:
        return 1
    else:
        return n * factorial(n-1)
`,
      java: `public int factorial(int n) {
    if (n == 0) {
        return 1;
    } else {
        return n * factorial(n - 1);
    }
}
`,
      cpp: `int factorial(int n) {
    if (n == 0) {
        return 1;
    } else {
        return n * factorial(n - 1);
    }
}
`
    };
    setCode(exampleCode[language]);
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
            onClick={runAnalysis}
            disabled={isLoading}
            className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-500 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
          >
            {isLoading && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isLoading ? 'Analyzing...' : 'Analyze'}
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-md hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
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
        />
      </main>

      <StatusBar 
        bigO={analysis?.bigO || null}
        isLoading={isLoading}
        language={language}
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
    </div>
  );
};

export default App;