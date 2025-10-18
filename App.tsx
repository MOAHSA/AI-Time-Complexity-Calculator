import React, { useState, useCallback } from 'react';
import CodeEditor from './components/CodeEditor';
import StatusBar from './components/StatusBar';
import { analyzeCodeComplexity } from './services/geminiService';
import type { AnalysisResult, Language } from './types';

const pythonPlaceholder = `def example_function(n):
  # Time Complexity Calculator
  count = 0
  i = 1
  while i < n:
    for j in range(n):
      count += 1
    i *= 2
  return count
`;

const javaPlaceholder = `class Solution {
    // Time Complexity Calculator
    public int exampleFunction(int n) {
        int count = 0;
        for (int i = 0; i < n; i++) {
            for (int j = i; j < n; j++) {
                count++;
            }
        }
        return count;
    }
}
`;

function App() {
  const [language, setLanguage] = useState<Language>('python');
  const [code, setCode] = useState<string>(pythonPlaceholder);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setCode(lang === 'python' ? pythonPlaceholder : javaPlaceholder);
    setAnalysisResult(null); // Clear previous results
  };

  const triggerAnalysis = useCallback(async (codeToAnalyze: string, lang: Language) => {
    if (!codeToAnalyze.trim()) {
      setAnalysisResult({ bigO: 'O(1)', lines: [] });
      return;
    }
    setIsLoading(true);
    setAnalysisResult(null); // Clear old results before fetching new
    const result = await analyzeCodeComplexity(codeToAnalyze, lang);
    setAnalysisResult(result);
    setIsLoading(false);
  }, []);

  const handleAnalyzeClick = () => {
    triggerAnalysis(code, language);
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col p-4 text-white">
      <div className="w-full max-w-7xl mx-auto flex flex-col h-full">
        <header className="text-center mb-4 shrink-0">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            AI Time Complexity Calculator
          </h1>
          <p className="mt-1 text-md text-gray-400">
            Get real-time Big O notation and line execution counts for your code.
          </p>
        </header>

        <div className="bg-gray-800 rounded-t-lg p-3 flex justify-between items-center border-b border-gray-700 shrink-0">
          <div className="flex space-x-2">
            {(['python', 'java'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  language === lang
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={handleAnalyzeClick}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-bold rounded-md transition-colors duration-200 bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Analyze'
            )}
          </button>
        </div>
        
        <main className="flex-grow w-full flex flex-col shadow-2xl rounded-b-lg min-h-0">
          <div className="flex-grow h-0">
            <CodeEditor
              code={code}
              onCodeChange={handleCodeChange}
              language={language}
              analysisResult={analysisResult}
            />
          </div>
          <StatusBar bigO={analysisResult?.bigO || null} isLoading={isLoading} />
        </main>
      </div>
    </div>
  );
}

export default App;
