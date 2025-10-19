import React, { useState, useEffect, useCallback } from 'react';
import CodeEditor from './components/CodeEditor';
import StatusBar from './components/StatusBar';
import SettingsModal from './components/SettingsModal';
import OptimizationModal from './components/OptimizationModal';
import HelpTour from './components/HelpTour';
import HistorySidebar from './components/HistorySidebar';
import AnalysisDetailModal from './components/AnalysisDetailModal';
import { analyzeCode, optimizeCode, getLanguage, continueChat } from './services/geminiService';
import type {
  AnalysisResult,
  ChatMessage,
  ConcreteLanguage,
  Language,
  OptimizationHistoryItem,
  OptimizationResult,
} from './types';

// Default code examples
const placeholderCode = {
  python: `def find_duplicates(arr):
    duplicates = []
    for i in range(len(arr)):
        for j in range(i + 1, len(arr)):
            if arr[i] == arr[j] and arr[i] not in duplicates:
                duplicates.append(arr[i])
    return duplicates`,
  java: `import java.util.ArrayList;
import java.util.List;

public class DuplicateFinder {
    public List<Integer> findDuplicates(int[] arr) {
        List<Integer> duplicates = new ArrayList<>();
        for (int i = 0; i < arr.length; i++) {
            for (int j = i + 1; j < arr.length; j++) {
                if (arr[i] == arr[j] && !duplicates.contains(arr[i])) {
                    duplicates.add(arr[i]);
                }
            }
        }
        return duplicates;
    }
}`,
  cpp: `#include <iostream>
#include <vector>
#include <algorithm>

std::vector<int> findDuplicates(std::vector<int> arr) {
    std::vector<int> duplicates;
    for (size_t i = 0; i < arr.size(); ++i) {
        for (size_t j = i + 1; j < arr.size(); ++j) {
            if (arr[i] == arr[j]) {
                if (std::find(duplicates.begin(), duplicates.end(), arr[i]) == duplicates.end()) {
                    duplicates.push_back(arr[i]);
                }
            }
        }
    }
    return duplicates;
}`,
};

