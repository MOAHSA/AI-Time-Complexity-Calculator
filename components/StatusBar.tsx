
import React from 'react';
import type { Language, ConcreteLanguage } from '../types';

interface StatusBarProps {
  language: Language;
  detectedLanguage: ConcreteLanguage | null;
  bigO: string | null;
  isLoading: boolean;
  onAnalyze: () => void;
  onOptimize: () => void;
  onSettings: () => void;
  onHelp: () => void;
}

const Spinner: React.FC = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const StatusBar: React.FC<StatusBarProps> = ({
  language,
  detectedLanguage,
  bigO,
  isLoading,
  onAnalyze,
  onOptimize,
  onSettings,
  onHelp
}) => {
  const languageDisplay = language === 'auto' 
    ? (detectedLanguage ? `Auto (${detectedLanguage})` : 'Auto')
    : language;
    
  return (
    <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border-primary)] p-2 flex items-center justify-between text-sm">
      <div className="flex items-center space-x-4">
        <button 
          onClick={onAnalyze}
          disabled={isLoading}
          className="flex items-center bg-[var(--bg-interactive)] hover:bg-[var(--bg-interactive-hover)] disabled:bg-[var(--bg-interactive-disabled)] disabled:cursor-not-allowed text-[var(--text-on-interactive)] font-semibold py-2 px-4 rounded-md transition-colors"
          data-tour="analyze-button"
        >
          {isLoading ? <><Spinner /> Analyzing...</> : 'Analyze'}
        </button>
        <button 
          onClick={onOptimize}
          disabled={isLoading}
          className="bg-[var(--bg-tertiary)] hover:bg-[var(--bg-quaternary)] disabled:bg-[var(--bg-secondary)] disabled:cursor-not-allowed text-[var(--text-secondary)] py-2 px-4 rounded-md transition-colors"
          data-tour="optimize-button"
        >
          Optimize
        </button>
        <div className="flex items-center space-x-2 pl-4 border-l border-[var(--border-secondary)]">
            <span className="text-[var(--text-tertiary)]">Language:</span>
            <span className="font-mono bg-[var(--bg-tertiary)] text-[var(--text-secondary)] px-2 py-1 rounded-md">{languageDisplay}</span>
        </div>
        {bigO && (
          <div className="flex items-center space-x-2">
            <span className="text-[var(--text-tertiary)]">Complexity:</span>
            <span className={`font-mono px-2 py-1 rounded-md ${bigO.startsWith('Error') ? 'bg-[var(--error-bg)] text-[var(--text-on-interactive)]' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`}>{bigO}</span>
          </div>
        )}
      </div>
      <div className="flex items-center space-x-2 text-[var(--text-secondary)]">
        <button onClick={onSettings} className="p-2 rounded-md hover:bg-[var(--bg-tertiary)] transition-colors" aria-label="Settings" data-tour="settings-button">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        </button>
        <button onClick={onHelp} className="p-2 rounded-md hover:bg-[var(--bg-tertiary)] transition-colors" aria-label="Help">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </footer>
  );
};

export default StatusBar;