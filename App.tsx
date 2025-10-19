import React, { useState, useEffect, useCallback } from 'react';
import CodeEditor from './components/CodeEditor';
import StatusBar from './components/StatusBar';
import SettingsModal from './components/SettingsModal';
import OptimizationModal from './components/OptimizationModal';
import OptimizeOptionsModal from './components/OptimizeOptionsModal';
import HelpTour from './components/HelpTour';
import HistorySidebar from './components/HistorySidebar';
import AnalysisDetailModal from './components/AnalysisDetailModal';
import { analyzeCode, optimizeCode, getLanguage, continueChat, extractCodeFromImage } from './services/geminiService';
import type {
  AnalysisHistoryItem,
  AnalysisResult,
  ChatMessage,
  ConcreteLanguage,
  Language,
  ModelPreference,
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
  pseudocode: `FUNCTION bubbleSort(array)
  n = length of array
  LOOP n-1 times
    FOR i FROM 0 TO n-2
      IF array[i] > array[i+1]
        SWAP array[i] AND array[i+1]
      ENDIF
    ENDFOR
  ENDLOOP
  RETURN array
ENDFUNCTION`,
};

const App: React.FC = () => {
    // State management
    const [code, setCode] = useState<string>(placeholderCode.python);
    const [language, setLanguage] = useState<Language>('auto');
    const [detectedLanguage, setDetectedLanguage] = useState<ConcreteLanguage | null>('python');
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
    const [isExtracting, setIsExtracting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    // UI State
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
    const [isOptimizationModalOpen, setIsOptimizationModalOpen] = useState<boolean>(false);
    const [isOptimizeOptionsModalOpen, setIsOptimizeOptionsModalOpen] = useState<boolean>(false);
    const [isAnalysisDetailModalOpen, setIsAnalysisDetailModalOpen] = useState<boolean>(false);
    const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
    const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState<boolean>(false);
    
    // Settings State
    const [theme, setTheme] = useState<string>(() => localStorage.getItem('editorTheme') || 'modern');
    const [fontFamily, setFontFamily] = useState<string>(() => localStorage.getItem('editorFontFamily') || `'Fira Code', monospace`);
    const [fontSize, setFontSize] = useState<number>(() => parseInt(localStorage.getItem('editorFontSize') || '16', 10));
    const [lineHeight, setLineHeight] = useState<number>(() => parseFloat(localStorage.getItem('editorLineHeight') || '1.5'));
    const [fontLigatures, setFontLigatures] = useState<boolean>(() => localStorage.getItem('fontLigatures') === 'true');
    const [modelPreference, setModelPreference] = useState<ModelPreference>(() => (localStorage.getItem('modelPreference') as ModelPreference) || 'quality');
    
    // History State
    const [optimizationHistory, setOptimizationHistory] = useState<OptimizationHistoryItem[]>(() => {
        try {
            const savedHistory = localStorage.getItem('optimizationHistory');
            return savedHistory ? JSON.parse(savedHistory) : [];
        } catch {
            return [];
        }
    });
    const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistoryItem[]>(() => {
        try {
            const savedHistory = localStorage.getItem('analysisHistory');
            return savedHistory ? JSON.parse(savedHistory) : [];
        } catch {
            return [];
        }
    });
    const [activeHistoryItem, setActiveHistoryItem] = useState<OptimizationHistoryItem | null>(null);
    const [isOptimizingFromHistory, setIsOptimizingFromHistory] = useState<boolean>(false);
    const [historyInitialTab, setHistoryInitialTab] = useState<'optimizations' | 'analyses'>('optimizations');

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
        localStorage.setItem('fontLigatures', fontLigatures.toString());
        localStorage.setItem('modelPreference', modelPreference);
    }, [theme, fontFamily, fontSize, lineHeight, fontLigatures, modelPreference]);
    
    // Save history to localStorage
    useEffect(() => {
        localStorage.setItem('optimizationHistory', JSON.stringify(optimizationHistory));
    }, [optimizationHistory]);
    
    useEffect(() => {
        localStorage.setItem('analysisHistory', JSON.stringify(analysisHistory));
    }, [analysisHistory]);

    // Show help on first visit
    useEffect(() => {
        const hasVisited = localStorage.getItem('hasVisited');
        if (!hasVisited) {
            setIsHelpOpen(true);
            localStorage.setItem('hasVisited', 'true');
        }
    }, []);

    const handleCodeChange = (newCode: string) => {
        setCode(newCode);
        setAnalysisResult(null); // Clear stale analysis results when code changes
    };

    const handleLanguageChange = (newLang: Language) => {
        setLanguage(newLang);
        if (newLang !== 'auto') {
            setCode(placeholderCode[newLang]);
            setDetectedLanguage(newLang);
            setAnalysisResult(null); // Reset analysis on language change
        }
    };
    
    const handleAnalyze = useCallback(async () => {
        setIsAnalyzing(true);
        setError(null);
        setAnalysisResult(null);
        
        try {
            const lang = await getLanguage(code, language);
            setDetectedLanguage(lang);
            const result = await analyzeCode(code, lang, modelPreference);
            setAnalysisResult(result);

            const newAnalysisItem: AnalysisHistoryItem = {
                id: `${Date.now()}-${Math.random()}`,
                timestamp: Date.now(),
                originalCode: code,
                language: lang,
                result: result,
            };
            setAnalysisHistory(prev => [newAnalysisItem, ...prev.slice(0, 49)]);

        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(errorMsg);
            setAnalysisResult({ bigO: `Error: Analysis failed`, lines: [] });
        } finally {
            setIsAnalyzing(false);
        }
    }, [code, language, modelPreference]);
    
    const performOptimization = useCallback(async (codeToUse: string, langToUse: ConcreteLanguage, analysisToUse?: AnalysisResult) => {
        setIsOptimizing(true);
        setError(null);
        try {
            const optimizationResult = await optimizeCode(codeToUse, langToUse, modelPreference, analysisToUse);
            const newHistoryItem: OptimizationHistoryItem = {
                id: `${Date.now()}-${Math.random()}`,
                timestamp: Date.now(),
                originalCode: codeToUse,
                language: langToUse,
                result: optimizationResult,
                chatHistory: [],
                recommendedQuestions: optimizationResult.recommendedQuestions,
            };
            setOptimizationHistory(prev => [newHistoryItem, ...prev.slice(0, 49)]);
            setActiveHistoryItem(newHistoryItem);
            setIsOptimizationModalOpen(true);
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(errorMsg);
            setAnalysisResult({ bigO: `Error: Failed`, lines: [] });
            throw e; // Re-throw to be caught by the initiator
        } finally {
            setIsOptimizing(false);
        }
    }, [modelPreference]);
    
    const handleInitiateOptimization = useCallback(async (strategy: 'analyze' | 'direct' | 'upload' | 'history') => {
        setIsOptimizeOptionsModalOpen(false);

        if (strategy === 'history') {
            setIsOptimizingFromHistory(true);
            setHistoryInitialTab('analyses');
            setIsHistorySidebarOpen(true);
            return;
        }

        let codeToUse = code;
        let langToUse = detectedLanguage;
        let analysisToUse: AnalysisResult | null | undefined = strategy === 'direct' ? analysisResult : null;

        if (strategy === 'upload') {
            const file = await new Promise<File | null>(resolve => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.py,.java,.cpp,.txt';
                input.onchange = e => resolve((e.target as HTMLInputElement).files?.[0] ?? null);
                input.addEventListener('cancel', () => resolve(null));
                input.click();
            });
    
            if (!file) return;
    
            codeToUse = await file.text();
            handleCodeChange(codeToUse); 
            analysisToUse = null;
            langToUse = null;
        }

        setError(null);

        try {
            if (!langToUse) {
                langToUse = await getLanguage(codeToUse, language);
                setDetectedLanguage(langToUse);
            }
            
            if (strategy === 'analyze' || strategy === 'upload') {
                setIsAnalyzing(true);
                try {
                    const result = await analyzeCode(codeToUse, langToUse, modelPreference);
                    setAnalysisResult(result);
                    analysisToUse = result;
    
                    const newAnalysisItem: AnalysisHistoryItem = {
                        id: `${Date.now()}-${Math.random()}`,
                        timestamp: Date.now(),
                        originalCode: codeToUse,
                        language: langToUse,
                        result: result,
                    };
                    setAnalysisHistory(prev => [newAnalysisItem, ...prev.slice(0, 49)]);
                } finally {
                    setIsAnalyzing(false);
                }
            }

            await performOptimization(codeToUse, langToUse, analysisToUse ?? undefined);

        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(errorMsg);
            setAnalysisResult({ bigO: `Error: Failed`, lines: [] });
        }

    }, [code, language, detectedLanguage, analysisResult, performOptimization, modelPreference]);
    
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
                history: [...activeHistoryItem.chatHistory, userMessage],
                newUserMessage: message,
                answerDepth: depth,
                modelPreference,
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
            setOptimizationHistory(prev => prev.map(item => item.id === finalHistoryItem.id ? finalHistoryItem : item));

        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : 'An unknown error occurred during chat.';
            const errorMessage: ChatMessage = { role: 'model', content: `Error: ${errorMsg}`, format: 'markdown' };
            const finalHistoryItem: OptimizationHistoryItem = {
                ...activeHistoryItem,
                chatHistory: [...activeHistoryItem.chatHistory, userMessage, errorMessage]
            };
            setActiveHistoryItem(finalHistoryItem);
            setOptimizationHistory(prev => prev.map(item => item.id === finalHistoryItem.id ? finalHistoryItem : item));
        }
    };

    const handleSelectOptimizationHistoryItem = (id: string) => {
        const item = optimizationHistory.find(h => h.id === id);
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
    
    const handleSelectAnalysisHistoryItem = (id: string) => {
        const item = analysisHistory.find(h => h.id === id);
        if (item) {
            setCode(item.originalCode);
            setLanguage(item.language);
            setDetectedLanguage(item.language);
            setAnalysisResult(item.result);
            setIsHistorySidebarOpen(false);
    
            if (isOptimizingFromHistory) {
                setIsOptimizingFromHistory(false);
                performOptimization(item.originalCode, item.language, item.result);
            } else {
                setIsAnalysisDetailModalOpen(true);
            }
        }
    };
    
    const handleSave = () => {
        if (!code.trim()) return;

        const lang = detectedLanguage || 'txt';
        const extensionMap: { [key: string]: string } = { python: 'py', java: 'java', cpp: 'cpp', pseudocode: 'txt', txt: 'txt' };
        const extension = extensionMap[lang] || 'txt';
        const filename = `code.${extension}`;

        const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleUpload = async () => {
        const file = await new Promise<File | null>(resolve => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.py,.java,.cpp,.txt,.c,.h,.hpp,.cc';
            input.onchange = e => resolve((e.target as HTMLInputElement).files?.[0] ?? null);
            input.addEventListener('cancel', () => resolve(null));
            input.click();
        });

        if (!file) return;

        const newCode = await file.text();
        const extension = file.name.split('.').pop()?.toLowerCase();
        let newLang: Language = 'auto';

        if (extension === 'py') newLang = 'python';
        else if (extension === 'java') newLang = 'java';
        else if (['cpp', 'c', 'h', 'hpp', 'cc'].includes(extension || '')) newLang = 'cpp';
        
        setCode(newCode);
        setLanguage(newLang);
        if (newLang !== 'auto') {
            setDetectedLanguage(newLang);
        } else {
            setDetectedLanguage(null);
        }
        setAnalysisResult(null);
    };

    const handleExtractFromImage = async () => {
        const file = await new Promise<File | null>(resolve => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = e => resolve((e.target as HTMLInputElement).files?.[0] ?? null);
            input.addEventListener('cancel', () => resolve(null));
            input.click();
        });

        if (!file) return;

        setIsExtracting(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            await new Promise<void>((resolve, reject) => {
                reader.onload = async () => {
                    try {
                        const base64Data = (reader.result as string).split(',')[1];
                        const imageData = { mimeType: file.type, data: base64Data };
                        const extractedCode = await extractCodeFromImage(imageData);
                        setCode(extractedCode);
                        // Reset language to auto-detect the new code
                        setLanguage('auto');
                        setDetectedLanguage(null);
                        resolve();
                    } catch (e) {
                        reject(e);
                    }
                };
                reader.onerror = error => reject(error);
            });
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : 'Failed to extract code from image.';
            setError(errorMsg);
            setAnalysisResult({ bigO: `Error: ${errorMsg}`, lines: [] });
        } finally {
            setIsExtracting(false);
        }
    };

    const handleResetSettings = () => {
        setTheme('modern');
        setFontFamily(`'Fira Code', monospace`);
        setFontSize(16);
        setLineHeight(1.5);
        setFontLigatures(false);
        setModelPreference('quality');
        // Clear from localStorage as well
        localStorage.removeItem('editorTheme');
        localStorage.removeItem('editorFontFamily');
        localStorage.removeItem('editorFontSize');
        localStorage.removeItem('editorLineHeight');
        localStorage.removeItem('fontLigatures');
        localStorage.removeItem('modelPreference');
    };
    
    return (
        <div className="flex flex-col h-screen font-sans">
            <main className="flex-grow flex flex-row overflow-hidden">
                <CodeEditor
                    code={code}
                    onCodeChange={handleCodeChange}
                    analysisLines={analysisResult?.lines || []}
                    language={detectedLanguage}
                    fontFamily={fontFamily}
                    fontSize={fontSize}
                    lineHeight={lineHeight}
                    theme={theme}
                    fontLigatures={fontLigatures}
                />
            </main>
            <StatusBar
                language={language}
                detectedLanguage={detectedLanguage}
                analysisResult={analysisResult}
                bigO={analysisResult?.bigO || (error ? "Error" : null)}
                isAnalyzing={isAnalyzing}
                isOptimizing={isOptimizing}
                isExtracting={isExtracting}
                isCodeEmpty={!code.trim()}
                onAnalyze={handleAnalyze}
                onOptimize={() => setIsOptimizeOptionsModalOpen(true)}
                onShowAnalysis={() => setIsAnalysisDetailModalOpen(true)}
                onSettings={() => setIsSettingsModalOpen(true)}
                onHelp={() => setIsHelpOpen(true)}
                onToggleHistory={() => {
                    setHistoryInitialTab('optimizations');
                    setIsHistorySidebarOpen(p => !p);
                }}
                onUpload={handleUpload}
                onSave={handleSave}
                onExtractFromImage={handleExtractFromImage}
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
                    fontLigatures={fontLigatures}
                    onFontLigaturesChange={setFontLigatures}
                    modelPreference={modelPreference}
                    onModelPreferenceChange={setModelPreference}
                    onReset={handleResetSettings}
                    onClose={() => setIsSettingsModalOpen(false)}
                />
            )}
            {isOptimizeOptionsModalOpen && (
                <OptimizeOptionsModal
                    onClose={() => setIsOptimizeOptionsModalOpen(false)}
                    onSelectStrategy={handleInitiateOptimization}
                    hasAnalysis={!!analysisResult}
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
                optimizationHistory={optimizationHistory}
                analysisHistory={analysisHistory}
                initialTab={historyInitialTab}
                onSelectOptimization={handleSelectOptimizationHistoryItem}
                onSelectAnalysis={handleSelectAnalysisHistoryItem}
                onClose={() => setIsHistorySidebarOpen(false)}
            />
        </div>
    );
};

export default App;