import React, { useState, useEffect, useCallback } from 'react';
import CodeEditor from './components/CodeEditor';
import StatusBar from './components/StatusBar';
import SettingsModal from './components/SettingsModal';
import { analyzeCodeComplexity } from './services/geminiService';
import type { AnalysisResult, Language } from './types';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('python');
  const [code, setCode] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const runAnalysis = useCallback(async () => {
    if (!code.trim()) {
      setAnalysis({ bigO: 'O(1)', lines: [] });
      return;
    }

    setIsLoading(true);
    // Clear previous line analysis for better UX, but keep BigO if available
    setAnalysis(prev => ({ bigO: prev?.bigO ?? '...', lines: [] }));
    try {
      const result = await analyzeCodeComplexity(code, language);
      setAnalysis(result);
    } catch (error) {
      console.error("Analysis failed:", error);
      setAnalysis({ bigO: 'Error', lines: [{ lineNumber: 1, analysis: 'An unexpected error occurred.' }] });
    } finally {
      setIsLoading(false);
    }
  }, [code, language]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };
  
  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setAnalysis(null); // Clear analysis when language changes
    setIsSettingsOpen(false); // Close modal on selection
  };
  
  const placeholderCode = {
    python: `def fibonacci(n):
  if n <= 1:
    return n
  a, b = 0, 1
  for _ in range(n - 1):
    a, b = b, a + b
  return b`,
    java: `class Solution {
    public int fibonacci(int n) {
        if (n <= 1) {
            return n;
        }
        int a = 0, b = 1;
        for (int i = 0; i < n - 1; i++) {
            int temp = a;
            a = b;
            b = temp + b;
        }
        return b;
    }
}`,
    cpp: `#include <iostream>

int fibonacci(int n) {
    if (n <= 1) {
        return n;
    }
    int a = 0, b = 1;
    for (int i = 0; i < n - 1; ++i) {
        int temp = a;
        a = b;
        b = temp + b;
    }
    return b;
}`
  };
  
  useEffect(() => {
    setCode(placeholderCode[language]);
    setAnalysis(null); // Also clear analysis when placeholder code loads
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);


  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 font-sans">
      <header className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700 shrink-0">
        <h1 className="text-xl font-bold text-indigo-400">
          Big O Analyzer <span className="text-sm font-normal text-gray-400">with Gemini</span>
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={runAnalysis}
            disabled={isLoading || !code.trim()}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:bg-indigo-500/50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              'Analyze'
            )}
          </button>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Open settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-grow flex flex-col min-h-0">
        <CodeEditor
          code={code}
          onCodeChange={handleCodeChange}
          analysisLines={analysis?.lines ?? []}
        />
        <StatusBar
          bigO={analysis?.bigO ?? null}
          isLoading={isLoading}
          language={language}
        />
      </main>

      {isSettingsOpen && (
        <SettingsModal
          currentLanguage={language}
          onLanguageChange={handleLanguageChange}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
};

export default App;