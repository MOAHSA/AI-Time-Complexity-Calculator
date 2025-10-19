import React, { useState, useEffect } from 'react';
import type { OptimizationHistoryItem, AnalysisHistoryItem } from '../types';

interface HistorySidebarProps {
  isVisible: boolean;
  optimizationHistory: OptimizationHistoryItem[];
  analysisHistory: AnalysisHistoryItem[];
  initialTab: 'optimizations' | 'analyses';
  onSelectOptimization: (id: string) => void;
  onSelectAnalysis: (id: string) => void;
  onClose: () => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ 
  isVisible, 
  optimizationHistory, 
  analysisHistory,
  initialTab,
  onSelectOptimization, 
  onSelectAnalysis, 
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState<'optimizations' | 'analyses'>(initialTab);

  useEffect(() => {
    if (isVisible) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isVisible]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };
  
  return (
    <aside className={`history-sidebar ${isVisible ? 'visible' : ''} fixed top-0 right-0 h-full w-80 bg-[var(--bg-primary)] border-l border-[var(--border-primary)] shadow-lg z-40 flex flex-col`}>
      <div className="p-4 border-b border-[var(--border-primary)] flex justify-between items-center flex-shrink-0">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">History</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
          aria-label="Close history"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="p-2 border-b border-[var(--border-primary)] grid grid-cols-2 gap-2 flex-shrink-0">
        <button 
          onClick={() => setActiveTab('optimizations')}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === 'optimizations' ? 'bg-[var(--bg-interactive)] text-[var(--text-on-interactive)]' : 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'}`}
        >
          Optimizations
        </button>
        <button 
          onClick={() => setActiveTab('analyses')}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === 'analyses' ? 'bg-[var(--bg-interactive)] text-[var(--text-on-interactive)]' : 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'}`}
        >
          Analyses
        </button>
      </div>

      <div className="overflow-y-auto flex-grow">
        {activeTab === 'optimizations' && (
          optimizationHistory.length === 0 ? (
            <p className="text-center text-[var(--text-tertiary)] p-6">Your optimization history will appear here.</p>
          ) : (
            <ul className="divide-y divide-[var(--border-primary)]">
              {optimizationHistory.map(item => (
                <li key={item.id}>
                  <button 
                    onClick={() => onSelectOptimization(item.id)}
                    className="w-full text-left p-4 hover:bg-[var(--bg-secondary)] transition-colors"
                  >
                    <p className="font-mono text-sm text-[var(--text-primary)] truncate">
                      {item.originalCode.split('\n')[0] || 'Untitled'}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-[var(--text-tertiary)]">{formatDate(item.timestamp)}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.result.optimized ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'}`}>
                        {item.result.optimized ? 'Optimal' : 'Suggestion'}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )
        )}
        {activeTab === 'analyses' && (
          analysisHistory.length === 0 ? (
            <p className="text-center text-[var(--text-tertiary)] p-6">Your analysis history will appear here.</p>
          ) : (
            <ul className="divide-y divide-[var(--border-primary)]">
              {analysisHistory.map(item => (
                <li key={item.id}>
                  <button 
                    onClick={() => onSelectAnalysis(item.id)}
                    className="w-full text-left p-4 hover:bg-[var(--bg-secondary)] transition-colors"
                  >
                    <p className="font-mono text-sm text-[var(--text-primary)] truncate">
                      {item.originalCode.split('\n')[0] || 'Untitled'}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-[var(--text-tertiary)]">{formatDate(item.timestamp)}</span>
                       <span className={`font-mono text-xs px-2 py-0.5 rounded-full ${item.result.bigO.startsWith('Error') ? 'bg-[var(--error-bg)] text-[var(--text-on-interactive)]' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`}>
                          {item.result.bigO}
                       </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )
        )}
      </div>
    </aside>
  );
};

export default HistorySidebar;