const App: React.FC = () => {
    // State management
    const [code, setCode] = useState<string>(placeholderCode.python);
    const [language, setLanguage] = useState<Language>('auto');
    const [detectedLanguage, setDetectedLanguage] = useState<ConcreteLanguage | null>('python');
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    // UI State
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
    const [isOptimizationModalOpen, setIsOptimizationModalOpen] = useState<boolean>(false);
    const [isAnalysisDetailModalOpen, setIsAnalysisDetailModalOpen] = useState<boolean>(false);
    const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
    const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState<boolean>(false);
    
    // Editor Appearance State
    const [theme, setTheme] = useState<string>(() => localStorage.getItem('editorTheme') || 'modern');
    const [fontFamily, setFontFamily] = useState<string>(() => localStorage.getItem('editorFontFamily') || `'Fira Code', monospace`);
    const [fontSize, setFontSize] = useState<number>(() => parseInt(localStorage.getItem('editorFontSize') || '16', 10));
    const [lineHeight, setLineHeight] = useState<number>(() => parseFloat(localStorage.getItem('editorLineHeight') || '1.5'));
    
    // History State
    const [history, setHistory] = useState<OptimizationHistoryItem[]>(() => {
        try {
            const savedHistory = localStorage.getItem('optimizationHistory');
            return savedHistory ? JSON.parse(savedHistory) : [];
        } catch {
            return [];
        }
    });
    const [activeHistoryItem, setActiveHistoryItem] = useState<OptimizationHistoryItem | null>(null);

    // Apply theme to the root element
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    // Save settings to localStorage
    useEffect(() => {
        localStorage.setItem('editorTheme', theme);
        localStorage.setItem('editorFontFamily', fontFamily);
        localStorage.setItem('editorFontSize', fontSize.toString());
        localStorage.setItem('editorLineHeight', lineHeight.toString());
    }, [theme, fontFamily, fontSize, lineHeight]);
    
    // Save history to localStorage
    useEffect(() => {
        localStorage.setItem('optimizationHistory', JSON.stringify(history));
    }, [history]);

    // Show help on first visit
    useEffect(() => {
        const hasVisited = localStorage.getItem('hasVisited');
        if (!hasVisited) {
            setIsHelpOpen(true);
            localStorage.setItem('hasVisited', 'true');
        }
    }, []);

    const handleLanguageChange = (newLang: Language) => {
        setLanguage(newLang);
        if (newLang !== 'auto') {
            setCode(placeholderCode[newLang]);
            setDetectedLanguage(newLang);
            setAnalysisResult(null); // Reset analysis on language change
        }
    };
    
    const handleAnalyze = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        
        try {
            const lang = await getLanguage(code, language);
            setDetectedLanguage(lang);
            const result = await analyzeCode(code, lang);
            setAnalysisResult(result);
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(errorMsg);
            setAnalysisResult({ bigO: `Error: Analysis failed`, lines: [] });
        } finally {
            setIsLoading(false);
        }
    }, [code, language]);
    
    const handleOptimize = useCallback(async () => {
        let langToUse = detectedLanguage;
        if (!langToUse) {
            if (language !== 'auto') {
                langToUse = language;
            } else {
                try {
                    setIsLoading(true);
                    langToUse = await getLanguage(code, language);
                    setDetectedLanguage(langToUse);
                } catch (e) {
                    const errorMsg = e instanceof Error ? e.message : 'An unknown error occurred.';
                    setError(errorMsg);
                    setIsLoading(false);
                    return;
                }
            }
        }
        
        if (!langToUse) {
            setError("Could not detect language. Please select one manually in Settings.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await optimizeCode(code, langToUse);
            const newHistoryItem: OptimizationHistoryItem = {
                id: `${Date.now()}-${Math.random()}`,
                timestamp: Date.now(),
                originalCode: code,
                language: langToUse,
                result: result,
                chatHistory: [],
            };
            setHistory(prev => [newHistoryItem, ...prev.slice(0, 49)]); // Keep history to 50 items
            setActiveHistoryItem(newHistoryItem);
            setIsOptimizationModalOpen(true);
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    }, [code, detectedLanguage, language]);
    
    const handleContinueChat = async (message: string, depth: 'short' | 'deep' | 'page') => {
        if (!activeHistoryItem) return;

        const userMessage: ChatMessage = { role: 'user', content: message, format: 'markdown' };
        const loadingMessage: ChatMessage = { role: 'loading', content: '...', format: 'markdown' };

        const updatedHistoryWithUserAndLoading: OptimizationHistoryItem = {
            ...activeHistoryItem,
            chatHistory: [...activeHistoryItem.chatHistory, userMessage, loadingMessage]
        };
        setActiveHistoryItem(updatedHistoryWithUserAndLoading);
        
        try {
            const response = await continueChat({
                originalCode: activeHistoryItem.originalCode,
                language: activeHistoryItem.language,
                optimizationSuggestion: activeHistoryItem.result.suggestion,
                history: [...activeHistoryItem.chatHistory, userMessage], // Send history including the new user message
                newUserMessage: message,
                answerDepth: depth,
            });
            
            const modelMessage: ChatMessage = {
                role: 'model',
                content: response,
                format: depth === 'page' ? 'html' : 'markdown',
            };
            
            const finalHistoryItem: OptimizationHistoryItem = {
                ...activeHistoryItem,
                chatHistory: [...activeHistoryItem.chatHistory, userMessage, modelMessage]
            };
            setActiveHistoryItem(finalHistoryItem);
            setHistory(prev => prev.map(item => item.id === finalHistoryItem.id ? finalHistoryItem : item));

        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : 'An unknown error occurred during chat.';
            const errorMessage: ChatMessage = { role: 'model', content: `Error: ${errorMsg}`, format: 'markdown' };
            const finalHistoryItem: OptimizationHistoryItem = {
                ...activeHistoryItem,
                chatHistory: [...activeHistoryItem.chatHistory, userMessage, errorMessage]
            };
            setActiveHistoryItem(finalHistoryItem);
            setHistory(prev => prev.map(item => item.id === finalHistoryItem.id ? finalHistoryItem : item));
        }
    };

    const handleSelectHistoryItem = (id: string) => {
        const item = history.find(h => h.id === id);
        if (item) {
            setCode(item.originalCode);
            setLanguage(item.language);
            setDetectedLanguage(item.language);
            setActiveHistoryItem(item);
            setIsOptimizationModalOpen(true);
            setIsHistorySidebarOpen(false);
            setAnalysisResult(null);
        }
    };
    
    return (
        <div className="flex flex-col h-screen font-sans">
            <main className="flex-grow flex flex-row overflow-hidden">
                <CodeEditor
                    code={code}
                    onCodeChange={setCode}
                    analysisLines={analysisResult?.lines || []}
                    language={detectedLanguage}
                    fontFamily={fontFamily}
                    fontSize={fontSize}
                    lineHeight={lineHeight}
                    theme={theme}
                />
            </main>
            <StatusBar
                language={language}
                detectedLanguage={detectedLanguage}
                analysisResult={analysisResult}
                bigO={analysisResult?.bigO || (error ? "Error" : null)}
                isLoading={isLoading}
                onAnalyze={handleAnalyze}
                onOptimize={handleOptimize}
                onShowAnalysis={() => setIsAnalysisDetailModalOpen(true)}
                onSettings={() => setIsSettingsModalOpen(true)}
                onHelp={() => setIsHelpOpen(true)}
                onToggleHistory={() => setIsHistorySidebarOpen(p => !p)}
            />
            {isSettingsModalOpen && (
                <SettingsModal
                    currentLanguage={language}
                    onLanguageChange={handleLanguageChange}
                    currentTheme={theme}
                    onThemeChange={setTheme}
                    fontFamily={fontFamily}
                    onFontFamilyChange={setFontFamily}
                    fontSize={fontSize}
                    onFontSizeChange={setFontSize}
                    lineHeight={lineHeight}
                    onLineHeightChange={setLineHeight}
                    onClose={() => setIsSettingsModalOpen(false)}
                />
            )}
            {isOptimizationModalOpen && activeHistoryItem && (
                 <OptimizationModal
                    item={activeHistoryItem}
                    onClose={() => {
                        setIsOptimizationModalOpen(false);
                        setActiveHistoryItem(null);
                    }}
                    onContinueChat={handleContinueChat}
                 />
            )}
             {isAnalysisDetailModalOpen && (
                <AnalysisDetailModal
                    code={code}
                    language={detectedLanguage}
                    analysis={analysisResult}
                    onClose={() => setIsAnalysisDetailModalOpen(false)}
                />
            )}
            {isHelpOpen && <HelpTour onClose={() => setIsHelpOpen(false)} />}
            <HistorySidebar
                isVisible={isHistorySidebarOpen}
                history={history}
                onSelect={handleSelectHistoryItem}
                onClose={() => setIsHistorySidebarOpen(false)}
            />
        </div>
    );
};

export default App;