import React from 'react';
import type { Language, ConcreteLanguage } from '../types';

interface StatusBarProps {
  bigO: string | null;
  isLoading: boolean;
  language: Language;
  activeLanguage: ConcreteLanguage;
}

const StatusBar: React.FC<StatusBarProps> = ({ bigO, isLoading, language, activeLanguage }) => {
  const capitalize = (s: string) => {
    if (!s) return '';
    if (s === 'cpp') return 'C++';
    if (s === 'auto') return 'Auto';
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  const hasError = bigO === "Error";
  const barClasses = hasError 
    ? 'bg-red-900/50 border-red-700/50 text-red-300' 
    : 'bg-gray-900 border-gray-700 text-gray-400';

  return (
    <div className={`w-full ${barClasses} border-t px-4 py-2 flex items-center justify-between text-sm shrink-0 transition-colors duration-300`}>
      <div>
        {isLoading ? (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-400" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Analyzing...</span>
          </div>
        ) : (
          <span>
            Language: <span className={`font-semibold ${hasError ? 'text-red-200' : 'text-gray-300'}`}>{capitalize(language)}</span>
            {language === 'auto' && !hasError && bigO && (
                <span className="text-gray-500 ml-2">(Detected: {capitalize(activeLanguage)})</span>
            )}
          </span>
        )}
      </div>
      <div className="font-bold text-lg">
        {bigO && !hasError && <span className="text-indigo-400">{bigO}</span>}
        {hasError && <span className="text-red-400">Analysis Failed</span>}
      </div>
    </div>
  );
};

export default StatusBar;
