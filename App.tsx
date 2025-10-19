
import React, { useState, useCallback, useEffect } from 'react';
import CodeEditor from './components/CodeEditor';
import StatusBar from './components/StatusBar';
import SettingsModal from './components/SettingsModal';
import OptimizationModal from './components/OptimizationModal';
import HelpTour from './components/HelpTour';
import { analyzeCodeComplexity, getOptimizationSuggestion, detectLanguage } from './services/geminiService';
import type { Language, ConcreteLanguage, AnalysisResult, OptimizationResult } from './types';

const defaultCode = `// Welcome to the AI-Powered Code Complexity Analyzer!
// 1. Paste your code here.
// 2. Click "Analyze" to see the Big O and line-by-line complexity.
// 3. Click "Optimize" for AI-powered suggestions.

function exampleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // Swap elements
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}`;

const App: React.FC = () => {
  // Persisted State
  const [fontFamily, setFontFamily] = useState(() => localStorage.getItem('fontFamily') || `'Fira Code', monospace`);
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem('fontSize')) || 16);
  const [lineHeight, setLineHeight] = useState(() => Number(localStorage.getItem('lineHeight')) || 1.6);
  const [hasSeenHelp, setHasSeenHelp] = useState(() => localStorage.getItem('hasSeenHelp') === 'true');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'modern');

  // Session State
  const [code, setCode] = useState<string>(defaultCode);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [language, setLanguage] = useState<Language>('auto');
  const [detectedLanguage, setDetectedLanguage] = useState<ConcreteLanguage | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);
  const [isOptimizationModalOpen, setOptimizationModalOpen] = useState<boolean>(false);
  const [isHelpTourOpen, setHelpTourOpen] = useState<boolean>(!hasSeenHelp);

  useEffect(() => { localStorage.setItem('fontFamily', fontFamily); }, [fontFamily]);
  useEffect(() => { localStorage.setItem('fontSize', String(fontSize)); }, [fontSize]);
  useEffect(() => { localStorage.setItem('lineHeight', String(lineHeight)); }, [lineHeight]);
  useEffect(() => { if (hasSeenHelp) localStorage.setItem('hasSeenHelp', 'true'); }, [hasSeenHelp]);
  useEffect(() => { 
    localStorage.setItem('theme', theme);
    document.documentElement.className = `theme-${theme}`;
  }, [theme]);

  const handleAnalysis = useCallback(async () => {
    setIsLoading(true);
    setAnalysisResult(null);

    let langToUse: ConcreteLanguage | null = detectedLanguage;

    if (language === 'auto') {
      const detected = await detectLanguage(code);
      if (!detected) {
        setAnalysisResult({ bigO: "Error", lines: [{lineNumber: 1, analysis: "Could not detect language. Please select one in Settings."}] });
        setIsLoading(false);
        return;
      }
      setDetectedLanguage(detected);
      langToUse = detected;
    } else {
        langToUse = language;
        setDetectedLanguage(language);
    }
    
    if (langToUse) {
        const result = await analyzeCodeComplexity(code, langToUse);
        setAnalysisResult(result);
    }
    
    setIsLoading(false);
  }, [code, language, detectedLanguage]);

  const handleOptimization = useCallback(async () => {
    if (!detectedLanguage) {
      alert("Please analyze the code first to detect the language.");
      return;
    }
    setIsLoading(true);
    const result = await getOptimizationSuggestion(code, detectedLanguage);
    setOptimizationResult(result);
    setOptimizationModalOpen(true);
    setIsLoading(false);
  }, [code, detectedLanguage]);

  const closeHelpTour = () => {
    setHelpTourOpen(false);
    setHasSeenHelp(true);
  }

  return (
    <div className="bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col h-screen font-sans">
      <main className="flex-grow flex items-stretch">
        <CodeEditor 
          code={code}
          onCodeChange={setCode}
          analysisLines={analysisResult?.lines ?? []}
          fontFamily={fontFamily}
          fontSize={fontSize}
          lineHeight={lineHeight}
        />
      </main>

      <StatusBar
        language={language}
        detectedLanguage={detectedLanguage}
        bigO={analysisResult?.bigO ?? null}
        isLoading={isLoading}
        onAnalyze={handleAnalysis}
        onOptimize={handleOptimization}
        onSettings={() => setSettingsModalOpen(true)}
        onHelp={() => setHelpTourOpen(true)}
      />

      {isSettingsModalOpen && (
        <SettingsModal
          currentLanguage={language}
          onLanguageChange={setLanguage}
          currentTheme={theme}
          onThemeChange={setTheme}
          fontFamily={fontFamily}
          onFontFamilyChange={setFontFamily}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          lineHeight={lineHeight}
          onLineHeightChange={setLineHeight}
          onClose={() => setSettingsModalOpen(false)}
        />
      )}

      {isOptimizationModalOpen && (
          <OptimizationModal
              result={optimizationResult}
              onClose={() => setOptimizationModalOpen(false)}
          />
      )}

      {isHelpTourOpen && (
          <HelpTour onClose={closeHelpTour} />
      )}
    </div>
  );
};

export default App;