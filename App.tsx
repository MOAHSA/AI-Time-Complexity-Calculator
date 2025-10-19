import React, { useState, useEffect } from 'react';
import CodeEditor from './components/CodeEditor';
import StatusBar from './components/StatusBar';
import SettingsModal from './components/SettingsModal';
import OptimizationModal from './components/OptimizationModal';
import HistorySidebar from './components/HistorySidebar';
import HelpTour from './components/HelpTour';
import { analyzeCode, optimizeCode, getLanguage, continueChat } from './services/geminiService';
import type { OptimizationResult, Language, ConcreteLanguage, LineAnalysis, OptimizationHistoryItem } from './types';

const defaultCode = `def find_sum(numbers):
    total = 0
    for number in numbers:
        total += number
    return total

# Example usage:
my_list = [1, 2, 3, 4, 5]
print(find_sum(my_list))`;

function App() {
  const [code, setCode] = useState<string>(() => localStorage.getItem('code') || defaultCode);
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('language') as Language) || 'auto');
  const [detectedLanguage, setDetectedLanguage] = useState<ConcreteLanguage | null>(null);
  
  const [bigO, setBigO] = useState<string | null>(null);
  const [analysisLines, setAnalysisLines] = useState<LineAnalysis[]>([]);
  
  const [optimizationHistory, setOptimizationHistory] = useState<OptimizationHistoryItem[]>(() => JSON.parse(localStorage.getItem('optimizationHistory') || '[]'));
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  
  // Modal states
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isOptimizationOpen, setIsOptimizationOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(() => !localStorage.getItem('hasSeenHelp'));
  const [isHistoryVisible, setIsHistoryVisible] = useState<boolean>(false);

  // Editor settings
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('theme') || 'modern');
  const [fontFamily, setFontFamily] = useState<string>(() => localStorage.getItem('fontFamily') || `'Fira Code', monospace`);
  const [fontSize, setFontSize] = useState<number>(() => Number(localStorage.getItem('fontSize')) || 16);
  const [lineHeight, setLineHeight] = useState<number>(() => Number(localStorage.getItem('lineHeight')) || 1.6);
  
  // Save settings to localStorage
  useEffect(() => { localStorage.setItem('code', code); }, [code]);
  useEffect(() => { localStorage.setItem('language', language); }, [language]);
  useEffect(() => {
    document.documentElement.className = `theme-${theme}`;
    localStorage.setItem('theme', theme);
  }, [theme]);
  useEffect(() => { localStorage.setItem('fontFamily', fontFamily); }, [fontFamily]);
  useEffect(() => { localStorage.setItem('fontSize', String(fontSize)); }, [fontSize]);
  useEffect(() => { localStorage.setItem('lineHeight', String(lineHeight)); }, [lineHeight]);
  useEffect(() => { localStorage.setItem('optimizationHistory', JSON.stringify(optimizationHistory)); }, [optimizationHistory]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    setBigO(null);
    setAnalysisLines([]);
  };
  
  const handleAnalyze = async () => {
    if (isLoading || !code.trim()) return;
    setIsLoading(true);
    setBigO(null);
    setAnalysisLines([]);

    try {
      const lang = await getLanguage(code, language);
      setDetectedLanguage(lang);
      const result = await analyzeCode(code, lang);
      setBigO(result.bigO);
      setAnalysisLines(result.lines);
    } catch (error) {
      console.error('Analysis failed:', error);
      setBigO('Error: Analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptimize = async () => {
    if (isLoading || !code.trim()) return;
    setIsLoading(true);

    try {
      const lang = detectedLanguage || (await getLanguage(code, language));
      if (!detectedLanguage) setDetectedLanguage(lang);
      
      const result: OptimizationResult = await optimizeCode(code, lang);
      
      const newHistoryItem: OptimizationHistoryItem = {
        id: `opt-${Date.now()}`,
        timestamp: Date.now(),
        originalCode: code,
        language: lang,
        result,
        chatHistory: [],
      };

      setOptimizationHistory(prev => [newHistoryItem, ...prev]);
      setActiveHistoryId(newHistoryItem.id);
      setIsOptimizationOpen(true);
    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!activeHistoryId || isChatLoading) return;
    setIsChatLoading(true);

    const currentItemIndex = optimizationHistory.findIndex(item => item.id === activeHistoryId);
    if (currentItemIndex === -1) {
        setIsChatLoading(false);
        return;
    }
    const currentItem = optimizationHistory[currentItemIndex];
    const updatedChatHistory = [...currentItem.chatHistory, { role: 'user' as const, content: message }];
    
    // Optimistically update UI with user message
    const updatedHistory = optimizationHistory.map(item => item.id === activeHistoryId ? {...item, chatHistory: updatedChatHistory} : item);
    setOptimizationHistory(updatedHistory);
    
    try {
      const modelResponse = await continueChat({
          originalCode: currentItem.originalCode,
          language: currentItem.language,
          optimizationSuggestion: currentItem.result.suggestion,
          history: currentItem.chatHistory, // send history *before* user message
          newUserMessage: message,
      });

      const finalChatHistory = [...updatedChatHistory, { role: 'model' as const, content: modelResponse }];
      const finalHistory = optimizationHistory.map(item => item.id === activeHistoryId ? {...item, chatHistory: finalChatHistory} : item);
      setOptimizationHistory(finalHistory);
    } catch (error) {
      console.error("Chat error:", error);
      const errorHistory = [...updatedChatHistory, { role: 'model' as const, content: 'Sorry, I encountered an error. Please try again.' }];
      const errorFinalHistory = optimizationHistory.map(item => item.id === activeHistoryId ? {...item, chatHistory: errorHistory} : item);
      setOptimizationHistory(errorFinalHistory);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleSelectHistoryItem = (id: string) => {
    setActiveHistoryId(id);
    setIsOptimizationOpen(true);
    setIsHistoryVisible(false);
  };

  const closeHelp = () => {
    setIsHelpOpen(false);
    localStorage.setItem('hasSeenHelp', 'true');
  }

  const activeOptimization = optimizationHistory.find(item => item.id === activeHistoryId) || null;

  return (
    <div className="flex h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">
      <div className="flex-grow flex flex-col h-full">
        <main className="flex-grow flex flex-col">
          <CodeEditor 
            code={code}
            onCodeChange={handleCodeChange}
            analysisLines={analysisLines}
            language={detectedLanguage}
            fontFamily={fontFamily}
            fontSize={fontSize}
            lineHeight={lineHeight}
          />
        </main>
        <StatusBar 
          language={language}
          detectedLanguage={detectedLanguage}
          bigO={bigO}
          isLoading={isLoading}
          onAnalyze={handleAnalyze}
          onOptimize={handleOptimize}
          onSettings={() => setIsSettingsOpen(true)}
          onHelp={() => setIsHelpOpen(true)}
          onToggleHistory={() => setIsHistoryVisible(v => !v)}
        />
      </div>
      <HistorySidebar 
          isVisible={isHistoryVisible}
          history={optimizationHistory}
          onSelect={handleSelectHistoryItem}
          onClose={() => setIsHistoryVisible(false)}
      />
      {isSettingsOpen && (
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
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
      {isOptimizationOpen && activeOptimization && (
        <OptimizationModal 
          historyItem={activeOptimization}
          onSendMessage={handleSendMessage}
          isChatLoading={isChatLoading}
          onClose={() => setIsOptimizationOpen(false)}
        />
      )}
      {isHelpOpen && <HelpTour onClose={closeHelp} />}
    </div>
  );
}

export default App;
